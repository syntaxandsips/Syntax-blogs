import { getMcpClient } from './client';
import { ResearchQuerySchema, ResearchResponseSchema } from './schemas';

interface ResearchClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export async function runResearchQuery(options: ResearchClientOptions, payload: unknown) {
  const parsed = ResearchQuerySchema.parse(payload);
  const client = await getMcpClient({
    baseUrl: options.baseUrl,
    name: 'research-client',
    version: '1.0.0',
    headers: options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : undefined,
  });

  const result = await client.callTool({
    name: 'search',
    arguments: parsed,
  });

  return ResearchResponseSchema.parse(result);
}
