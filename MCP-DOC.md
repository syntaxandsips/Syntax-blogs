# Syntax & Sips MCP + Agents Operations Guide

This guide explains how to configure, run, and operate the AI agent ecosystem that powers Syntax & Sips. Use it together with [`docs/MCP-Guide.MD`](docs/MCP-Guide.MD) for protocol details and [`docs/ai-agents.md`](docs/ai-agents.md) for an architectural overview.

## 1. Prerequisites

- Node.js 18.18+ (matches Next.js 15 requirements)
- npm 9+
- Supabase project with SQL access for running migrations
- Access tokens for any third-party research APIs referenced by MCP tooling
- Service role credentials for Supabase when running MCP servers locally

## 2. Directory Map

| Path | Description |
| --- | --- |
| `src/agents/` | Coordinator, research, writing, editing, and optimization agents with shared types/utilities. |
| `src/lib/mcp/` | Typed MCP HTTP clients and payload schemas for each server. |
| `apps/mcp/*` | Standalone MCP servers (research, blog, seo, storage). Each has its own `package.json` and `mcp.config.json`. |
| `src/services/ai/` | Workflow persistence, prompt templates, and event bus utilities. |
| `src/app/api/ai/` | Next.js API routes that orchestrate workflows, drafts, and direct tool usage. |
| `src/app/(dashboard)/ai/` | Dashboard UI for launching workflows and reviewing agent output. |
| `supabase/migrations/0013_create_ai_workflows.sql` | Database schema additions for AI workflows, events, research notes, and SEO metadata. |

## 3. Environment Variables

Define the following variables in `.env.local` (Next.js) and `.env` files inside each MCP server directory. See [`docs/env-ai.md`](docs/env-ai.md) for a tabular reference.

```
MCP_RESEARCH_URL=<http://localhost:5301/mcp>
MCP_RESEARCH_TOKEN=<optional bearer token>
MCP_BLOG_URL=<http://localhost:5302/mcp>
MCP_BLOG_SERVICE_KEY=<supabase service role key>
MCP_SEO_URL=<http://localhost:5303/mcp>
MCP_SEO_TOKEN=<optional bearer token>
MCP_STORAGE_URL=<http://localhost:5304/mcp>
MCP_STORAGE_TOKEN=<optional bearer token>
SUPABASE_URL=<your supabase project url>
SUPABASE_ANON_KEY=<anon key for Next.js app>
SERVICE_ROLE_KEY=<service key used by MCP blog/storage servers>
```

Each MCP server expects the same secrets at runtime. For example, `apps/mcp/blog` reads `SERVICE_ROLE_KEY` to sign Supabase requests on behalf of the dashboard workflow.

## 4. Database Setup

1. Authenticate Supabase CLI (`supabase login`).
2. Apply the AI schema migration:
   ```bash
   supabase db push
   ```
3. Verify that the following tables exist with Row Level Security policies:
   - `ai_workflows`
   - `ai_workflow_events`
   - `research_notes`
   - updated `posts` table columns (`seo_title`, `seo_description`, `ai_generated` flags)
4. Seed optional sample data by inserting into `ai_workflows` and `ai_workflow_events` for dashboard demos.

## 5. Running MCP Servers Locally

Each MCP server is an Express application exposing the Model Context Protocol via streamable HTTP transport.

```bash
# Research server
cd apps/mcp/research
npm install
npm run dev

# Blog server (requires Supabase SERVICE_ROLE_KEY)
cd apps/mcp/blog
npm install
npm run dev
```

Repeat for `apps/mcp/seo` and `apps/mcp/storage`. Ports default to 5301–5304 (configurable via `PORT`). Ensure ports match the URLs exported in your environment variables.

## 6. Starting the Next.js Dashboard

From the project root:

```bash
npm install
npm run dev
```

Log into Supabase via the site’s auth flow, then visit **`http://localhost:3000/ai`** to load the AI dashboard. The page streams workflow updates via Server-Sent Events (SSE), shows drafts, and renders SEO insights produced by the agents.

## 7. API Surface

All AI endpoints live beneath `/api/ai`:

- `POST /api/ai/workflows` – start a new workflow.
- `GET /api/ai/workflows` – list workflows for the current user.
- `GET /api/ai/workflows/:id` – retrieve workflow status metadata.
- `GET /api/ai/workflows/:id/events` – subscribe to SSE event stream.
- `GET|PATCH /api/ai/drafts/:id` – read or update generated drafts.
- `POST /api/ai/tools/:tool` – invoke an MCP tool directly (requires body matching the tool schema).

Requests are authenticated with Supabase session cookies; unauthenticated calls receive `401`.

## 8. Testing & Quality Gates

- Unit/integration tests: `npm test` (Vitest) and targeted agent specs under `tests/`.
- E2E tests: `npx playwright test`.
- Type safety: `npm run type-check` (`tsc --noEmit`).
- Linting: `npm run lint`.
- Production build validation: `npm run build` (set `CI=1` in headless environments to disable interactive spinners).

Run all commands before pushing changes. CI (`.github/workflows/ai-agents.yml`) mirrors these checks.

## 9. Deployment Checklist

1. Ensure MCP servers are containerized or deployed to Node runtimes with matching env vars.
2. Configure ingress to expose `/mcp` endpoints securely (TLS + auth headers).
3. Provide the Next.js app with production URLs for each MCP server via environment variables.
4. Set Supabase service keys and RLS policies for production data safety.
5. Monitor MCP server logs and Next.js telemetry for workflow errors. Configure alerting for failed agent runs or degraded search responses.

## 10. Troubleshooting

| Symptom | Resolution |
| --- | --- |
| Workflow creation returns 401 | Confirm you are signed in via Supabase and that cookies are forwarded to API routes. |
| SSE stream does not update | Ensure the coordinator agent emits events into `eventBus` and that MCP servers are reachable. Check browser console for EventSource errors. |
| MCP call fails with 403 | Validate the corresponding `*_TOKEN` or `SERVICE_ROLE_KEY` and confirm `Authorization` headers are enabled in the MCP server. |
| `npm run build` fails on missing env vars | Provide fallback values in `.env.production` or set `NEXT_PUBLIC_` variants for any client-exposed settings. |

Keep this document updated as the MCP implementations evolve beyond the current scaffolding.

### Build Warnings When Supabase Is Offline

Running `CI=1 npm run build` without access to the configured Supabase project will surface `fetch failed` warnings while the
Next.js build pre-renders pages such as `/blogs`, the homepage, and `sitemap.xml`. These warnings occur because static-path
generation invokes Supabase REST endpoints to enumerate posts. In offline development environments you can:

- Provide dummy Supabase credentials that point to a test project with seed data, or
- Temporarily stub the fetches in `app/page.ts`, `app/blogs/page.ts`, and `app/sitemap.xml/route.ts` behind an environment
  flag (e.g., `SUPABASE_DISABLE_FETCH=1`) so static generation skips live calls.

The warnings do not fail the build as long as the pages handle missing data defensively; CI still reports a successful exit.
