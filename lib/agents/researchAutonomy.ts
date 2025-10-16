import { randomUUID } from 'crypto';
import { runResearchAgent } from '@/lib/services/researchAgentService';
import type {
  ResearchAutonomyConfig,
  ResearchBriefWithMetadata,
  ResearchJobDefinition,
  ResearchJobRecord,
  ResearchJobStatus,
  ResearchJobStore,
  ResearchRunRecord,
  ResearchRunStatus,
} from '@/types/researchAutonomy';
import { calculateNextRunAt } from './scheduling';

const DEFAULT_MAX_CONCURRENT_RUNS = 1;

/**
 * Coordinates autonomous research jobs by delegating execution to the existing research agent.
 */
export class ResearchAutonomyAgent {
  private readonly store: ResearchJobStore;
  private readonly maxConcurrentRuns: number;

  constructor(store: ResearchJobStore, config: ResearchAutonomyConfig = {}) {
    this.store = store;
    this.maxConcurrentRuns =
      config.maxConcurrentRuns && config.maxConcurrentRuns > 0
        ? config.maxConcurrentRuns
        : DEFAULT_MAX_CONCURRENT_RUNS;
  }

  /**
   * Ensures an initial roster of jobs exists. Useful for bootstrapping the misunderstood disease list.
   */
  async ensureSeedJobs(seedDefinitions: ResearchJobDefinition[]): Promise<void> {
    if (!seedDefinitions.length) {
      return;
    }

    const existingJobs = await this.store.listJobs();
    const existingQueries = new Set(existingJobs.map((job) => job.query.toLowerCase()));

    await Promise.all(
      seedDefinitions
        .filter((job) => !existingQueries.has(job.query.toLowerCase()))
        .map((definition) =>
          this.store.createJob({
            ...definition,
            nextRunAt:
              definition.nextRunAt ??
              calculateNextRunAt(definition.schedule ?? null, { from: new Date() }),
          }),
        ),
    );
  }

  /**
   * Runs all jobs that are due at or before the supplied timestamp.
   */
  async runDueJobs(reference: Date = new Date()): Promise<ResearchRunRecord[]> {
    const dueJobs = await this.store.findDueJobs(reference);
    const runs: ResearchRunRecord[] = [];

    for (const job of dueJobs.slice(0, this.maxConcurrentRuns)) {
      const run = await this.executeJob(job);
      runs.push(run);
    }

    return runs;
  }

  /**
   * Manually executes a specific job regardless of its schedule.
   */
  async triggerJob(jobId: string): Promise<ResearchRunRecord> {
    const job = await this.store.getJob(jobId);
    if (!job) {
      throw new Error(`Research job ${jobId} not found`);
    }
    if (job.status === 'running') {
      throw new Error(`Research job ${jobId} is already running`);
    }
    return this.executeJob(job, { manual: true });
  }

  private async executeJob(
    job: ResearchJobRecord,
    options: { manual?: boolean } = {},
  ): Promise<ResearchRunRecord> {
    const startedAt = new Date();
    const run = await this.store.startRun(job.id, {
      jobId: job.id,
      startedAt,
      status: this.markRunStatus('running'),
      triggeredManually: Boolean(options.manual),
    });

    try {
      const brief = await runResearchAgent(job.query, {
        includeAiSummary: job.includeAiSummary,
        includeSimilarDiseases: job.includeSimilarDiseases,
        additionalDiseases: job.additionalDiseases,
      });

      const completedRun = await this.store.completeRun(run.id, {
        status: this.markRunStatus('completed'),
        completedAt: new Date(),
        brief: this.attachMetadata(brief, job, startedAt),
        knowledgeGaps: brief.knowledgeGaps || [],
        sourceWarnings: this.collectWarnings(brief),
      });

      await this.store.updateJobSchedule(job.id, {
        status: this.markJobStatus('idle'),
        lastRunAt: completedRun.completedAt,
        nextRunAt: calculateNextRunAt(job.schedule, {
          from: completedRun.completedAt ?? new Date(),
        }),
      });

      return completedRun;
    } catch (error: any) {
      const failedRun = await this.store.completeRun(run.id, {
        status: this.markRunStatus('failed'),
        completedAt: new Date(),
        error: error?.message || 'Unknown research execution failure',
      });

      await this.store.updateJobSchedule(job.id, {
        status: this.markJobStatus('error'),
        lastRunAt: failedRun.completedAt,
        error: failedRun.error,
        nextRunAt: calculateNextRunAt(job.schedule, {
          from: failedRun.completedAt ?? new Date(),
        }),
      });

      return failedRun;
    }
  }

  /**
   * Converts string literals into strongly typed job statuses.
   */
  private markJobStatus<T extends ResearchJobStatus>(status: T): T {
    return status;
  }

  /**
   * Converts string literals into strongly typed run statuses.
   */
  private markRunStatus<T extends ResearchRunStatus>(status: T): T {
    return status;
  }

  /**
   * Attaches job metadata to the research brief for downstream consumers.
   */
  private attachMetadata(
    brief: ResearchBriefWithMetadata,
    job: ResearchJobRecord,
    startedAt: Date,
  ): ResearchBriefWithMetadata {
    return {
      ...brief,
      diseasesConsidered: brief.diseasesConsidered ?? [],
      metadata: {
        jobId: job.id,
        jobSchedule: job.schedule ?? null,
        triggeredAt: startedAt.toISOString(),
      },
    };
  }

  private collectWarnings(brief: ResearchBriefWithMetadata): Array<{
    sourceId: string;
    message: string;
  }> {
    const warnings: Array<{ sourceId: string; message: string }> = [];

    (brief.sourceResults || []).forEach((result) => {
      (result.warnings || []).forEach((warning) => {
        warnings.push({
          sourceId: result.sourceId,
          message: warning,
        });
      });
    });

    return warnings;
  }
}

/**
 * Simple in-memory implementation of the persistence interfaces. Helpful for local development and testing.
 */
export class InMemoryResearchJobStore implements ResearchJobStore {
  private jobs = new Map<string, ResearchJobRecord>();
  private runs = new Map<string, ResearchRunRecord>();

  async createJob(definition: ResearchJobDefinition): Promise<ResearchJobRecord> {
    const id = randomUUID();
    const now = new Date();
    const job: ResearchJobRecord = {
      id,
      status: this.markJobStatus('idle'),
      query: definition.query,
      includeAiSummary:
        definition.includeAiSummary === undefined ? true : Boolean(definition.includeAiSummary),
      includeSimilarDiseases:
        definition.includeSimilarDiseases === undefined
          ? true
          : Boolean(definition.includeSimilarDiseases),
      additionalDiseases: definition.additionalDiseases ?? [],
      schedule: definition.schedule ?? null,
      createdAt: now,
      updatedAt: now,
      lastRunAt: null,
      nextRunAt:
        definition.nextRunAt ??
        calculateNextRunAt(definition.schedule ?? null, { from: now }) ??
        null,
    };

    this.jobs.set(id, job);
    return job;
  }

  async listJobs(): Promise<ResearchJobRecord[]> {
    return Array.from(this.jobs.values());
  }

  async findDueJobs(reference: Date): Promise<ResearchJobRecord[]> {
    const timestamp = reference.getTime();
    return Array.from(this.jobs.values()).filter((job) => {
      if (job.status === 'running') {
        return false;
      }
      if (!job.nextRunAt) {
        return false;
      }
      return job.nextRunAt.getTime() <= timestamp;
    });
  }

  async getJob(id: string): Promise<ResearchJobRecord | null> {
    return this.jobs.get(id) ?? null;
  }

  async updateJobSchedule(
    id: string,
    update: Partial<
      Pick<ResearchJobRecord, 'status' | 'lastRunAt' | 'nextRunAt' | 'error' | 'updatedAt'>
    >,
  ): Promise<ResearchJobRecord> {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Research job ${id} not found`);
    }

    const updated: ResearchJobRecord = {
      ...job,
      ...update,
      updatedAt: update.updatedAt ?? new Date(),
    };
    this.jobs.set(id, updated);
    return updated;
  }

  async startRun(
    jobId: string,
    partial: Pick<ResearchRunRecord, 'jobId' | 'startedAt' | 'status'> & {
      triggeredManually?: boolean;
    },
  ): Promise<ResearchRunRecord> {
    const id = randomUUID();
    const run: ResearchRunRecord = {
      id,
      jobId,
      startedAt: partial.startedAt,
      completedAt: null,
      status: partial.status,
      triggeredManually: Boolean(partial.triggeredManually),
      brief: null,
      knowledgeGaps: [],
      sourceWarnings: [],
      error: null,
    };
    this.runs.set(id, run);
    await this.updateJobSchedule(jobId, { status: this.markJobStatus('running') });
    return run;
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
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Research run ${runId} not found`);
    }
    const completed: ResearchRunRecord = {
      ...run,
      ...update,
      completedAt: update.completedAt ?? new Date(),
    };
    this.runs.set(runId, completed);
    return completed;
  }

  async listRuns(jobId: string): Promise<ResearchRunRecord[]> {
    return Array.from(this.runs.values()).filter((run) => run.jobId === jobId);
  }

  private markJobStatus<T extends ResearchJobStatus>(status: T): T {
    return status;
  }
}
