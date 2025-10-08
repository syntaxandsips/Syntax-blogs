import EventEmitter from 'node:events';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

interface McpClientOptions {
  baseUrl: string;
  name: string;
  version: string;
  headers?: Record<string, string>;
}

interface CachedClient {
  client: Client;
  transport: StreamableHTTPClientTransport;
  emitter: EventEmitter;
}

const cache = new Map<string, CachedClient>();

export async function getMcpClient(options: McpClientOptions): Promise<Client> {
  const cacheKey = `${options.name}:${options.baseUrl}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached.client;
  }

  const transport = new StreamableHTTPClientTransport(new URL(options.baseUrl), {
    headers: options.headers,
  });

  const client = new Client({
    name: options.name,
    version: options.version,
  });

  await client.connect(transport);

  const emitter = new EventEmitter();
  client.on('notification', notification => {
    emitter.emit('notification', notification);
  });

  cache.set(cacheKey, { client, transport, emitter });
  return client;
}

export function getMcpClientEmitter(baseUrl: string, name: string): EventEmitter | undefined {
  return cache.get(`${name}:${baseUrl}`)?.emitter;
}

export async function closeMcpClient(baseUrl: string, name: string): Promise<void> {
  const cacheKey = `${name}:${baseUrl}`;
  const cached = cache.get(cacheKey);
  if (!cached) {
    return;
  }

  await cached.transport.close();
  cache.delete(cacheKey);
}
