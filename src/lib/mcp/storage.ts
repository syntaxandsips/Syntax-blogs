import { getMcpClient } from './client';
import { StorageUploadSchema } from './schemas';

interface StorageClientOptions {
  baseUrl: string;
  token?: string;
}

export async function uploadAsset(options: StorageClientOptions, payload: unknown) {
  const parsed = StorageUploadSchema.parse(payload);
  const client = await getMcpClient({
    baseUrl: options.baseUrl,
    name: 'storage-client',
    version: '1.0.0',
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
  });

  return client.callTool({
    name: 'upload-asset',
    arguments: parsed,
  });
}
