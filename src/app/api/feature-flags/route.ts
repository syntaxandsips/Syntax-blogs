import { NextResponse } from 'next/server'
import { FEATURE_FLAG_KEYS, isFeatureFlagKey, type FeatureFlagKey } from '@/lib/feature-flags/registry'
import { getFeatureFlagSnapshot } from '@/lib/feature-flags/server'

const normalizeKeys = (rawKeys: string[] | null): FeatureFlagKey[] => {
  if (!rawKeys || rawKeys.length === 0) {
    return FEATURE_FLAG_KEYS.slice()
  }

  const seen = new Set<FeatureFlagKey>()

  for (const key of rawKeys) {
    const trimmed = key.trim()

    if (isFeatureFlagKey(trimmed)) {
      seen.add(trimmed)
    }
  }

  return Array.from(seen)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const keysParam = url.searchParams.get('keys')
  const requestedKeys = normalizeKeys(keysParam ? keysParam.split(',') : null)

  const snapshot = await getFeatureFlagSnapshot()
  const flags: Partial<Record<FeatureFlagKey, boolean>> = {}

  for (const key of requestedKeys) {
    flags[key] = snapshot[key]?.enabled ?? false
  }

  return NextResponse.json({
    flags,
    evaluatedAt: new Date().toISOString(),
  })
}
