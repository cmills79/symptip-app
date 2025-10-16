import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = request.headers.get('content-type')?.includes('application/json')
      ? await request.json()
      : {};
    const reference = body?.referenceDate ? new Date(body.referenceDate) : new Date();

    if (body?.referenceDate && Number.isNaN(reference.getTime())) {
      return NextResponse.json(
        { error: 'Invalid referenceDate. Use ISO 8601 format.' },
        { status: 400 },
      );
    }

    const agent = getResearchAutonomyAgent();
    const runs = await agent.runDueJobs(reference);
    return NextResponse.json({ runs: runs.map(serializeRun) });
  } catch (error: any) {
    console.error('Failed to execute due research jobs:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute due research jobs' },
      { status: 500 },
    );
  }
}

