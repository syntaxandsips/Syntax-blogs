import type { Database } from '@/lib/supabase/types'
import type { SupabaseClient } from './types'

type CacheValue<T> = {
  value: T
  expiresAt: number
}

const inMemoryCache = new Map<string, CacheValue<unknown>>()

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

const hasUpstash = Boolean(upstashUrl && upstashToken)

const serialize = (value: unknown) => JSON.stringify(value)
const deserialize = <T>(raw: string | null): T | null => (raw ? (JSON.parse(raw) as T) : null)

export const buildCacheKey = (...parts: Array<string | number | undefined>) =>
  parts
    .filter((part) => part !== undefined && part !== null)
    .map((part) => String(part))
    .join(':')

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (hasUpstash) {
    try {
      const response = await fetch(`${upstashUrl}/get/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${upstashToken}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        return null
      }

      const payload = (await response.json()) as { result: string | null }
      return deserialize<T>(payload.result)
    } catch (error) {
      console.error('Failed to fetch from Upstash cache', error)
    }
  }

  const cached = inMemoryCache.get(key)

  if (!cached) {
    return null
  }

  if (Date.now() > cached.expiresAt) {
    inMemoryCache.delete(key)
    return null
  }

  return cached.value as T
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  const expiresAt = Date.now() + ttlSeconds * 1000

  if (hasUpstash) {
    try {
      await fetch(`${upstashUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(serialize(value))}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ex: ttlSeconds }),
      })
    } catch (error) {
      console.error('Failed to write to Upstash cache', error)
    }
  }

  inMemoryCache.set(key, { value, expiresAt })
}

export async function cacheInvalidate(prefix: string) {
  if (hasUpstash) {
    try {
      await fetch(`${upstashUrl}/del/${encodeURIComponent(prefix)}:*`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
        },
      })
    } catch (error) {
      console.error('Failed to invalidate Upstash cache', error)
    }
  }

  for (const key of inMemoryCache.keys()) {
    if (key.startsWith(prefix)) {
      inMemoryCache.delete(key)
    }
  }
}

export const clearLeaderboardSnapshots = async (supabase: SupabaseClient, scope?: string) => {
  try {
    const baseQuery = supabase.from('leaderboard_snapshots').delete()
    const query = scope ? baseQuery.eq('scope', scope) : baseQuery.gte('captured_at', '1970-01-01T00:00:00Z')
    const { error } = await query

    if (error) {
      console.error('Failed to clear leaderboard snapshots', error)
    }
  } catch (error) {
    console.error('Unexpected error while clearing leaderboard snapshots', error)
  }
}

export const upsertGamificationProfile = async (
  supabase: SupabaseClient,
  profileId: string,
  payload: Partial<Database['public']['Tables']['gamification_profiles']['Insert']>,
) => {
  await supabase
    .from('gamification_profiles')
    .upsert({ profile_id: profileId, ...payload }, { onConflict: 'profile_id' })
}
