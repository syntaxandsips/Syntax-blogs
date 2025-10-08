# AI Agents Integration Roadmap for Syntax & Sips

This roadmap details how to extend the existing **Next.js 14+** blog platform with AI-assisted editorial workflows using the **OpenAI Agents SDK (TypeScript)**, **Model Context Protocol (MCP)** integrations, and the **Vercel AI SDK**. It assumes the baseline architecture described in [`docs/MCP-Guide.MD`](./MCP-Guide.MD).

---

## 1. Architecture Design

### 1.1 High-Level Topology
```
+-----------------------------------------------------------------------------------------+
|                                   Vercel / Next.js 14+                                  |
|  App Router (app/)                                                                      |
|  ├─ Server Components (content fetch, Supabase queries)                                 |
|  └─ Client Components (AI dashboards, editors)                                          |
|       |                                                                                 |
|       v                                                                                 |
|  API Route Handlers (src/app/api/ai/**)                                                 |
|       |  invoke                                                                          |
|       v                                                                                 |
|  Agents Runtime (src/agents/)                                                            |
|  ├─ CoordinatorAgent (workflow state, tool routing)                                     |
|  ├─ ResearchAgent (retrieval tooling)                                                   |
|  ├─ WritingAgent (draft generation + revisions)                                         |
|  └─ OptimizationAgent (editing, SEO, metadata)                                          |
|       |                                                                                 |
|       +--------------------+-----------------------------------------------------------+
|                            |                                                           |
|                            v                                                           v
|                 MCP Client Adapters (src/lib/mcp/)                          Supabase Client (server)
|                            |                                                           |
|                            v                                                           v
|              External MCP Servers (apps/mcp/**)                              Supabase/Postgres DB
|  ├─ research (web/APIs)                                                        ├─ posts, categories
|  ├─ blog (Supabase service role)                                              ├─ ai_workflows
|  ├─ seo (third-party SEO APIs)                                                ├─ ai_workflow_events
|  └─ storage (Supabase storage/S3)                                             └─ research_notes
+-----------------------------------------------------------------------------------------+
```

### 1.2 Agent Roles & Responsibilities
- **Coordinator Agent** (`src/agents/coordinatorAgent.ts`): orchestrates multi-step workflows, persists progress, dispatches subtasks, merges final output. Implements guardrails (token budgets, retries).
- **Research Agent** (`src/agents/researchAgent.ts`): wraps MCP research tools, deduplicates sources, stores summaries in `research_notes`.
- **Writing Agent** (`src/agents/writingAgent.ts`): synthesizes drafts using OpenAI Agents SDK; consumes research context, style guides, editorial templates.
- **Editing Agent** (`src/agents/editingAgent.ts`): enforces tone, accuracy, fact-check prompts; runs grammar & clarity passes.
- **Optimization Agent** (`src/agents/optimizationAgent.ts`): performs SEO, internal link suggestions, CTA optimization, metadata updates.

Optional supporting modules:
- **Media Agent** (`src/agents/mediaAgent.ts`): requests MCP storage server for hero art, diagrams.
- **Notification Agent** (`src/agents/notificationAgent.ts`): sends progress updates to Slack/email via future MCP tool.

### 1.3 MCP Server Structure
- **Folder:** `apps/mcp/<server>` with `package.json` + `src/index.ts` per server, referencing [`docs/MCP-Guide.MD`](./MCP-Guide.MD) wiring patterns.
- **Servers:**
  - `apps/mcp/research`: wrappers for search APIs (Perplexity, arXiv, GitHub). Tools: `searchArticles`, `summarizePaper`, `extractCode`. Caches responses to reduce API spend.
  - `apps/mcp/blog`: secure Supabase interface for drafts/publishing. Tools: `getDraft`, `saveDraft`, `publishPost`, `listCategories`, `updateSeoMetadata`.
  - `apps/mcp/seo`: integrates with Clearscope/Ahrefs or open-source SEO analyzers. Tools: `analyzeKeywords`, `suggestHeadings`, `internalLinks`, `readabilityScore`.
  - `apps/mcp/storage`: Supabase Storage + optional S3. Tools: `uploadAsset`, `generateCaption`, `listAssets`.
- Each server exports `mcp.config.json` with tool schemas and authentication metadata.

### 1.4 Data Flow Between Components
1. Admin triggers workflow in dashboard (`src/app/(dashboard)/ai/page.tsx`).
2. Frontend calls `POST /api/ai/workflows` with workflow type + content id.
3. Route handler loads coordinator agent, creates `ai_workflows` record, seeds instructions.
4. Coordinator agent requests research data via MCP research server → stores results in `research_notes`.
5. Writing agent drafts content; saves intermediate versions to Supabase via MCP blog server.
6. Editing agent refines draft and ensures guidelines compliance.
7. Optimization agent updates SEO metadata, tags, internal links.
8. Workflow events streamed back to UI via Server-Sent Events (SSE) from `/api/ai/workflows/[id]/events`.
9. On completion, final draft displayed to human editor; optional publish action triggers MCP blog `publishPost` tool.

---

## 2. Dependency Analysis

### 2.1 npm Packages (add to `package.json`)
| Package | Version | Purpose |
| --- | --- | --- |
| `openai` | `^4.0.0` | Official TS client providing Agents SDK runtime. |
| `@openai/agents` | `^0.3.x` (beta) | Higher-level agent orchestration utilities. |
| `@modelcontextprotocol/sdk` | `^0.5.x` | MCP client/server contracts. |
| `ai` | `^3.1.0` | Vercel AI SDK hooks, streaming utilities for Next.js. |
| `zod` | `^3.23.8` | Input/output validation (agent configs, MCP tool schemas). |
| `p-retry` | `^6.0.1` | Retry logic around agent + MCP calls. |
| `eventemitter3` | `^5.0.1` | Workflow progress events in Node runtime. |
| `@supabase/supabase-js` | `^2.43.0` | Ensure compatibility with service-role operations. |
| `uuid` | `^9.0.1` | Generate workflow identifiers (if not from DB). |
| Dev: `ts-node`, `tsx`, `@types/eventemitter3`, `@types/node`, `vitest`, `@vitest/ui`, `@testing-library/react`, `msw` |

### 2.2 Version Compatibility
- Maintain Node 18.18+ to align with Next.js 14+ and Agents SDK requirements.
- Verify MCP SDK version matches protocol used in `docs/MCP-Guide.MD` (currently 0.5). Pin dependencies to avoid breaking changes.
- Ensure Supabase client minor version aligned with Supabase typings generated in `supabase/types`.

### 2.3 Environment Variables (`.env.example` & Vercel Dashboard)
```
OPENAI_API_KEY=
OPENAI_BASE_URL= # optional
AGENTS_MODEL=gpt-4.1-mini # default model override
MCP_RESEARCH_URL=
MCP_RESEARCH_TOKEN=
MCP_BLOG_URL=
MCP_BLOG_TOKEN=
MCP_SEO_URL=
MCP_SEO_TOKEN=
MCP_STORAGE_URL=
MCP_STORAGE_TOKEN=
SUPABASE_SERVICE_ROLE_KEY=
AGENTS_WORKSPACE_BUCKET= # Supabase storage bucket for AI artifacts
AI_WEBHOOK_SECRET= # optional for queue callbacks
```

### 2.4 Database Schema Updates (Supabase migrations)
Create SQL migration under `supabase/migrations/<timestamp>_ai_agents.sql`:
```sql
create table public.ai_workflows (
  id uuid primary key default gen_random_uuid(),
  workflow_type text not null,
  status text not null default 'pending',
  post_id uuid references public.posts(id),
  created_by uuid references auth.users(id),
  started_at timestamptz default now(),
  completed_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create table public.ai_workflow_events (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.ai_workflows(id) on delete cascade,
  agent text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table public.research_notes (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references public.ai_workflows(id) on delete cascade,
  post_id uuid references public.posts(id),
  summary text,
  references jsonb,
  created_at timestamptz default now()
);

alter table public.posts
  add column if not exists seo_metadata jsonb,
  add column if not exists ai_generated boolean default false;

create index on public.ai_workflows(status);
create index on public.ai_workflow_events(workflow_id, created_at);
```

---

## 3. Module Breakdown

### 3.1 Agents Runtime (`src/agents/`)
```
src/agents/
├─ coordinatorAgent.ts
├─ researchAgent.ts
├─ writingAgent.ts
├─ editingAgent.ts
├─ optimizationAgent.ts
├─ mediaAgent.ts (optional)
└─ types.ts
```
Key exports:
- `createCoordinatorAgent(config: CoordinatorConfig): AgentExecutor`
- `runWorkflow(workflowId: string, payload: StartWorkflowPayload): Promise<void>`
- `registerTools(agent: AgentExecutor, tools: ToolDefinition[]): void`

### 3.2 MCP Client Layer (`src/lib/mcp/`)
```
src/lib/mcp/
├─ client.ts        # base MCP client (connects using stdio/websocket per server)
├─ research.ts      # typed wrappers for research server tools
├─ blog.ts          # Supabase operations via MCP
├─ seo.ts           # SEO metrics + suggestions
├─ storage.ts       # media asset management
└─ schemas.ts       # zod schemas for tool payloads
```
MCP client uses config loaded from `process.env` and caches connections across invocations using singleton pattern.

### 3.3 AI Workflow Services (`src/services/ai/`)
- `workflowService.ts`: CRUD around `ai_workflows` table, triggered by API routes and agents.
- `eventBus.ts`: Node `EventEmitter` that streams workflow events to SSE endpoint.
- `promptTemplates.ts`: central repository of prompt fragments (style guide, SEO checklist, voice). Stored in `src/services/ai/prompts/`.
- `contextBuilder.ts`: merges post metadata, research notes, editorial guidelines.

### 3.4 API Routes (`src/app/api/ai/`)
```
src/app/api/ai/
├─ workflows/route.ts          # POST (start workflow), GET (list workflows)
├─ workflows/[id]/route.ts     # GET single workflow status
├─ workflows/[id]/events/route.ts # GET SSE stream of events
├─ drafts/[id]/route.ts        # GET/PUT AI drafts
└─ tools/[tool]/route.ts       # optional direct tool invocations for admins
```
Routes use Next.js Route Handlers (Node runtime). They instantiate coordinator agent, call MCP clients, and stream updates via `ReadableStream`.

### 3.5 Frontend Components (`src/app/(dashboard)/ai/`)
- `page.tsx`: Server Component retrieving workflows + metadata.
- `WorkflowLauncher.tsx`: Client component using `useTransition` to call `POST /api/ai/workflows`.
- `WorkflowTimeline.tsx`: Streams SSE events using `useEffect` and Vercel AI SDK `useStream`.
- `DraftPreview.tsx`: Displays current draft Markdown preview with diff viewer (e.g., `react-diff-viewer-continued`).
- `SeoInsights.tsx`: Summaries from optimization agent.

### 3.6 Database & Repository Layer (`src/lib/db/`)
- `workflowRepository.ts`: typed Supabase queries for workflows.
- `researchRepository.ts`: manage `research_notes`.
- `postRepository.ts`: extend existing post operations for SEO metadata + AI flags.

### 3.7 Testing Utilities (`tests/ai/`)
- `mocks/mcpServer.ts`: MSW or custom mocks simulating MCP responses.
- `coordinatorAgent.test.ts`: verifies orchestration logic.
- `workflowApi.test.ts`: integration tests hitting route handlers with mocked dependencies.
- `aiDashboard.spec.ts`: Playwright tests for UI flows.

---

## 4. Implementation Phases

### Phase 1 – Infrastructure & MCP Servers (Weeks 1-2)
1. **Project Setup**
   - Update `package.json` with dependencies + scripts (`"dev:mcp"`, `"build:mcp"`).
   - Extend `tsconfig.json` paths for `@agents/*`, `@mcp/*` aliases.
2. **Database migrations** using Supabase CLI; seed sample workflow data.
3. **MCP Server Scaffolding**
   - Create `apps/mcp/<server>` directories with TypeScript entrypoints using `@modelcontextprotocol/sdk` patterns from `docs/MCP-Guide.MD`.
   - Implement authentication (Bearer tokens, environment configuration).
4. **Deployment Pipeline Prep**
   - Add `scripts/deploy-mcp.ts` to bundle servers (esbuild) and upload to hosting (Vercel functions/Fly.io).
   - Configure Dockerfile if running MCP servers separately.

### Phase 2 – Agents SDK Integration (Weeks 3-4)
1. **Core Agent Modules** in `src/agents/` with strongly typed interfaces.
2. **Prompt Templates** capturing editorial voice; store as markdown/ts constants.
3. **Coordinator Workflow Logic** with state machine (pending → researching → drafting → editing → optimizing → review → completed/failed).
4. **MCP Client Integration**: connect agents to MCP tools; implement caching + retries.
5. **Logging & Telemetry** using `pino` + structured events.

### Phase 3 – API Development (Week 5)
1. Build `POST /api/ai/workflows` route to start workflows asynchronously (spawn background task using `setImmediate` or queue).
2. Implement SSE endpoint for workflow events.
3. Add draft management endpoints (GET/PUT) to allow manual edits.
4. Secure routes with Supabase Auth (admin-only) using middleware in `src/middleware.ts`.
5. Write integration tests (Vitest + supertest or Next.js `request` helper) for API behavior.

### Phase 4 – Frontend AI Interfaces (Weeks 6-7)
1. Create AI dashboard route; fetch workflows server-side via `workflowRepository`.
2. Build client components for launching workflows, streaming updates (Vercel AI SDK `useChat` or `useStream`).
3. Implement diff viewer + Markdown preview.
4. Add SEO insights panel with metrics and suggestions.
5. Ensure responsive neobrutalist styling aligning with design system.
6. Integrate notifications (toast, email triggers) if desired.

### Phase 5 – Testing, Optimization, Deployment (Week 8)
1. Achieve test coverage targets (unit, integration, E2E) for agents + UI.
2. Load test MCP servers; tune concurrency, implement caching.
3. Update documentation (`README.md`, `docs/operations/ai-agents.md`).
4. Configure CI to run `npm run lint`, `npm run type-check`, `npm run test`, `npm run build` + MCP builds.
5. Deploy MCP servers, verify environment variables, smoke test workflows in staging.
6. Roll out to production; monitor metrics and logs.

---

## 5. Task Dependencies & Critical Path

| Task | Depends On | Type |
| --- | --- | --- |
| Database migrations | None | Sequential start |
| MCP server scaffolding | Package updates | Parallel with migrations |
| Agents runtime | MCP tool schemas stable | Blocking |
| API routes | Agents runtime | Sequential |
| Frontend dashboard | API routes | Sequential |
| Testing suite | Agents + API | Parallel once modules exist |
| Deployment configuration | MCP + API + Frontend | Final |

**Critical Path:** `Dependencies → MCP Servers → Agents Runtime → API Routes → Frontend UI → Deployment`.

**Parallelizable:**
- Prompt template authoring with MCP builds.
- UI design + wireframes while backend finalizes API.
- Documentation updates rolling per phase.

**Blocking Dependencies:**
- Coordinator agent cannot finalize without MCP tool contracts.
- SSE endpoint relies on event bus implemented in agents runtime.
- Publishing workflow requires Supabase service role configuration.

---

## 6. Required Changes to Existing Codebase

- **New Directories**: `src/agents/`, `src/lib/mcp/`, `src/services/ai/`, `src/app/(dashboard)/ai/`, `apps/mcp/`.
- **Modified Files**:
  - `package.json`: dependencies, scripts (`"dev:mcp": "turbo run dev --filter apps/mcp..."` or custom), lint/test commands.
  - `tsconfig.json`: add path aliases (`"@agents/*": ["src/agents/*"]`).
  - `next.config.ts`: optional rewrites/proxies for MCP servers in local dev.
  - `README.md` + `docs/env.md`: setup instructions, env var list.
  - `supabase/types` regeneration after schema change.
- **New Files**:
  - `supabase/migrations/<timestamp>_ai_agents.sql`.
  - `src/middleware.ts` (if not present) enforcing admin access to AI routes.
  - `scripts/run-workflow.ts` CLI for manual agent triggers.
  - `docs/operations/ai-agents.md` for runbooks.

---

## 7. Risk Assessment & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| MCP protocol changes break clients | High | Medium | Pin versions, add contract tests, monitor MCP release notes. |
| Agent hallucinations/inaccurate content | High | High | Human-in-the-loop review, retrieval grounding, enforce citation prompts, log sources. |
| Supabase service role exposure | Critical | Low | Store keys server-side only, secure MCP blog server with token + IP allowlist, rotate keys. |
| Long-running workflows timing out | Medium | Medium | Use background workers (Next.js Route Handler with `waitUntil`, queue), stream updates via SSE. |
| Cost overruns from API usage | Medium | Medium | Implement quotas per user, cache research results, surface cost metrics in dashboard. |
| Performance regression in UI | Medium | Low | Use streaming updates, lazy load heavy components, memoize data fetchers. |
| Vendor lock-in | Medium | Medium | Abstract agent prompts + tool contracts, support swappable LLMs via `OPENAI_BASE_URL`. |

Security considerations:
- Sanitize AI output before persisting (`DOMPurify` server-side for HTML conversions).
- Apply rate limiting on AI endpoints using middleware (e.g., `@upstash/ratelimit`).
- Log audit trails in `ai_workflow_events` for compliance.

Scalability:
- Horizontal scale MCP servers (stateless) behind queue.
- Add job queue (Supabase Functions, Inngest, or Vercel Cron) for high concurrency.
- Partition `ai_workflow_events` or archive historical data periodically.

---

## 8. Success Metrics & Timeline

### 8.1 KPIs
- **Workflow Efficiency**: 90% of AI-assisted drafts ready for human review within 10 minutes.
- **Editor Satisfaction**: ≥4/5 rating in internal surveys after launch.
- **Content Quality**: Reduction of manual editing time by 40% vs baseline.
- **Reliability**: <2% workflow failure rate, monitored via logs/alerts.
- **Adoption**: At least 10 AI-initiated workflows per week after month 1.

### 8.2 Quality Gates
- ✅ Unit test coverage ≥80% for agents and MCP clients.
- ✅ Playwright E2E covering workflow launch, progress streaming, approval.
- ✅ Security review for environment variables, Supabase access, MCP auth.
- ✅ Load test demonstrates 10 concurrent workflows without degradation.

### 8.3 Timeline & Resources (Estimates)
| Phase | Duration | Primary Roles |
| --- | --- | --- |
| Phase 1 | 2 weeks | Backend engineer, DevOps |
| Phase 2 | 2 weeks | AI engineer, Backend |
| Phase 3 | 1 week | Backend engineer |
| Phase 4 | 1.5 weeks | Frontend engineer, UX |
| Phase 5 | 1 week | QA, DevOps |
| **Total** | **7.5 weeks** | Cross-functional team |

Resource assumptions: 1 FTE per role, part-time PM/technical writer support, availability for code reviews and stakeholder demos.

---

## 9. Integration Patterns & Best Practices
- Encapsulate Agents SDK logic behind interfaces so tests can mock generative outputs.
- Use Vercel AI SDK streaming primitives (`useChat`, `useCompletion`) to deliver incremental agent updates.
- Implement tool schemas with Zod to validate payloads before invoking MCP servers.
- Use `AbortController` to cancel workflows from UI.
- Persist prompts and agent configurations in versioned files to enable auditability.
- Leverage incremental static regeneration for blog posts that incorporate AI-generated metadata.

---

## 10. Testing Strategy & Deployment Plan

### Testing Layers
1. **Unit Tests**: Agents, MCP clients, prompt builders (`vitest`). Use dependency injection to mock OpenAI + MCP responses.
2. **Integration Tests**: API routes with mocked Supabase + MCP servers (MSW/undici interceptors).
3. **Contract Tests**: Validate MCP tool schemas vs Agents runtime expectations (run in CI).
4. **E2E Tests**: Playwright flows for AI dashboard, including SSE streaming and manual publish.
5. **Load & Chaos Tests**: Use Artillery/k6 scripts against MCP servers; introduce simulated failures to verify retries.

### Deployment Steps
1. Extend CI pipeline (`.github/workflows/ci.yml`) to build MCP packages (`npm run build:mcp`).
2. Deploy Next.js app to Vercel; ensure new env vars configured.
3. Deploy MCP servers (Vercel Functions, Fly.io, or containerized). Provide health endpoints.
4. Run smoke tests post-deploy using `scripts/run-workflow.ts` to initiate sample workflow.
5. Monitor logs (Vercel, Supabase) and set alerts (PagerDuty/Sentry) for workflow failures.

---

## 11. Next Actions
1. Review roadmap with stakeholders; adjust scope based on available third-party API licenses.
2. Create GitHub issues per task grouping (Phase/Module) with acceptance criteria.
3. Prepare design mockups for dashboard UI; align on neobrutalist styling guidelines.
4. Begin Phase 1: set up MCP server scaffolding and database migrations.
5. Schedule weekly demos + retro to iterate quickly on agent UX.

This roadmap provides the TypeScript-first blueprint to bring AI-assisted editorial capabilities to Syntax & Sips while maintaining security, performance, and developer productivity.
