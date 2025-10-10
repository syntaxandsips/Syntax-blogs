# MCP Blog Workflow Playbook

This playbook summarizes how the Syntax & Sips stack wires Model Context Protocol (MCP) servers to the AI agents that generate long-form blog content and deliver it into the publishing pipeline. Use it when you are bootstrapping a new environment or onboarding teammates who will operate the workflow.

## 1. Provision the AI + MCP runtime

1. **Install runtime prerequisites** – Node.js 18.18+, npm 9+, and Supabase CLI access are required to run the Next.js app and the dedicated MCP servers. Configure any research API keys that your MCP research server consumes.  
2. **Seed the AI schema** – Apply the Supabase migration bundle so the platform can persist workflows, events, drafts, and research artifacts: `supabase db push`. This creates the `ai_workflows`, `ai_workflow_events`, and `research_notes` tables plus AI-specific columns on `posts`.  
3. **Export environment variables** – Each MCP client and server reads URLs and auth secrets such as `MCP_RESEARCH_URL`, `MCP_BLOG_URL`, `MCP_SEO_URL`, `MCP_STORAGE_URL`, and per-service tokens or the Supabase `SERVICE_ROLE_KEY`. Mirror these variables in `.env.local` for the Next.js app and `.env` files inside each `apps/mcp/*` directory.

## 2. Run the MCP surface area

1. **Research server** (`apps/mcp/research`) exposes the `search` tool that queries external news APIs and returns structured source summaries.  
2. **Blog server** (`apps/mcp/blog`) wraps Supabase draft persistence behind tools such as `update-draft` and `get-draft`, protecting access with the `x-service-key` header.  
3. **SEO server** (`apps/mcp/seo`) evaluates drafts with the `analyze-seo` tool to produce scores and actionable recommendations.  
4. **Storage server** (`apps/mcp/storage`) lets agents upload encoded assets via the `upload-asset` tool.  
5. Start each Express server with `npm run dev` (ports default to 5301–5304) and confirm the `/mcp` endpoints respond when called with the configured secrets.

## 3. Connect MCP clients inside Next.js

1. The shared MCP client factory (`src/lib/mcp/client.ts`) keeps HTTP transports cached per server URL and injects headers for bearer or service-role authentication.  
2. Feature-specific helpers (`src/lib/mcp/research.ts`, `blog.ts`, `seo.ts`, `storage.ts`) validate payloads with Zod schemas before invoking the respective MCP tools.  
3. Agent implementations route tool invocations through these helpers so that retries, auth, and schema guarantees stay centralized.

## 4. Orchestrate AI workflows

1. The AI dashboard triggers `POST /api/ai/workflows`, which authenticates the caller through Supabase, persists a workflow record, and emits a `workflow:created` event.  
2. SSE consumers subscribe to `/api/ai/workflows/[id]/events` to stream historical events plus live updates emitted by the in-process `eventBus`.  
3. Service-role Supabase clients in `workflowService.ts` read and append workflow metadata, while the coordinator agent composes research, writing, editing, and optimization steps with retryable tool routing.

## 5. Generate and publish a blog post

1. A human editor (or scheduled automation) kicks off a workflow with the desired topic and outline.  
2. The research agent fans out queries, deduplicates sources, and summarizes findings; the results are available to downstream steps and can be surfaced in the dashboard.  
3. The writing agent drafts or revises copy using the outline, research summary, and editorial guidelines, then persists the latest draft through the blog MCP server.  
4. Optimization agents call SEO and storage MCP tools to refine metadata, recommend improvements, and attach media assets.  
5. Once the workflow reaches a completed state, an editor can review the stored draft (via Supabase or the dashboard) and publish it using existing CMS flows. Future enhancements can add a `publish-post` MCP tool so the coordinator can finalize publication automatically once approval gates are satisfied.

Keep this document alongside the deeper protocol reference in `docs/MCP-Guide.MD` and update it as new MCP tools or agent responsibilities land.
