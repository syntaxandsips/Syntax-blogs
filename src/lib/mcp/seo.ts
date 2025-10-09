import { getMcpClient } from './client';
import { SeoAnalysisResponseSchema, SeoAnalysisSchema } from './schemas';

interface SeoClientOptions {
  baseUrl: string;
  token?: string;
}

export async function runSeoAnalysis(options: SeoClientOptions, payload: unknown) {
  const parsed = SeoAnalysisSchema.parse(payload);
  const client = await getMcpClient({
    baseUrl: options.baseUrl,
    name: 'seo-client',
    version: '1.0.0',
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
  });

  const result = await client.callTool({
    name: 'analyze-seo',
    arguments: parsed,
  });

  return SeoAnalysisResponseSchema.parse(result);
}
