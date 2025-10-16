import { NextRequest, NextResponse } from 'next/server';
import { getResearchJobStore, isSupportedSchedule, calculateNextRunAt } from '@/lib/agents';
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

export async function GET() {
  try {
    const store = getResearchJobStore();
    const jobs = await store.listJobs();
    return NextResponse.json({
      jobs: jobs.map(serializeJob),
    });
  } catch (error: any) {
    console.error('Failed to list research jobs:', error);
    return NextResponse.json(
      { error: 'Failed to list research jobs' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body?.query === 'string' ? body.query.trim() : '';

    if (!query) {
      return NextResponse.json({ error: 'The field "query" is required.' }, { status: 400 });
    }

    const schedule =
      body?.schedule === undefined || body?.schedule === null
        ? null
        : String(body.schedule).trim();

    if (!isSupportedSchedule(schedule)) {
      return NextResponse.json(
        { error: 'Unsupported schedule format. Use "interval:<minutes>" or omit the field.' },
        { status: 400 },
      );
    }

    const includeSimilarDiseases =
      body?.includeSimilarDiseases === undefined
        ? undefined
        : Boolean(body.includeSimilarDiseases);

    const includeAiSummary =
      body?.includeAiSummary === undefined ? undefined : Boolean(body.includeAiSummary);

    const additionalDiseases: string[] | undefined = Array.isArray(body?.additionalDiseases)
      ? body.additionalDiseases
          .filter((value: unknown): value is string => typeof value === 'string')
          .map((value: string) => value.trim())
          .filter(Boolean)
      : undefined;

    const nextRunAtInput =
      typeof body?.nextRunAt === 'string' && body.nextRunAt.trim()
        ? new Date(body.nextRunAt)
        : undefined;

    if (nextRunAtInput && Number.isNaN(nextRunAtInput.getTime())) {
      return NextResponse.json(
        { error: 'Invalid nextRunAt timestamp. Use ISO 8601 format.' },
        { status: 400 },
      );
    }

    const store = getResearchJobStore();
    const job = await store.createJob({
      query,
      includeSimilarDiseases,
      includeAiSummary,
      additionalDiseases,
      schedule,
      nextRunAt:
        nextRunAtInput ??
        calculateNextRunAt(schedule, {
          from: new Date(),
        }) ??
        null,
    });

    return NextResponse.json({ job: serializeJob(job) }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create research job:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create research job' },
      { status: 500 },
    );
  }
}
