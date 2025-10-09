# AI Agents Integration Overview

This document summarizes the scaffolding implemented for the Syntax & Sips AI workflows.

## Components

- **Agents**: Coordinator, Research, Writing, Editing, Optimization stubs live in `src/agents/` with shared types and retry utilities.
- **MCP Client Layer**: Located in `src/lib/mcp/` providing typed helpers for research, blog, SEO, and storage servers.
- **Services**: Workflow management utilities in `src/services/ai/` handle Supabase persistence and event broadcasting.
- **API Routes**: Endpoints under `src/app/api/ai/` expose workflow management, draft access, and tool execution with SSE streaming support.
- **Dashboard UI**: The dashboard route `src/app/(dashboard)/ai` renders launch, timeline, draft, and SEO insight panels.
- **MCP Servers**: Four lightweight servers are defined under `apps/mcp/*` for research, blog, SEO, and storage operations.

## Local Development

1. Install dependencies at the project root with `npm install`.
2. Each MCP server has its own `package.json`; install dependencies with `npm install` inside the server directory before running.
3. Start the research server as an example:
   ```bash
   cd apps/mcp/research
   npm install
   npm run dev
   ```
4. Configure environment variables for API routes and client helpers:
   - `MCP_RESEARCH_URL`
   - `MCP_BLOG_URL`
   - `MCP_SEO_URL`
   - `MCP_STORAGE_URL`
   - Optional auth tokens such as `MCP_RESEARCH_TOKEN`.
5. Run `npm run dev` at the project root to access the dashboard at `/ai` (under the dashboard segment).

## Database

Run Supabase migrations to create AI workflow tables:
```bash
supabase db push
```
The new migration adds workflow state, events, research notes, and SEO metadata columns on `posts`.

## Testing

Basic coordinator and retry unit coverage is provided via Playwright test harness in `tests/ai-agents.spec.ts`.

## Monitoring & Alerting

- Configure Vercel Analytics or an APM provider to watch dashboard performance (`npm run build` ensures instrumentation hooks run).
- Aggregate MCP server logs via pino transports (e.g., ship to Datadog or Logflare) to track error rates and latency.
- Add heartbeat checks for each MCP server endpoint (`/mcp`) using your uptime monitor of choice.

## Next Steps

- Replace in-memory storage used by the MCP blog and storage servers with Supabase integrations.
- Expand agent implementations to call MCP clients and emit workflow events.
- Add comprehensive end-to-end scenarios covering dashboard streaming behaviour.
