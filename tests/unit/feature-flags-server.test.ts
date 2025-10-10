import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@/lib/supabase/server-client', () => ({
  createServiceRoleClient: vi.fn(),
}))

vi.mock('@/lib/observability/metrics', () => ({
  recordHistogram: vi.fn(),
}))

vi.mock('server-only', () => ({}))

import { createServiceRoleClient } from '@/lib/supabase/server-client'
import { recordHistogram } from '@/lib/observability/metrics'

const createSupabaseClient = (
  rows: Array<{
    flag_key: 'spaces_v1' | 'content_templates_v1' | 'rbac_hardening_v1'
    description: string
    enabled: boolean
    owner: string
    metadata: Record<string, unknown>
    created_at: string
    updated_at: string
  }> | null,
  error: Error | null = null,
) => {
  const order = vi.fn().mockResolvedValue({ data: rows, error })
  const select = vi.fn().mockReturnValue({ order })
  const from = vi.fn(() => ({ select }))

  return { from, select, order }
}

const serviceRoleClientMock = createServiceRoleClient as unknown as Mock
const recordHistogramMock = recordHistogram as unknown as Mock

const loadModule = async () => import('@/lib/feature-flags/server')

describe('feature flag server helpers', () => {
  beforeEach(() => {
    vi.resetModules()
    serviceRoleClientMock.mockReset()
    recordHistogramMock.mockReset()
  })

  it('returns default state when Supabase errors', async () => {
    const client = createSupabaseClient(null, new Error('boom'))
    serviceRoleClientMock.mockReturnValue(client)

    const { isFeatureEnabled } = await loadModule()
    const enabled = await isFeatureEnabled('spaces_v1')

    expect(enabled).toBe(false)
    expect(client.from).toHaveBeenCalledTimes(1)
    expect(recordHistogramMock).toHaveBeenCalledWith(
      'flag_evaluation_latency_ms',
      expect.any(Number),
      { flag_key: 'spaces_v1' },
    )
  })

  it('hydrates cache and reuses values on subsequent evaluations', async () => {
    const now = new Date().toISOString()
    const client = createSupabaseClient([
      {
        flag_key: 'spaces_v1',
        description: 'Spaces rollout',
        enabled: true,
        owner: 'Product Lead',
        metadata: {},
        created_at: now,
        updated_at: now,
      },
    ])

    serviceRoleClientMock.mockReturnValue(client)

    const { isFeatureEnabled } = await loadModule()

    expect(await isFeatureEnabled('spaces_v1')).toBe(true)
    expect(await isFeatureEnabled('spaces_v1')).toBe(true)
    expect(client.from).toHaveBeenCalledTimes(1)
  })

  it('invalidates cache when requested', async () => {
    const now = new Date().toISOString()
    const firstClient = createSupabaseClient([
      {
        flag_key: 'spaces_v1',
        description: 'Spaces rollout',
        enabled: false,
        owner: 'Product Lead',
        metadata: {},
        created_at: now,
        updated_at: now,
      },
    ])

    const secondClient = createSupabaseClient([
      {
        flag_key: 'spaces_v1',
        description: 'Spaces rollout',
        enabled: true,
        owner: 'Product Lead',
        metadata: {},
        created_at: now,
        updated_at: now,
      },
    ])

    serviceRoleClientMock
      .mockReturnValueOnce(firstClient)
      .mockReturnValueOnce(secondClient)

    const { isFeatureEnabled, invalidateFeatureFlagCache } = await loadModule()

    expect(await isFeatureEnabled('spaces_v1')).toBe(false)
    invalidateFeatureFlagCache()
    expect(await isFeatureEnabled('spaces_v1')).toBe(true)
    expect(firstClient.from).toHaveBeenCalledTimes(1)
    expect(secondClient.from).toHaveBeenCalledTimes(1)
  })

  it('falls back to defaults for non-persisted flags', async () => {
    const now = new Date().toISOString()
    const client = createSupabaseClient([
      {
        flag_key: 'spaces_v1',
        description: 'Spaces rollout',
        enabled: true,
        owner: 'Product Lead',
        metadata: {},
        created_at: now,
        updated_at: now,
      },
    ])

    serviceRoleClientMock.mockReturnValue(client)

    const { getFeatureFlagDefinition } = await loadModule()
    const definition = await getFeatureFlagDefinition('rbac_hardening_v1')

    expect(definition.flagKey).toBe('rbac_hardening_v1')
    expect(definition.enabled).toBe(false)
    expect(definition.owner).toBe('Security Lead')
  })
})
