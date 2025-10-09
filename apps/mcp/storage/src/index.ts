import express from 'express';
import pino from 'pino';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

const server = new McpServer({
  name: 'syntax-sips-storage',
  version: '0.1.0',
});

const UploadSchema = z.object({
  path: z.string(),
  contentType: z.string(),
  data: z.string(),
});

const assets = new Map<string, { contentType: string; data: string; uploaded_at: string }>();

server.registerTool(
  'upload-asset',
  {
    title: 'Upload Asset',
    description: 'Upload media assets to storage',
  },
  async payload => {
    const { path, contentType, data } = UploadSchema.parse(payload);
    assets.set(path, { contentType, data, uploaded_at: new Date().toISOString() });
    const url = `storage://syntx/${encodeURIComponent(path)}`;
    logger.info({ path, contentType }, 'Asset uploaded');

    return {
      content: [{ type: 'text', text: JSON.stringify({ success: true, url }) }],
      structuredContent: { success: true, url },
    };
  },
);

const app = express();
app.use(express.json({ limit: '5mb' }));

app.post('/mcp', async (request, response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  response.on('close', () => transport.close());

  await server.connect(transport);
  await transport.handleRequest(request, response, request.body);
});

const port = Number.parseInt(process.env.PORT ?? '4003', 10);
app.listen(port, () => {
  logger.info({ port }, 'Storage MCP server listening');
});
