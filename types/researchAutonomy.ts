import type { ResearchBrief } from './index';

export type ResearchJobStatus = 'idle' | 'running' | 'error';
export type ResearchRunStatus = 'running' | 'completed' | 'failed';

export interface ResearchBriefWithMetadata extends ResearchBrief {
  metadata?: {
    jobId: string;
    jobSchedule: string | null;
    triggeredAt: string;
  };
}

export interface ResearchJobDefinition {
  query: string;
  includeSimilarDiseases?: boolean;
  includeAiSummary?: boolean;
  additionalDiseases?: string[];
  schedule?: string | null;
  nextRunAt?: Date | null;
}

export interface ResearchJobRecord {
  id: string;
  status: ResearchJobStatus;
  query: string;
  includeSimilarDiseases: boolean;
  includeAiSummary: boolean;
  additionalDiseases: string[];
  schedule: string | null;
  createdAt: Date;
  updatedAt: Date;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
  error?: string | null;
}

export interface ResearchRunRecord {
  id: string;
  jobId: string;
  status: ResearchRunStatus;
  startedAt: Date;
  completedAt: Date | null;
  triggeredManually: boolean;
  brief: ResearchBriefWithMetadata | null;
  knowledgeGaps: string[];
  sourceWarnings: Array<{ sourceId: string; message: string }>;
  error: string | null;
}

export interface ResearchJobStore {
  createJob(definition: ResearchJobDefinition): Promise<ResearchJobRecord>;
  listJobs(): Promise<ResearchJobRecord[]>;
  findDueJobs(reference: Date): Promise<ResearchJobRecord[]>;
  getJob(id: string): Promise<ResearchJobRecord | null>;
  updateJobSchedule(
    id: string,
    update: Partial<
      Pick<ResearchJobRecord, 'status' | 'lastRunAt' | 'nextRunAt' | 'error' | 'updatedAt'>
    >,
  ): Promise<ResearchJobRecord>;
  startRun(
    jobId: string,
    partial: Pick<ResearchRunRecord, 'jobId' | 'startedAt' | 'status'> & {
      triggeredManually?: boolean;
    },
  ): Promise<ResearchRunRecord>;
  completeRun(
    runId: string,
    update: Partial<
      Pick<
        ResearchRunRecord,
        'status' | 'completedAt' | 'brief' | 'knowledgeGaps' | 'sourceWarnings' | 'error'
      >
    >,
  ): Promise<ResearchRunRecord>;
  listRuns(jobId: string): Promise<ResearchRunRecord[]>;
}

export interface ResearchAutonomyConfig {
  maxConcurrentRuns?: number;
}

