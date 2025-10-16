import { NextRequest, NextResponse } from 'next/server';
import { getResearchJobStore } from '@/lib/agents';
import type { ResearchJobRecord, ResearchRunRecord } from '@/types/researchAutonomy';

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function serializeJob(job: ResearchJobRecord) {
  return {
    id: job.id,
    query: job.query,
    status: job.status,
    includeSimilarDiseases: job.includeSimilarDiseases,
    includeAiSummary: job.includeAiSummary,
    additionalDiseases: job.additionalDiseases,
    schedule: job.schedule,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    nextRunAt: toIso(job.nextRunAt),
    lastRunAt: toIso(job.lastRunAt),
    error: job.error ?? null,
  };
}

function serializeRun(run: ResearchRunRecord) {
  return {
    id: run.id,
    jobId: run.jobId,
    status: run.status,
    triggeredManually: run.triggeredManually,
    startedAt: run.startedAt.toISOString(),
    completedAt: toIso(run.completedAt),
    knowledgeGaps: run.knowledgeGaps,
    sourceWarnings: run.sourceWarnings,
    error: run.error ?? null,
    brief: run.brief,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  const jobId = params?.jobId;
  if (!jobId) {
    return NextResponse.json({ error: 'Job id is required.' }, { status: 400 });
  }

  try {
    const store = getResearchJobStore();
    const job = await store.getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }

    const includeRuns = request.nextUrl.searchParams.get('includeRuns') === 'true';
    const runs = includeRuns ? await store.listRuns(jobId) : [];

    return NextResponse.json({
      job: serializeJob(job),
      runs: runs.map(serializeRun),
    });
  } catch (error: any) {
    console.error(`Failed to fetch research job ${jobId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch research job' },
      { status: 500 },
    );
  }
}

