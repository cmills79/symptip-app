# Autonomous Research Agent Design

## Context
Symptiq already exposes a research aggregation service that compiles public information about misunderstood diseases on demand. To enable proactive discovery and reduce manual effort, we are introducing an autonomous agent that can schedule, execute, and persist research briefs without direct user initiation.

## Goals
- Continuously monitor misunderstood diseases and user-specified conditions.
- Produce `ResearchBrief` outputs identical to the current on-demand agent for downstream compatibility.
- Track execution history, knowledge gaps, and follow-up items to inform future runs.
- Provide a controllable interface (API + UI) for scheduling, inspecting, and canceling autonomous jobs.
- Degrade gracefully when upstream sources fail or rate-limit the agent.

## Constraints & Assumptions
- No PHI is transmitted; queries are limited to disease terms or anonymous patterns.
- Autonomy must operate within Next.js/Node runtime limits (no long-lived background workers).
- External APIs (Wikipedia, Semantic Scholar, PubMed) enforce rate limits; we must respect them using backoff and scheduling.
- Environment variables configure Gemini usage and scheduling defaults.

## Core Components
- **Planner/Task Queue**: Determines which diseases to research next, including cadence, prioritization, and retry policies.
- **Executor**: Reuses `runResearchAgent` to gather sources, aggregate findings, and produce briefs.
- **Persistence Layer**: Stores job definitions, execution attempts, and resulting briefs (Firestore collections or local store fallback).
- **Telemetry & Alerts**: Captures warnings, rate-limit events, and knowledge gaps for review.
- **Management API + UI**: Surfaces job status, recent briefs, and manual overrides via Next.js endpoints and dashboard components.

## High-Level Flow
1. **Schedule**: Planner derives the next set of jobs (default misunderstood disease roster + custom additions). Supports manual enqueue.
2. **Execute**: Executor runs jobs sequentially (or batched with throttling) using existing research service.
3. **Persist**: Store job metadata, results, knowledge gaps, and timestamps for auditing.
4. **Follow-up**: Knowledge gaps feed back into the planner for targeted re-runs or source-specific retries.
5. **Expose**: API endpoints expose job state (`GET/POST /api/research/jobs`), seeding (`POST /api/research/jobs/seed`), manual triggers (`POST /api/research/jobs/{id}/run`), and due-job execution (`POST /api/research/jobs/run`) for UI and automation.

## Data Model Sketch
- `ResearchJob`
  - `id`, `status`, `query`, `includeSimilarDiseases`, `includeAiSummary`, `additionalDiseases`
  - `schedule`: cron expression or interval minutes
  - `createdAt`, `updatedAt`, `lastRunAt`, `nextRunAt`
- `ResearchRun`
  - `id`, `jobId`, `startedAt`, `completedAt`, `status`, `error`
  - `brief`: serialized `ResearchBrief`
  - `knowledgeGaps`: array of strings
  - `sourceWarnings`: array of `{ sourceId, message }`

## Initial Milestones
1. Scaffold orchestration module (`lib/agents/researchAutonomy.ts`) with planner + executor interfaces.
2. Define TypeScript types for jobs and runs (`types/researchAgent.ts` or similar).
3. Implement in-memory scheduler & persistence (stub) to unblock development; add Firestore binding later.
4. Add API endpoints for job CRUD and triggering runs. ✅
5. Build dashboard component to visualize job status and latest briefs.
6. Harden with retry/backoff, telemetry, and caching.
7. Write unit/integration tests for planner, executor, and API layers with mocked external services.

## Open Questions
- Which scheduling mechanism fits Serverless deployment (e.g., cron via Vercel, Firebase functions, or user-triggered UI button)?
- How do we expose knowledge gap follow-up suggestions back to users or clinicians?
- What retention period is acceptable for stored briefs and logs?

## API Summary
- `GET /api/research/jobs`: List all configured jobs.
- `POST /api/research/jobs`: Create a new job (supports `schedule: "interval:<minutes>"`).
- `GET /api/research/jobs/{jobId}?includeRuns=true`: Fetch a specific job with recent runs.
- `POST /api/research/jobs/{jobId}/run`: Manually trigger a single job.
- `POST /api/research/jobs/run`: Execute all jobs due at or before `referenceDate` (defaults to now).
- `POST /api/research/jobs/seed`: Ensure the default misunderstood disease roster exists.

## Deployment & Security Notes
- Set `NEXT_PUBLIC_AUTONOMY_USE_FIRESTORE=true` to enable the Firestore-backed job store in production. Without this flag the agent uses an in-memory store (reset on deploy).
- Firestore rules require the calling identity to carry the custom claim `researchRole: "admin"`. Configure this for trusted service users (e.g., via Firebase Admin SDK) before enabling Firestore storage.
- When operating without admin credentials (local development), leave `NEXT_PUBLIC_AUTONOMY_USE_FIRESTORE` unset and rely on the in-memory store.
- Consider creating composite indexes for any additional queries beyond the defaults (current queries rely on single-field indexes supplied automatically by Firestore).

## Next Steps
- Confirm scheduling approach with product stakeholders.
- Draft Firestore schema updates and security rule adjustments to support new collections.
- Integrate dashboard controls or cron-based triggers for the new endpoints.
