import { NextRequest, NextResponse } from 'next/server';
import {
  ensureDefaultResearchJobs,
  getResearchJobStore,
  buildDefaultResearchJobDefinitions,
} from '@/lib/agents';
import type { ResearchJobRecord } from '@/types/researchAutonomy';

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
    nextRunAt: job.nextRunAt ? job.nextRunAt.toISOString() : null,
    lastRunAt: job.lastRunAt ? job.lastRunAt.toISOString() : null,
    error: job.error ?? null,
  };
}

function sanitizeDiseases(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const entries = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return entries.length ? entries : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const intervalMinutes =
      typeof body?.intervalMinutes === 'number' && body.intervalMinutes > 0
        ? body.intervalMinutes
        : undefined;

    if (body?.intervalMinutes !== undefined && !intervalMinutes) {
      return NextResponse.json(
        { error: 'intervalMinutes must be a positive number' },
        { status: 400 },
      );
    }

    const includeAiSummary =
      body?.includeAiSummary === undefined ? undefined : Boolean(body.includeAiSummary);
    const includeSimilarDiseases =
      body?.includeSimilarDiseases === undefined ? undefined : Boolean(body.includeSimilarDiseases);
    const additionalDiseases = sanitizeDiseases(body?.additionalDiseases);
    const overrideQueries = sanitizeDiseases(body?.overrideQueries);
    const startFrom =
      typeof body?.startFrom === 'string' && body.startFrom.trim()
        ? new Date(body.startFrom)
        : undefined;

    if (startFrom && Number.isNaN(startFrom.getTime())) {
      return NextResponse.json(
        { error: 'Invalid startFrom timestamp. Use ISO 8601 format.' },
        { status: 400 },
      );
    }

    // Execute seeding
    await ensureDefaultResearchJobs({
      intervalMinutes,
      includeAiSummary,
      includeSimilarDiseases,
      additionalDiseases,
      overrideQueries,
      startFrom,
    });

    const store = getResearchJobStore();
    const jobs = await store.listJobs();

    const seeds = buildDefaultResearchJobDefinitions({
      intervalMinutes,
      includeAiSummary,
      includeSimilarDiseases,
      additionalDiseases,
      overrideQueries,
      startFrom,
    }).map((definition) => definition.query);

    return NextResponse.json({
      seededQueries: seeds,
      jobs: jobs.map(serializeJob),
    });
  } catch (error: any) {
    console.error('Failed to seed research jobs:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to seed research jobs' },
      { status: 500 },
    );
  }
}

