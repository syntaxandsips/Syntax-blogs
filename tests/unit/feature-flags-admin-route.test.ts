import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/lib/supabase/server-client', () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({ maybeSingle: vi.fn(), limit: vi.fn() }),
      }),
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ maybeSingle: vi.fn() }) }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ maybeSingle: vi.fn() }) }) }),
    }),
  })),
}))

vi.mock('@/lib/feature-flags/server', () => ({
  getFeatureFlagDefinition: vi.fn(async (flagKey: string) => ({
    flagKey,
    description: '',
    enabled: false,
    owner: 'Unassigned',
    metadata: {},
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  })),
  getFeatureFlagSnapshot: vi.fn(async () => ({})),
  invalidateFeatureFlagCache: vi.fn(),
  upsertFeatureFlagCache: vi.fn(),
}))

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: vi.fn(),
}))

describe('admin feature flag route guard integration', () => {
  let requireAdminMock: Mock
  let invalidateFeatureFlagCacheMock: Mock
  let PURGE: typeof import('@/app/api/admin/feature-flags/route').PURGE

  beforeEach(async () => {
    vi.resetModules()

    const featureFlagServerModule = await import('@/lib/feature-flags/server')
    invalidateFeatureFlagCacheMock = featureFlagServerModule.invalidateFeatureFlagCache as unknown as Mock
    invalidateFeatureFlagCacheMock.mockReset()

    const guardModule = await import('@/lib/auth/require-admin')
    requireAdminMock = guardModule.requireAdmin as unknown as Mock
    requireAdminMock.mockReset()

    const routeModule = await import('@/app/api/admin/feature-flags/route')
    PURGE = routeModule.PURGE
  })

  it('returns guard response when authorization fails', async () => {
    const denial = NextResponse.json({ error: 'nope' }, { status: 403 })
    requireAdminMock.mockResolvedValue({ ok: false, response: denial })

    const response = await PURGE()

    expect(response.status).toBe(403)
    expect(invalidateFeatureFlagCacheMock).not.toHaveBeenCalled()
    expect(requireAdminMock).toHaveBeenCalledWith({ resource: 'feature_flag_admin', action: 'purge' })
  })

  it('clears cache when guard grants access', async () => {
    requireAdminMock.mockResolvedValue({
      ok: true,
      profile: { id: 'profile-1', userId: 'user-1', roleSlug: 'admin', isAdmin: true },
    })

    const response = await PURGE()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'Feature flag cache cleared.' })
    expect(invalidateFeatureFlagCacheMock).toHaveBeenCalledTimes(1)
  })
})
