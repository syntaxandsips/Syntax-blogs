import express from 'express';
import pino from 'pino';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

const NEWS_API_URL = process.env.RESEARCH_NEWS_API ?? 'https://hn.algolia.com/api/v1/search';

const server = new McpServer({
  name: 'syntax-sips-research',
  version: '0.1.0',
});

const SearchInputSchema = z.object({
  query: z.string(),
  limit: z.number().int().positive().max(10).default(5),
});

server.registerTool(
  'search',
  {
    title: 'Search knowledge sources',
    description: 'Run federated search across configured providers',
  },
  async payload => {
    const { query, limit } = SearchInputSchema.parse(payload);
    logger.info({ query, limit }, 'Executing research search');

    const url = new URL(NEWS_API_URL);
    url.searchParams.set('query', query);
    url.searchParams.set('hitsPerPage', String(limit));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Research API failed with status ${response.status}`);
    }

    const data = (await response.json()) as { hits: Array<{ title: string; url: string; story_text?: string }> };

    const sources = data.hits.map(hit => ({
      title: hit.title ?? 'Untitled',
      url: hit.url ?? 'https://news.ycombinator.com',
      snippet: hit.story_text?.slice(0, 180),
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            sources,
            summary: sources
              .map(source => `- ${source.title}`)
              .slice(0, 5)
              .join('\n'),
          }),
        },
      ],
      structuredContent: {
        sources,
        summary: sources
          .map(source => `- ${source.title}`)
          .slice(0, 5)
          .join('\n'),
      },
    };
  },
);

const app = express();
app.use(express.json());

app.post('/mcp', async (request, response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  response.on('close', () => transport.close());

  await server.connect(transport);
  await transport.handleRequest(request, response, request.body);
});

const port = Number.parseInt(process.env.PORT ?? '4000', 10);
app.listen(port, () => {
  logger.info({ port }, 'Research MCP server listening');
});
