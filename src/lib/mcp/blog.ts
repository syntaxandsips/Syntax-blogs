import { getMcpClient } from './client';
import { DraftUpdateSchema } from './schemas';

interface BlogClientOptions {
  baseUrl: string;
  serviceRoleKey?: string;
}

export async function updateDraft(options: BlogClientOptions, payload: unknown) {
  const parsed = DraftUpdateSchema.parse(payload);
  const client = await getMcpClient({
    baseUrl: options.baseUrl,
    name: 'blog-client',
    version: '1.0.0',
    headers: options.serviceRoleKey ? { 'x-service-key': options.serviceRoleKey } : undefined,
  });

  return client.callTool({
    name: 'update-draft',
    arguments: parsed,
  });
}

export async function getDraft(options: BlogClientOptions, postId: string) {
  const client = await getMcpClient({
    baseUrl: options.baseUrl,
    name: 'blog-client',
    version: '1.0.0',
    headers: options.serviceRoleKey ? { 'x-service-key': options.serviceRoleKey } : undefined,
  });

  return client.callTool({
    name: 'get-draft',
    arguments: { postId },
  });
}
