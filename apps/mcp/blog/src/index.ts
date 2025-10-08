import crypto from 'node:crypto';

import express from 'express';
import pino from 'pino';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const SERVICE_KEY = process.env.SERVICE_ROLE_KEY ?? 'development-key';

interface DraftRecord {
  draft: string;
  metadata?: Record<string, unknown>;
  updated_at: string;
}

const drafts = new Map<string, DraftRecord>();

const server = new McpServer({
  name: 'syntax-sips-blog',
  version: '0.1.0',
});

const DraftSchema = z.object({
  postId: z.string(),
  draft: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

server.registerTool(
  'update-draft',
  {
    title: 'Update Draft',
    description: 'Persist a draft revision',
    inputSchema: DraftSchema,
    outputSchema: z.object({
      success: z.boolean(),
      checksum: z.string(),
    }),
  },
  async ({ postId, draft, metadata }) => {
    const checksum = crypto.createHash('sha256').update(draft).digest('hex');
    drafts.set(postId, { draft, metadata, updated_at: new Date().toISOString() });
    logger.info({ postId, checksum }, 'Draft updated');

    return {
      content: [{ type: 'text', text: JSON.stringify({ success: true, checksum }) }],
      structuredContent: { success: true, checksum },
    };
  },
);

server.registerTool(
  'get-draft',
  {
    title: 'Get Draft',
    description: 'Retrieve stored draft content',
    inputSchema: z.object({ postId: z.string() }),
    outputSchema: z.object({
      draft: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
      updated_at: z.string().optional(),
    }),
  },
  async ({ postId }) => {
    const draft = drafts.get(postId);
    return {
      content: [{ type: 'text', text: JSON.stringify(draft ?? {}) }],
      structuredContent: draft ?? {},
    };
  },
);

const app = express();
app.use(express.json());

app.use((request, response, next) => {
  if (request.headers['x-service-key'] !== SERVICE_KEY) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

app.post('/mcp', async (request, response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  response.on('close', () => transport.close());

  await server.connect(transport);
  await transport.handleRequest(request, response, request.body);
});

const port = Number.parseInt(process.env.PORT ?? '4001', 10);
app.listen(port, () => {
  logger.info({ port }, 'Blog MCP server listening');
});
