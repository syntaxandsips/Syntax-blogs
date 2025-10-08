# AI Integration Roadmap for Syntax & Sips

## 1. Architecture Design

### 1.1 High-Level System Overview
```
+-------------------+          +---------------------+          +-----------------------+
| Next.js App Layer |<-------->| AI Gateway (Agents) |<-------->| External MCP Servers  |
| (Pages & API)     |          |  - Agent Runtime    |          |  - Research (APIs)    |
|                   |          |  - Task Orchestrator|          |  - CMS Ops (Supabase) |
+-------------------+          |  - Context Router   |          |  - SEO Tools          |
        |                      +---------------------+          +-----------------------+
        v                               |
+-------------------+                  v
| Supabase Database |<-----------------+
|  - Posts          |
|  - Metadata       |
|  - Auth Profiles  |
+-------------------+
```

### 1.2 Agent Roles and Responsibilities
- **Research Agent**: Collects background information from MCP research servers (web search, arXiv, GitHub). Summarizes insights, extracts references, and stores notes in Supabase `research_notes` table.
- **Writing Agent**: Generates draft blog posts using OpenAI Agents SDK with structured prompts, leveraging retrieved research context.
- **Editing Agent**: Reviews drafts for accuracy, tone, and style. Applies grammar corrections and ensures alignment with neobrutalism voice guidelines.
- **Optimization Agent**: Performs SEO analysis, internal linking recommendations, and call-to-action optimization via MCP SEO server.
- **Coordinator Agent**: Orchestrates workflow, dispatching tasks to specialized agents, merging outputs, and persisting state in Supabase.

### 1.3 MCP Server Structure
- **Research MCP Server**: Connects to external APIs (Perplexity, arXiv, PapersWithCode). Provides tools: `searchArticles`, `summarizePaper`, `fetchCodeExamples`.
- **Blog Operations MCP Server**: Interfaces with Supabase via service role keys stored server-side. Tools: `getDraft`, `saveDraft`, `publishPost`, `listCategories`.
- **SEO MCP Server**: Integrates with third-party SEO APIs (e.g., Ahrefs, Clearscope) for keyword density, SERP analysis. Tools: `analyzeKeywords`, `recommendHeadings`, `internalLinks`.
- **Storage MCP Server**: Manages media assets (images, diagrams) via Supabase Storage and optional S3-compatible bucket.

Each MCP server exposes compliant schemas (`mcp.config.json`) and is deployed as microservices or serverless functions accessible by Agents runtime.

### 1.4 Data Flow Design
1. User triggers AI workflow from admin dashboard (Next.js client component).
2. Frontend calls `/api/ai/workflows` to initiate coordinator agent.
3. Coordinator agent (via Agents SDK) fetches context: existing drafts, guidelines from Supabase.
4. Agent orchestrator invokes MCP research tools to gather materials.
5. Writing agent synthesizes content, storing intermediate drafts in Supabase.
6. Editing agent refines drafts using context + editing prompts.
7. Optimization agent runs SEO checks, updates metadata, and suggests CTAs.
8. Final draft returned to frontend for human review. User can accept (publish via MCP blog operations) or request revisions.

## 2. Dependency Analysis

### 2.1 npm Packages
- `openai` (>=4.0.0, TypeScript support) for Agents SDK.
- `@openai/agents` (latest TypeScript beta) for agent orchestration helpers.
- `@modelcontextprotocol/sdk` for MCP client/server bindings.
- `ai` (Vercel AI SDK) for Next.js integration (React hooks, streaming UI).
- `zod` for schema validation of agent inputs/outputs.
- `zustand` or `jotai` for frontend state management of AI workflows.
- `@supabase/supabase-js` (existing) ensure latest minor for Service Role usage on server.
- `pino` for structured logging of agent actions.
- `eventemitter3` or built-in Node EventEmitter for workflow progress updates.
- Dev deps: `@types/node`, `@types/eventemitter3`, `ts-node` (for MCP server dev), `vitest`, `@testing-library/react` (already present, verify).

### 2.2 Version Compatibility
- Next.js 14+ requires Node 18.17+. Ensure Agents SDK compatible with Node LTS.
- Vercel AI SDK `^3.x` supports App Router streaming; align with Next.js version.
- MCP SDK currently in RC—pin exact minor to avoid breaking changes.
- Ensure Supabase client >=2.39 for typed responses.

### 2.3 Environment Variables
Add to `.env.example`:
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (optional custom endpoint)
- `MCP_RESEARCH_URL`, `MCP_RESEARCH_TOKEN`
- `MCP_BLOG_URL`, `MCP_BLOG_TOKEN`
- `MCP_SEO_URL`, `MCP_SEO_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY` (only in server env)
- `AGENTS_WORKSPACE_BUCKET` for storage server

### 2.4 Database Schema Changes
- New tables:
  - `ai_workflows` (id, status, type, created_by, created_at, updated_at, config JSONB).
  - `ai_workflow_events` (id, workflow_id FK, agent, event_type, payload JSONB, created_at).
  - `research_notes` (id, post_id FK nullable, summary TEXT, references JSONB, created_at).
- Update `posts` table to add `seo_metadata JSONB`, `ai_generated BOOLEAN DEFAULT false`.
- Indexes on `ai_workflows.status`, `ai_workflow_events.workflow_id`.

## 3. Module Breakdown

### 3.1 Core AI Agents
- Location: `src/agents/`
  - `coordinatorAgent.ts`: orchestrates workflows using Agents SDK, handles tool invocation.
  - `researchAgent.ts`: wraps research MCP tools, ensures deduplication of sources.
  - `writingAgent.ts`: composes prompts using blog style guides, returns Markdown.
  - `editingAgent.ts`: applies editing prompts, uses diffing utilities.
  - `optimizationAgent.ts`: queries SEO MCP server, updates metadata.
  - Shared utilities: `contextBuilder.ts`, `promptTemplates.ts`.

### 3.2 MCP Servers
- Directory: `apps/mcp/`
  - `research/index.ts`: implements MCP server with tool handlers calling external APIs.
  - `blog/index.ts`: manages Supabase interactions using service role.
  - `seo/index.ts`: proxies SEO service calls.
  - `storage/index.ts`: handles media operations.
  - `config/` folder for `mcp.config.json`, tool schemas (Zod or JSON Schema).

### 3.3 API Endpoints & Routes
- `src/app/api/ai/workflows/route.ts`: POST to start workflow, GET for status.
- `src/app/api/ai/workflows/[id]/events/route.ts`: SSE or polling for events.
- `src/app/api/ai/drafts/[id]/route.ts`: operations on drafts (GET/PUT).
- Use Next.js Route Handlers with Agents SDK server clients.

### 3.4 Frontend Components
- Directory: `src/app/(dashboard)/ai/`
  - `page.tsx`: AI operations dashboard (Server Component).
  - `WorkflowLauncher.tsx`: Client component with form to choose workflow type.
  - `WorkflowTimeline.tsx`: Streams events using Vercel AI SDK `useChat` or custom SSE hook.
  - `DraftPreview.tsx`: Displays AI-generated content with diff view.
  - `SEORecommendations.tsx`: Renders optimization suggestions.
  - Shared hooks: `useWorkflow` (Zustand store), `useEventStream`.

### 3.5 Database Models & Repositories
- `src/lib/db/aiWorkflows.ts`: CRUD functions for `ai_workflows`.
- `src/lib/db/researchNotes.ts`: Manage research notes linking to posts.
- Update existing `src/lib/db/posts.ts` to include SEO metadata operations.
- Use Zod schemas in `src/lib/validation/ai.ts`.

## 4. Implementation Phases

### Phase 1: Infrastructure & MCP Servers
1. Scaffold `apps/mcp/*` structure with TypeScript config (`tsconfig.mcp.json`).
2. Implement Research MCP server with mock responses for local dev.
3. Implement Blog MCP server connected to Supabase service role.
4. Add SEO and Storage MCP server skeletons with placeholder handlers.
5. Configure deployment scripts (`package.json` workspaces or npm scripts) to run MCP servers locally (`npm run mcp:research`).
6. Update `.env.example` with MCP URLs.

### Phase 2: Agents SDK Integration
1. Install `@openai/agents`, configure client in `src/lib/ai/agentsClient.ts`.
2. Implement coordinator agent orchestrating tasks across MCP tools.
3. Build specialized agent modules referencing MCP endpoints.
4. Create prompt templates for each agent, store in `src/agents/prompts/`.
5. Add logging instrumentation and error handling.

### Phase 3: API Development
1. Create workflow initiation route: validate payload (Zod), create workflow record, invoke coordinator.
2. Implement event streaming route using SSE to push agent progress.
3. Add draft management routes for retrieving/updating AI drafts.
4. Secure routes with Supabase auth middleware (admin-only).

### Phase 4: Frontend AI Interfaces
1. Build AI dashboard route with server-side data fetching of workflows.
2. Implement client components for launching workflows and monitoring status.
3. Integrate Vercel AI SDK hooks for streaming updates and chat-like interactions.
4. Add diff viewer (e.g., `react-diff-viewer-continued`) for before/after drafts.
5. Ensure accessibility, responsive layout, and neobrutalist styling.

### Phase 5: Testing, Optimization, Deployment
1. Write Vitest unit tests for agent modules, MCP clients, and API handlers.
2. Implement integration tests for workflow lifecycle using mocked MCP responses.
3. Add Playwright E2E tests for AI dashboard interactions.
4. Monitor performance (logging, caching). Optimize prompt sizes and data fetching.
5. Update deployment pipeline to include MCP server builds and environment variables.
6. Document runbooks in `docs/ai/`.

## 5. Task Dependencies

| Task | Depends On | Notes |
| --- | --- | --- |
| MCP Server Scaffold | None | Foundational for later phases. |
| Agents SDK client setup | MCP endpoints (URLs) | Requires Phase 1 outputs. |
| Workflow API routes | Agents integration | Need coordinator agent implementation. |
| Frontend dashboard | Workflow API | Depends on API endpoints. |
| Testing suite | Core modules | Unit tests can start after module creation. |
| Deployment updates | All modules | Final integration step. |

**Critical Path**: MCP Servers → Agents Integration → API Routes → Frontend Dashboard → Deployment.

Parallel tasks:
- Database migrations can run alongside MCP server setup.
- Prompt template authoring parallel with Agents module coding.
- Frontend design mockups while backend APIs developed.

Blocking dependencies:
- Agents modules require stable MCP tool schemas.
- Frontend event stream depends on SSE API route.

## 6. Required Changes

- **New Directories**: `src/agents/`, `src/lib/ai/`, `src/lib/validation/`, `src/app/(dashboard)/ai/`, `apps/mcp/`.
- **Modified Files**: `package.json` (scripts, dependencies), `tsconfig.json` (path aliases), `next.config.ts` (if proxying MCP), `README.md` (setup steps), `supabase/migrations/*.sql` (schema updates).
- **Database**: Add migrations for new tables and columns.
- **Configuration**: `.env.example`, `docs/env.md` updates.

## 7. Risk Assessment

### 7.1 Technical Risks
- **MCP Stability**: SDK changes may break compatibility. Mitigation: pin versions, implement integration tests.
- **Agent Hallucinations**: AI-generated content may include inaccuracies. Mitigation: enforce human review, retrieval grounding, metadata logging.
- **Supabase Service Role Exposure**: Ensure keys only stored server-side and MCP blog server requires auth tokens.

### 7.2 Performance Considerations
- Long-running agent workflows can time out HTTP requests. Use background jobs (Edge Functions/queue) and SSE for updates.
- Caching research results to avoid redundant API calls.
- Optimize prompts to reduce token usage and latency.

### 7.3 Security Implications
- Secure MCP endpoints with token-based auth and IP allowlists.
- Log access attempts and audit workflow actions.
- Sanitize agent-generated content before rendering (avoid embedded scripts).

### 7.4 Scalability Concerns
- Implement queue or job worker (e.g., Supabase Edge Functions or external worker) for concurrent workflows.
- Partition workflow events table for large histories.
- Design MCP servers stateless to scale horizontally.

## 8. Success Metrics

- **Performance**: End-to-end AI workflow completes in <3 minutes for standard posts.
- **Quality**: Human reviewers approve ≥80% of drafts with minimal edits.
- **Usage**: At least 5 active workflows per week post-launch.
- **Reliability**: Error rate <2% across agent executions.
- **DX**: Setup time for new developers ≤30 minutes (documented instructions).

## 9. Testing Strategy & Deployment Plan

### Testing
- Unit tests for agent prompts, MCP client handlers (`vitest`).
- Integration tests for API routes using mocked MCP servers.
- Contract tests validating MCP tool schemas with Agents SDK.
- Playwright E2E tests covering workflow creation, streaming updates, and final draft review.
- Load testing (k6 or Artillery) for MCP servers to ensure scalability.

### Deployment
1. Extend CI to lint, type-check, test, and build MCP servers.
2. Deploy Next.js app to Vercel (existing pipeline); ensure environment variables set.
3. Deploy MCP servers to suitable environment (Vercel Functions, Fly.io, Supabase Edge). Use Docker if needed.
4. Configure routing and secrets in production.
5. Monitor logs; set up alerts for agent failures.

## 10. Timeline & Resources

| Phase | Duration | Resources |
| --- | --- | --- |
| Phase 1 | 1.5 weeks | 1 backend engineer, 1 DevOps |
| Phase 2 | 2 weeks | 1 AI engineer, 1 backend |
| Phase 3 | 1 week | Backend engineer |
| Phase 4 | 1.5 weeks | Frontend engineer, UX designer |
| Phase 5 | 1 week | QA engineer, DevOps |

**Total**: ~7 weeks with overlapping tasks.

Additional resources: Technical writer for documentation updates, PM for coordination.

## 11. Best Practices & Integration Patterns

- Use dependency injection for MCP clients to facilitate testing.
- Structure agent prompts as composable templates with context slots.
- Apply `async`/`await` with robust error handling and retries (`p-retry`).
- Utilize Vercel AI SDK streaming for responsive UI updates.
- Maintain detailed audit logs of agent actions for transparency.

## 12. Next Steps

1. Review roadmap with stakeholders for alignment.
2. Prioritize MCP server tooling based on available third-party APIs.
3. Begin Phase 1 tasks, creating issues in project tracker.
4. Schedule regular demos after each phase.

