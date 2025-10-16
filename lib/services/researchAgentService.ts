import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResearchBrief, ResearchItem, ResearchSourceResult } from '@/types';

const MISUNDERSTOOD_DISEASES = [
  'Morgellons disease',
  'Chronic Lyme disease',
  'Post-treatment Lyme disease syndrome',
  'Myalgic encephalomyelitis/chronic fatigue syndrome',
  'Fibromyalgia',
  'Ehlers-Danlos syndrome',
  'Multiple chemical sensitivity',
  'Chronic inflammatory response syndrome',
  'Environmental toxicity syndrome',
];

const REQUEST_HEADERS: Record<string, string> = {
  'User-Agent': 'SymptiqResearchAgent/1.0 (+https://symptiq.app)',
  Accept: 'application/json',
};

const GEMINI_API_KEY =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';

const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

interface SourceDefinition {
  id: string;
  name: string;
  description: string;
  fetchResults: (term: string) => Promise<ResearchSourceResult>;
}

function nowIso(): string {
  return new Date().toISOString();
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json() as Promise<T>;
}

async function fetchWikipediaSummary(term: string): Promise<ResearchSourceResult> {
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;

  try {
    const data = await requestJson<any>(endpoint);
    if (!data?.extract) {
      return {
        searchTerm: term,
        sourceId: 'wikipedia',
        sourceName: 'Wikipedia Summary',
        fetchedAt: nowIso(),
        items: [],
        warnings: ['No summary extract returned'],
        raw: { endpoint },
      };
    }

    const item: ResearchItem = {
      title: data.title || term,
      summary: data.extract,
      url: data?.content_urls?.desktop?.page || data?.content_urls?.mobile?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(term)}`,
      publishedAt: data.timestamp,
      source: 'Wikipedia',
    };

    return {
      searchTerm: term,
      sourceId: 'wikipedia',
      sourceName: 'Wikipedia Summary',
      fetchedAt: nowIso(),
      items: [item],
      raw: { endpoint },
    };
  } catch (error: any) {
    return {
      searchTerm: term,
      sourceId: 'wikipedia',
      sourceName: 'Wikipedia Summary',
      fetchedAt: nowIso(),
      items: [],
      warnings: [error?.message || 'Failed to retrieve summary'],
      raw: { endpoint },
    };
  }
}

async function fetchSemanticScholar(term: string): Promise<ResearchSourceResult> {
  const endpoint = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
    term,
  )}&limit=5&fields=title,abstract,url,venue,year,authors`;

  try {
    const data = await requestJson<{
      total: number;
      data: Array<{
        title: string;
        abstract?: string;
        url?: string;
        venue?: string;
        year?: number;
        authors?: Array<{ name: string }>;
      }>;
    }>(endpoint);

    const items: ResearchItem[] = (data?.data || []).map((paper) => ({
      title: paper.title || term,
      summary:
        paper.abstract?.trim() ||
        'No abstract provided. Consider reviewing the full paper for more detail.',
      url: paper.url || '',
      publishedAt: paper.year ? `${paper.year}` : undefined,
      authors: paper.authors?.map((author) => author.name).filter(Boolean),
      source: paper.venue || 'Semantic Scholar',
      extra: {
        venue: paper.venue,
        year: paper.year,
      },
    }));

    return {
      searchTerm: term,
      sourceId: 'semantic-scholar',
      sourceName: 'Semantic Scholar',
      fetchedAt: nowIso(),
      items,
      raw: { endpoint, total: data?.total },
      warnings: items.length === 0 ? ['No papers returned'] : undefined,
    };
  } catch (error: any) {
    return {
      searchTerm: term,
      sourceId: 'semantic-scholar',
      sourceName: 'Semantic Scholar',
      fetchedAt: nowIso(),
      items: [],
      warnings: [error?.message || 'Failed to query Semantic Scholar'],
      raw: { endpoint },
    };
  }
}

async function fetchPubMed(term: string): Promise<ResearchSourceResult> {
  const searchEndpoint = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=5&term=${encodeURIComponent(
    term,
  )}`;

  try {
    const searchData = await requestJson<{
      esearchresult?: { idlist?: string[] };
    }>(searchEndpoint);

    const ids = searchData?.esearchresult?.idlist || [];
    if (ids.length === 0) {
      return {
        searchTerm: term,
        sourceId: 'pubmed',
        sourceName: 'PubMed',
        fetchedAt: nowIso(),
        items: [],
        warnings: ['No PubMed articles found for this term'],
        raw: { searchEndpoint },
      };
    }

    const summaryEndpoint = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(
      ',',
    )}`;
    const summaryData = await requestJson<any>(summaryEndpoint);
    const resultEntries = summaryData?.result || {};

    const items: ResearchItem[] = ids
      .map((id) => resultEntries[id])
      .filter(Boolean)
      .map((entry: any) => ({
        title: entry.title || term,
        summary:
          entry?.elocationid ||
          entry?.sortfirstauthor ||
          'Summary unavailable. Open the PubMed record for details.',
        url: entry?.elocationid?.startsWith('http')
          ? entry.elocationid
          : `https://pubmed.ncbi.nlm.nih.gov/${entry?.uid || id}/`,
        publishedAt: entry?.pubdate,
        authors: Array.isArray(entry?.authors)
          ? entry.authors
              .map((author: any) => author?.name)
              .filter((name: string) => Boolean(name))
          : undefined,
        source: 'PubMed',
        extra: {
          journal: entry?.fulljournalname,
          publicationType: entry?.pubtype,
        },
      }));

    return {
      searchTerm: term,
      sourceId: 'pubmed',
      sourceName: 'PubMed',
      fetchedAt: nowIso(),
      items,
      raw: { searchEndpoint, summaryEndpoint },
      warnings: items.length === 0 ? ['Unable to retrieve article summaries'] : undefined,
    };
  } catch (error: any) {
    return {
      searchTerm: term,
      sourceId: 'pubmed',
      sourceName: 'PubMed',
      fetchedAt: nowIso(),
      items: [],
      warnings: [error?.message || 'Failed to query PubMed'],
      raw: { searchEndpoint },
    };
  }
}

const SOURCE_DEFINITIONS: SourceDefinition[] = [
  {
    id: 'wikipedia',
    name: 'Wikipedia Summary',
    description: 'High-level public overview of the condition',
    fetchResults: fetchWikipediaSummary,
  },
  {
    id: 'semantic-scholar',
    name: 'Semantic Scholar',
    description: 'Recent academic papers and abstracts',
    fetchResults: fetchSemanticScholar,
  },
  {
    id: 'pubmed',
    name: 'PubMed',
    description: 'Peer-reviewed medical literature from NIH',
    fetchResults: fetchPubMed,
  },
];

interface ResearchAgentOptions {
  includeSimilarDiseases?: boolean;
  additionalDiseases?: string[];
  includeAiSummary?: boolean;
}

function sanitizeSummary(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 800) {
    return trimmed;
  }
  return `${trimmed.slice(0, 780)}...`;
}

function aggregateFindings(results: ResearchSourceResult[]): string[] {
  const unique = new Set<string>();
  const aggregates: string[] = [];

  results.forEach((result) => {
    result.items.forEach((item) => {
      const hashKey = `${item.title}|${item.summary}`.toLowerCase();
      if (item.summary && !unique.has(hashKey)) {
        unique.add(hashKey);
        aggregates.push(`${item.title}: ${sanitizeSummary(item.summary)}`);
      }
    });
  });

  return aggregates.slice(0, 25);
}

function detectKnowledgeGaps(
  diseases: string[],
  results: ResearchSourceResult[],
): string[] {
  const gaps: string[] = [];

  diseases.forEach((disease) => {
    const hasInsight = results.some(
      (result) => result.searchTerm === disease && result.items.length > 0,
    );
    if (!hasInsight) {
      gaps.push(
        `Limited public research retrieved for ${disease}. Consider consulting specialist forums, case studies, or patient-led research.`,
      );
    }
  });

  const warnings = Array.from(
    new Set(
      results.flatMap((result) => result.warnings || []),
    ),
  );

  if (warnings.length > 0) {
    gaps.push(`Warnings during retrieval: ${warnings.join('; ')}`);
  }

  return gaps;
}

async function buildAiSummary(
  query: string,
  results: ResearchSourceResult[],
  aggregatedFindings: string[],
  knowledgeGaps: string[],
): Promise<string | undefined> {
  if (!genAI) {
    return undefined;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const condensedFindings = aggregatedFindings.slice(0, 12).join('\n- ');

  const sourceSnapshot = results
    .map((result) => {
      const topItem = result.items[0];
      if (!topItem) {
        return null;
      }
      return `${result.sourceName} (${result.searchTerm}): ${sanitizeSummary(topItem.summary)}`;
    })
    .filter(Boolean)
    .slice(0, 10)
    .join('\n');

  const prompt = `You are part of a research agent helping track misunderstood or misdiagnosed diseases for a patient-facing app.

Primary focus: "${query}"

Aggregated findings (top items):
- ${condensedFindings || 'No findings available'}

Source snapshot:
${sourceSnapshot || 'No detailed sources retrieved'}

Knowledge gaps:
- ${knowledgeGaps.join('\n- ') || 'None recorded'}

Produce a concise briefing with the following sections:
1. Key clinical or observational themes (bullet list)
2. Patient-reported experiences or patterns, especially for Morgellons-like presentations
3. Hypothesized mechanisms or differential considerations (be clear these are hypotheses)
4. Suggested follow-up research or questions for the patient to explore

Keep the tone neutral, science-informed, and acknowledge uncertainty when appropriate.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Failed to build AI summary for research agent:', error);
    return undefined;
  }
}

async function fetchAllSourcesForTerm(term: string): Promise<ResearchSourceResult[]> {
  const tasks = SOURCE_DEFINITIONS.map((source) =>
    source
      .fetchResults(term)
      .catch((error: any) => ({
        searchTerm: term,
        sourceId: source.id,
        sourceName: source.name,
        fetchedAt: nowIso(),
        items: [],
        warnings: [error?.message || 'Unknown retrieval failure'],
        raw: { failed: true },
      })),
  );

  return Promise.all(tasks);
}

export async function runResearchAgent(
  query: string,
  options: ResearchAgentOptions = {},
): Promise<ResearchBrief> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    throw new Error('Query is required for research agent');
  }

  const diseases = new Set<string>();
  diseases.add(normalizedQuery);

  if (options.includeSimilarDiseases !== false) {
    MISUNDERSTOOD_DISEASES.forEach((disease) => diseases.add(disease));
  }

  (options.additionalDiseases || [])
    .map((disease) => disease?.trim())
    .filter(Boolean)
    .forEach((disease) => diseases.add(disease as string));

  const diseaseList = Array.from(diseases);
  const allResults: ResearchSourceResult[] = [];

  for (const diseaseTerm of diseaseList) {
    const termResults = await fetchAllSourcesForTerm(diseaseTerm);
    allResults.push(...termResults);
  }

  const aggregatedFindings = aggregateFindings(allResults);
  const knowledgeGaps = detectKnowledgeGaps(diseaseList, allResults);

  const aiSummary =
    options.includeAiSummary === false
      ? undefined
      : await buildAiSummary(normalizedQuery, allResults, aggregatedFindings, knowledgeGaps);

  return {
    query: normalizedQuery,
    diseasesConsidered: diseaseList,
    sourceResults: allResults,
    aggregatedFindings,
    knowledgeGaps,
    aiSummary,
  };
}

export const ResearchAgentConfig = {
  misunderstoodDiseases: MISUNDERSTOOD_DISEASES,
  sources: SOURCE_DEFINITIONS.map(({ id, name, description }) => ({
    id,
    name,
    description,
  })),
};
