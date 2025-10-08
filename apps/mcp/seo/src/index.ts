import express from 'express';
import nlp from 'compromise';
import pino from 'pino';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

const server = new McpServer({
  name: 'syntax-sips-seo',
  version: '0.1.0',
});

const AnalysisSchema = z.object({
  draft: z.string(),
  focusKeyword: z.string(),
});

server.registerTool(
  'analyze-seo',
  {
    title: 'Analyze SEO',
    description: 'Evaluate draft content for SEO quality',
    inputSchema: AnalysisSchema,
    outputSchema: z.object({
      score: z.number(),
      recommendations: z.array(z.string()),
    }),
  },
  async ({ draft, focusKeyword }) => {
    const doc = nlp(draft);
    const sentences = doc.sentences().out('array');
    const keywordCount = doc.match(focusKeyword).out('array').length;
    const totalWords = doc.wordCount();

    const keywordDensity = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
    const hasHeadline = /^#+\s/m.test(draft);
    const hasLinks = /https?:\/\//.test(draft);

    const recommendations: string[] = [];
    if (keywordDensity < 1) {
      recommendations.push('Increase focus keyword usage to at least 1% of total words.');
    }
    if (!hasHeadline) {
      recommendations.push('Add at least one heading to structure the content.');
    }
    if (!hasLinks) {
      recommendations.push('Include internal or external links to support claims.');
    }
    if (sentences.some(sentence => sentence.length > 160)) {
      recommendations.push('Shorten long sentences for readability.');
    }

    const score = Math.min(100, Math.round(70 + keywordDensity * 2 + (hasHeadline ? 10 : 0) + (hasLinks ? 5 : 0)));

    return {
      content: [{ type: 'text', text: JSON.stringify({ score, recommendations }) }],
      structuredContent: { score, recommendations },
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

const port = Number.parseInt(process.env.PORT ?? '4002', 10);
app.listen(port, () => {
  logger.info({ port }, 'SEO MCP server listening');
});
