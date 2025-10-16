import { ResearchAutonomyAgent, InMemoryResearchJobStore } from './researchAutonomy';
import type { ResearchJobStore } from '@/types/researchAutonomy';
import { FirestoreResearchJobStore } from './firestoreResearchJobStore';
import { buildDefaultResearchJobDefinitions, BuildSeedJobsOptions } from './jobSeeds';

let agentInstance: ResearchAutonomyAgent | null = null;
let storeInstance: ResearchJobStore | null = null;

function shouldUseFirestoreStore(): boolean {
  return process.env.NEXT_PUBLIC_AUTONOMY_USE_FIRESTORE === 'true';
}

function createStore(): ResearchJobStore {
  if (shouldUseFirestoreStore()) {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn(
        'NEXT_PUBLIC_AUTONOMY_USE_FIRESTORE is true but NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing. Falling back to in-memory store.',
      );
    } else {
      try {
        return new FirestoreResearchJobStore();
      } catch (error) {
        console.warn('Failed to initialize FirestoreResearchJobStore. Falling back to in-memory store.', error);
      }
    }
  }
  return new InMemoryResearchJobStore();
}

export function getResearchJobStore(): ResearchJobStore {
  if (!storeInstance) {
    storeInstance = createStore();
  }
  return storeInstance;
}

export function getResearchAutonomyAgent(): ResearchAutonomyAgent {
  if (!agentInstance) {
    agentInstance = new ResearchAutonomyAgent(getResearchJobStore());
  }
  return agentInstance;
}

export async function ensureDefaultResearchJobs(options: BuildSeedJobsOptions = {}): Promise<void> {
  const agent = getResearchAutonomyAgent();
  const definitions = buildDefaultResearchJobDefinitions(options);
  await agent.ensureSeedJobs(definitions);
}
