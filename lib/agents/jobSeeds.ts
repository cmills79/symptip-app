import { ResearchAgentConfig } from '@/lib/services/researchAgentService';
import type { ResearchJobDefinition } from '@/types/researchAutonomy';
import { calculateNextRunAt } from './scheduling';

const DEFAULT_INTERVAL_MINUTES = 24 * 60; // once per day

export interface BuildSeedJobsOptions {
  intervalMinutes?: number;
  includeAiSummary?: boolean;
  includeSimilarDiseases?: boolean;
  additionalDiseases?: string[];
  overrideQueries?: string[];
  startFrom?: Date;
}

export function buildDefaultResearchJobDefinitions(
  options: BuildSeedJobsOptions = {},
): ResearchJobDefinition[] {
  const {
    intervalMinutes = DEFAULT_INTERVAL_MINUTES,
    includeAiSummary = true,
    includeSimilarDiseases = true,
    additionalDiseases,
    overrideQueries,
    startFrom,
  } = options;

  const diseases =
    overrideQueries && overrideQueries.length > 0
      ? overrideQueries
      : ResearchAgentConfig.misunderstoodDiseases;

  const schedule = `interval:${intervalMinutes}`;
  const baseDate = startFrom ?? new Date();

  return diseases.map((condition) => {
    const query = condition.trim();
    const nextRunAt = calculateNextRunAt(schedule, { from: baseDate });

    return {
      query,
      includeAiSummary,
      includeSimilarDiseases,
      additionalDiseases,
      schedule,
      nextRunAt,
    };
  });
}

