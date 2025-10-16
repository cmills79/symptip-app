import { NextResponse } from 'next/server';
import { getResearchAutonomyAgent } from '@/lib/agents';
import type { ResearchRunRecord } from '@/types/researchAutonomy';

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
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

export async function POST(
  _request: Request,
  { params }: { params: { jobId: string } },
) {
  const jobId = params?.jobId;
  if (!jobId) {
    return NextResponse.json({ error: 'Job id is required.' }, { status: 400 });
  }

  try {
    const agent = getResearchAutonomyAgent();
    const run = await agent.triggerJob(jobId);
    return NextResponse.json({ run: serializeRun(run) }, { status: 202 });
  } catch (error: any) {
    const message = error?.message ?? 'Failed to trigger research job';
    const status = /not found/i.test(message) ? 404 : /already running/i.test(message) ? 409 : 500;
    if (status === 500) {
      console.error(`Failed to trigger research job ${jobId}:`, error);
    }
    return NextResponse.json({ error: message }, { status });
  }
}

