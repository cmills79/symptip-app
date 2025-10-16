# Research Agent Overview

The research agent aggregates publicly available information about misunderstood or misdiagnosed diseases (including Morgellons disease) so AI features inside Symptiq can reference richer context.

## Capabilities
- Queries Wikipedia, Semantic Scholar, and PubMed for each target condition.
- Expands the initial query with a curated list of misunderstood diseases by default.
- Normalizes and aggregates retrieved articles into a single `ResearchBrief`.
- Optionally synthesizes a Gemini summary highlighting themes, patient-reported patterns, hypotheses, and follow-up questions.
- Exposes a Next.js API endpoint for client or server components to call.

## API

`POST /api/research`

```json
{
  "query": "Morgellons disease",
  "includeSimilarDiseases": true,
  "includeAiSummary": true,
  "additionalDiseases": ["Chronic Lyme disease"]
}
```

### Response

```json
{
  "query": "Morgellons disease",
  "diseasesConsidered": ["Morgellons disease", "..."],
  "sourceResults": [
    {
      "searchTerm": "Morgellons disease",
      "sourceId": "wikipedia",
      "sourceName": "Wikipedia Summary",
      "fetchedAt": "2025-10-16T02:00:00.000Z",
      "items": [
        {
          "title": "Morgellons disease",
          "summary": "...",
          "url": "https://en.wikipedia.org/wiki/Morgellons_disease",
          "publishedAt": "...",
          "authors": null,
          "source": "Wikipedia"
        }
      ],
      "warnings": []
    }
  ],
  "aggregatedFindings": ["Title: summary"],
  "knowledgeGaps": ["..."],
  "aiSummary": "Optional Gemini narrative"
}
```

`GET /api/research` returns metadata about configured sources and the default misunderstood disease list.

## Service Usage

```ts
import { runResearchAgent } from '@/lib/services/researchAgentService';

const briefing = await runResearchAgent('Morgellons disease', {
  includeSimilarDiseases: true,
  additionalDiseases: ['Chronic Lyme disease'],
});
```

The returned `ResearchBrief` can be fed into existing Gemini analysis flows to inform custom question generation or deeper timeline assessments.

## Notes
- Gemini summarization requires `NEXT_PUBLIC_GEMINI_API_KEY` (or fallback to `NEXT_PUBLIC_FIREBASE_API_KEY`).
- External APIs are public but may rate-limit heavy usage; failures are captured in the `knowledgeGaps` array.
- Consider caching server responses if the agent is invoked frequently with the same query.
