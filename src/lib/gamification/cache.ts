import { Redis } from '@upstash/redis';
import type { CachedValue } from './types';

let redis: Redis | null = null;
const inMemoryCache = new Map<string, CachedValue<unknown>>();

const getRedisClient = () => {
  if (redis) {
    return redis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    redis = new Redis({ url, token });
  }

  return redis;
};

export const getCached = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();

  if (client) {
    const result = await client.get<CachedValue<T>>(key);

    if (result && typeof result === 'object' && typeof (result as CachedValue<T>).expiresAt === 'number') {
      if ((result as CachedValue<T>).expiresAt > Date.now()) {
        return (result as CachedValue<T>).value;
      }

      await client.del(key).catch(() => {});
      return null;
    }

    return null;
  }

  const entry = inMemoryCache.get(key) as CachedValue<T> | undefined;

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    inMemoryCache.delete(key);
    return null;
  }

  return entry.value;
};

export const setCached = async <T>(key: string, value: T, ttlMs: number) => {
  const payload: CachedValue<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };

  const client = getRedisClient();

  if (client) {
    await client.set(key, payload, { ex: Math.floor(ttlMs / 1000) }).catch(() => {});
    return;
  }

  inMemoryCache.set(key, payload);
};

export const deleteCached = async (key: string) => {
  const client = getRedisClient();

  if (client) {
    await client.del(key).catch(() => {});
  }

  inMemoryCache.delete(key);
};
