import 'server-only'

import { performance } from 'node:perf_hooks'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { recordHistogram } from '@/lib/observability/metrics'
import {
  FEATURE_FLAG_DEFAULTS,
  FEATURE_FLAG_KEYS,
  type FeatureFlagDefinition,
  type FeatureFlagKey,
  type FeatureFlagRow,
} from './registry'

const FLAG_CACHE_TTL_MS = 30_000

let cachedFlags: Map<FeatureFlagKey, FeatureFlagDefinition> | null = null
let cacheExpiresAt = 0
let inflight: Promise<Map<FeatureFlagKey, FeatureFlagDefinition>> | null = null

const buildDefaultMap = (): Map<FeatureFlagKey, FeatureFlagDefinition> => {
  const entries = FEATURE_FLAG_KEYS.map((key) => [key, FEATURE_FLAG_DEFAULTS[key]])
  return new Map(entries)
}

const mapRowToDefinition = (row: FeatureFlagRow): FeatureFlagDefinition => ({
  flagKey: row.flag_key,
  description: row.description ?? FEATURE_FLAG_DEFAULTS[row.flag_key].description,
  enabled: row.enabled ?? false,
  owner: row.owner ?? FEATURE_FLAG_DEFAULTS[row.flag_key].owner,
  metadata: row.metadata ?? {},
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const fetchFlagsFromDatabase = async (): Promise<Map<FeatureFlagKey, FeatureFlagDefinition>> => {
  const supabase = createServiceRoleClient<Database>()

  const { data, error } = await supabase
    .from('feature_flags')
    .select('id, flag_key, description, enabled, owner, metadata, created_at, updated_at')
    .order('flag_key', { ascending: true })

  if (error) {
    console.error('[feature-flags] Unable to load feature flags', error)
    return buildDefaultMap()
  }

  const map = buildDefaultMap()

  for (const row of data ?? []) {
    map.set(row.flag_key, mapRowToDefinition(row))
  }

  return map
}

const resolveFlags = async (): Promise<Map<FeatureFlagKey, FeatureFlagDefinition>> => {
  const now = Date.now()

  if (cachedFlags && cacheExpiresAt > now) {
    return cachedFlags
  }

  if (!inflight) {
    inflight = fetchFlagsFromDatabase().then((result) => {
      cachedFlags = result
      cacheExpiresAt = Date.now() + FLAG_CACHE_TTL_MS
      inflight = null
      return result
    })
  }

  return inflight
}

export const getFeatureFlagSnapshot = async (): Promise<Record<FeatureFlagKey, FeatureFlagDefinition>> => {
  const map = await resolveFlags()
  return FEATURE_FLAG_KEYS.reduce((accumulator, key) => {
    accumulator[key] = map.get(key) ?? FEATURE_FLAG_DEFAULTS[key]
    return accumulator
  }, {} as Record<FeatureFlagKey, FeatureFlagDefinition>)
}

export const isFeatureEnabled = async (flagKey: FeatureFlagKey): Promise<boolean> => {
  const start = performance.now()
  const snapshot = await getFeatureFlagSnapshot()
  const enabled = snapshot[flagKey]?.enabled ?? false
  const elapsed = performance.now() - start

  recordHistogram('flag_evaluation_latency_ms', elapsed, { flag_key: flagKey })

  return enabled
}

export const getFeatureFlagDefinition = async (
  flagKey: FeatureFlagKey,
): Promise<FeatureFlagDefinition> => {
  const snapshot = await getFeatureFlagSnapshot()
  return snapshot[flagKey] ?? FEATURE_FLAG_DEFAULTS[flagKey]
}

export const invalidateFeatureFlagCache = () => {
  cachedFlags = null
  cacheExpiresAt = 0
  inflight = null
}

export const upsertFeatureFlagCache = (definition: FeatureFlagDefinition) => {
  if (!cachedFlags) {
    cachedFlags = buildDefaultMap()
  }

  cachedFlags.set(definition.flagKey, definition)
  cacheExpiresAt = Date.now() + FLAG_CACHE_TTL_MS
}
