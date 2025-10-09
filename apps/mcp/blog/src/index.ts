import crypto from 'node:crypto';

import express from 'express';
import pino from 'pino';
import { z, type ZodTypeAny } from 'zod';
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

const draftInputShape = {
  postId: z.string(),
  draft: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
} satisfies Record<string, ZodTypeAny>;

const DraftSchema = z.object(draftInputShape);

const DraftResponseSchema = z.object({
  draft: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  updated_at: z.string().optional(),
});

const DraftLookupSchema = z.object({ postId: z.string() });

server.registerTool(
  'update-draft',
  {
    title: 'Update Draft',
    description: 'Persist a draft revision',
  },
  async args => {
    const { postId, draft, metadata } = DraftSchema.parse(args);
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
  },
  async args => {
    const { postId } = DraftLookupSchema.parse(args);
    const draft = DraftResponseSchema.parse(drafts.get(postId) ?? {});
    return {
      content: [{ type: 'text', text: JSON.stringify(draft) }],
      structuredContent: draft,
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
