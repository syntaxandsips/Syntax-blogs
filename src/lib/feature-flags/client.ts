'use client'

import { useEffect, useState } from 'react'
import type { FeatureFlagKey } from './registry'

const DEFAULT_FLAG_STATE: Partial<Record<FeatureFlagKey, boolean>> = {}
let globalCache: Partial<Record<FeatureFlagKey, boolean>> | null = null
let inflight: Promise<Partial<Record<FeatureFlagKey, boolean>>> | null = null

const ensureFlags = async (): Promise<Partial<Record<FeatureFlagKey, boolean>>> => {
  if (globalCache) {
    return globalCache
  }

  if (!inflight) {
    inflight = fetch('/api/feature-flags', { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json()) as {
          flags?: Record<string, boolean>
        }

        if (!response.ok) {
          throw new Error(payload?.['error'] ?? 'Unable to load feature flags')
        }

        const normalized: Partial<Record<FeatureFlagKey, boolean>> = {}
        const entries = Object.entries(payload.flags ?? {})

        for (const [flagKey, enabled] of entries) {
          normalized[flagKey as FeatureFlagKey] = Boolean(enabled)
        }

        globalCache = normalized
        return normalized
      })
      .finally(() => {
        inflight = null
      })
  }

  return inflight ?? DEFAULT_FLAG_STATE
}

export const useFeatureFlag = (
  flagKey: FeatureFlagKey,
  initialValue = false,
): boolean => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (globalCache && typeof globalCache[flagKey] === 'boolean') {
      return globalCache[flagKey] as boolean
    }

    return initialValue
  })

  useEffect(() => {
    let isMounted = true

    ensureFlags()
      .then((flags) => {
        if (!isMounted) {
          return
        }

        const value = flags[flagKey]

        if (typeof value === 'boolean') {
          setEnabled(value)
        }
      })
      .catch(() => undefined)

    return () => {
      isMounted = false
    }
  }, [flagKey])

  return enabled
}

export const useFeatureFlags = (
  initialState?: Partial<Record<FeatureFlagKey, boolean>>,
): Partial<Record<FeatureFlagKey, boolean>> => {
  const [flags, setFlags] = useState<Partial<Record<FeatureFlagKey, boolean>>>(() => {
    if (globalCache) {
      return globalCache
    }

    return initialState ?? {}
  })

  useEffect(() => {
    let isMounted = true

    ensureFlags()
      .then((resolved) => {
        if (isMounted) {
          setFlags(resolved)
        }
      })
      .catch(() => undefined)

    return () => {
      isMounted = false
    }
  }, [])

  return flags
}

export const primeFeatureFlagCache = (flags: Partial<Record<FeatureFlagKey, boolean>>) => {
  globalCache = {
    ...(globalCache ?? {}),
    ...flags,
  }
}
