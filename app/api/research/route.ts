import { NextRequest, NextResponse } from 'next/server';
import { runResearchAgent, ResearchAgentConfig } from '@/lib/services/researchAgentService';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(ResearchAgentConfig);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: string | undefined = body?.query;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'The field "query" is required.' },
        { status: 400 },
      );
    }

    const includeSimilarDiseases =
      body?.includeSimilarDiseases === undefined
        ? true
        : Boolean(body.includeSimilarDiseases);

    const includeAiSummary =
      body?.includeAiSummary === undefined
        ? true
        : Boolean(body.includeAiSummary);

    const additionalDiseases: string[] | undefined = Array.isArray(
      body?.additionalDiseases,
    )
      ? body.additionalDiseases
          .filter((value: unknown): value is string => typeof value === 'string')
          .map((value) => value.trim())
          .filter(Boolean)
      : undefined;

    const researchBrief = await runResearchAgent(query, {
      includeSimilarDiseases,
      includeAiSummary,
      additionalDiseases,
    });

    return NextResponse.json(researchBrief);
  } catch (error: any) {
    console.error('Research agent error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to run research agent' },
      { status: 500 },
    );
  }
}
