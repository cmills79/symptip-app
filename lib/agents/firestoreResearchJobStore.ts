import {
  Timestamp,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  ResearchBriefWithMetadata,
  ResearchJobDefinition,
  ResearchJobRecord,
  ResearchJobStatus,
  ResearchJobStore,
  ResearchRunRecord,
  ResearchRunStatus,
} from '@/types/researchAutonomy';
import { calculateNextRunAt } from './scheduling';

const JOBS_COLLECTION = 'researchJobs';
const RUNS_COLLECTION = 'researchRuns';

type FirestoreJob = {
  query: string;
  includeSimilarDiseases: boolean;
  includeAiSummary: boolean;
  additionalDiseases: string[];
  schedule: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  nextRunAt?: Timestamp | null;
  lastRunAt?: Timestamp | null;
  status: ResearchJobStatus;
  error?: string | null;
};

type FirestoreRun = {
  jobId: string;
  status: ResearchRunStatus;
  startedAt: Timestamp;
  completedAt?: Timestamp | null;
  triggeredManually: boolean;
  brief?: ResearchBriefWithMetadata | null;
  knowledgeGaps: string[];
  sourceWarnings: Array<{ sourceId: string; message: string }>;
  error?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function timestampToDate(value?: Timestamp | null): Date | null {
  if (!value) {
    return null;
  }
  return value.toDate();
}

function dateToTimestamp(value?: Date | null): Timestamp | null {
  if (!value) {
    return null;
  }
  return Timestamp.fromDate(value);
}

function serializeJobInput(
  definition: ResearchJobDefinition,
  now: Date,
): Omit<FirestoreJob, 'createdAt' | 'updatedAt'> {
  const nextRunAt =
    definition.nextRunAt ??
    calculateNextRunAt(definition.schedule ?? null, { from: now }) ??
    null;

  return {
    query: definition.query,
    includeAiSummary: definition.includeAiSummary ?? true,
    includeSimilarDiseases: definition.includeSimilarDiseases ?? true,
    additionalDiseases: definition.additionalDiseases ?? [],
    schedule: definition.schedule ?? null,
    status: 'idle',
    error: null,
    nextRunAt: nextRunAt ? Timestamp.fromDate(nextRunAt) : null,
    lastRunAt: null,
  };
}

function deserializeJob(id: string, data: FirestoreJob): ResearchJobRecord {
  return {
    id,
    query: data.query,
    includeAiSummary: data.includeAiSummary,
    includeSimilarDiseases: data.includeSimilarDiseases,
    additionalDiseases: data.additionalDiseases,
    schedule: data.schedule,
    status: data.status,
    error: data.error ?? null,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    nextRunAt: timestampToDate(data.nextRunAt),
    lastRunAt: timestampToDate(data.lastRunAt),
  };
}

function serializeRunStart(
  partial: Pick<ResearchRunRecord, 'jobId' | 'startedAt' | 'status'> & {
    triggeredManually?: boolean;
  },
  now: Date,
): Omit<FirestoreRun, 'completedAt' | 'brief' | 'error'> {
  return {
    jobId: partial.jobId,
    status: partial.status,
    startedAt: Timestamp.fromDate(partial.startedAt),
    triggeredManually: Boolean(partial.triggeredManually),
    brief: null,
    knowledgeGaps: [],
    sourceWarnings: [],
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };
}

function deserializeRun(id: string, data: FirestoreRun): ResearchRunRecord {
  return {
    id,
    jobId: data.jobId,
    status: data.status,
    startedAt: data.startedAt.toDate(),
    completedAt: timestampToDate(data.completedAt),
    triggeredManually: data.triggeredManually,
    brief: data.brief ?? null,
    knowledgeGaps: data.knowledgeGaps ?? [],
    sourceWarnings: data.sourceWarnings ?? [],
    error: data.error ?? null,
  };
}

/**
 * Firestore-backed implementation of the research job store.
 */
export class FirestoreResearchJobStore implements ResearchJobStore {
  private jobsCollection = collection(db, JOBS_COLLECTION);
  private runsCollection = collection(db, RUNS_COLLECTION);

  async createJob(definition: ResearchJobDefinition): Promise<ResearchJobRecord> {
    const now = new Date();
    const docRef = doc(this.jobsCollection);
    const payload = serializeJobInput(definition, now);

    await setDoc(docRef, {
      ...payload,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });

    const snapshot = await getDoc(docRef);
    return deserializeJob(snapshot.id, snapshot.data() as FirestoreJob);
  }

  async listJobs(): Promise<ResearchJobRecord[]> {
    const snapshot = await getDocs(query(this.jobsCollection, orderBy('createdAt', 'asc')));
    return snapshot.docs.map((docSnap) =>
      deserializeJob(docSnap.id, docSnap.data() as FirestoreJob),
    );
  }

  async findDueJobs(reference: Date): Promise<ResearchJobRecord[]> {
    const comparison = Timestamp.fromDate(reference);
    const jobsQuery = query(
      this.jobsCollection,
      where('nextRunAt', '<=', comparison),
      orderBy('nextRunAt', 'asc'),
    );
    const snapshot = await getDocs(jobsQuery);
    return snapshot.docs
      .map((docSnap) => deserializeJob(docSnap.id, docSnap.data() as FirestoreJob))
      .filter((job) => job.status !== 'running');
  }

  async getJob(id: string): Promise<ResearchJobRecord | null> {
    const docRef = doc(this.jobsCollection, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    return deserializeJob(snapshot.id, snapshot.data() as FirestoreJob);
  }

  async updateJobSchedule(
    id: string,
    update: Partial<
      Pick<ResearchJobRecord, 'status' | 'lastRunAt' | 'nextRunAt' | 'error' | 'updatedAt'>
    >,
  ): Promise<ResearchJobRecord> {
    const docRef = doc(this.jobsCollection, id);
    const updatePayload: Record<string, unknown> = {
      updatedAt: Timestamp.fromDate(update.updatedAt ?? new Date()),
    };
    if (update.status) {
      updatePayload.status = update.status;
    }
    if (typeof update.error !== 'undefined') {
      updatePayload.error = update.error ?? null;
    }
    if (typeof update.lastRunAt !== 'undefined') {
      updatePayload.lastRunAt = update.lastRunAt ? Timestamp.fromDate(update.lastRunAt) : null;
    }
    if (typeof update.nextRunAt !== 'undefined') {
      updatePayload.nextRunAt = update.nextRunAt
        ? Timestamp.fromDate(update.nextRunAt)
        : deleteField();
    }

    await updateDoc(docRef, updatePayload);
    const snapshot = await getDoc(docRef);
    return deserializeJob(snapshot.id, snapshot.data() as FirestoreJob);
  }

  async startRun(
    jobId: string,
    partial: Pick<ResearchRunRecord, 'jobId' | 'startedAt' | 'status'> & {
      triggeredManually?: boolean;
    },
  ): Promise<ResearchRunRecord> {
    const now = new Date();
    const payload = serializeRunStart(partial, now);
    const runRef = await addDoc(this.runsCollection, payload);

    await updateDoc(doc(this.jobsCollection, jobId), {
      status: 'running',
      updatedAt: serverTimestamp(),
    });

    const snapshot = await getDoc(runRef);
    return deserializeRun(snapshot.id, snapshot.data() as FirestoreRun);
  }

  async completeRun(
    runId: string,
    update: Partial<
      Pick<
        ResearchRunRecord,
        'status' | 'completedAt' | 'brief' | 'knowledgeGaps' | 'sourceWarnings' | 'error'
      >
    >,
  ): Promise<ResearchRunRecord> {
    const docRef = doc(this.runsCollection, runId);
    const updatePayload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (update.status) {
      updatePayload.status = update.status;
    }
    if (typeof update.completedAt !== 'undefined') {
      updatePayload.completedAt = update.completedAt
        ? Timestamp.fromDate(update.completedAt)
        : null;
    }
    if (typeof update.brief !== 'undefined') {
      updatePayload.brief = update.brief ?? null;
    }
    if (typeof update.knowledgeGaps !== 'undefined') {
      updatePayload.knowledgeGaps = update.knowledgeGaps;
    }
    if (typeof update.sourceWarnings !== 'undefined') {
      updatePayload.sourceWarnings = update.sourceWarnings;
    }
    if (typeof update.error !== 'undefined') {
      updatePayload.error = update.error ?? null;
    }

    await updateDoc(docRef, updatePayload);
    const snapshot = await getDoc(docRef);
    return deserializeRun(snapshot.id, snapshot.data() as FirestoreRun);
  }

  async listRuns(jobId: string): Promise<ResearchRunRecord[]> {
    const runsQuery = query(
      this.runsCollection,
      where('jobId', '==', jobId),
      orderBy('startedAt', 'desc'),
    );
    const snapshot = await getDocs(runsQuery);
    return snapshot.docs.map((docSnap) =>
      deserializeRun(docSnap.id, docSnap.data() as FirestoreRun),
    );
  }
}

