import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@/lib/supabase/server-client', () => {
  const createServerClient = vi.fn()
  const createServiceRoleClient = vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({ maybeSingle: vi.fn(), limit: vi.fn() }),
      }),
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ maybeSingle: vi.fn() }) }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ maybeSingle: vi.fn() }) }) }),
    }),
  }))

  return { createServerClient, createServiceRoleClient }
})

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

vi.mock('@/lib/observability/metrics', () => ({
  recordAuthzDeny: vi.fn(),
}))

describe('admin feature flag route guards', () => {
  let requireAdminProfile: typeof import('@/app/api/admin/feature-flags/route').requireAdminProfile
  let PURGE: typeof import('@/app/api/admin/feature-flags/route').PURGE
  let createServerClientMock: Mock
  let recordAuthzDenyMock: Mock
  let invalidateFeatureFlagCacheMock: Mock

  const buildSupabaseClient = ({
    user,
    profile,
    authError = null,
    profileError = null,
  }: {
    user: { id: string } | null
    profile: { id: string; is_admin: boolean } | null
    authError?: Error | null
    profileError?: Error | null
  }) => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: profile, error: profileError })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ select })

    return {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError }),
      },
      from,
    }
  }

  beforeEach(async () => {
    vi.resetModules()
    const serverClientModule = await import('@/lib/supabase/server-client')
    createServerClientMock = serverClientModule.createServerClient as unknown as Mock
    createServerClientMock.mockReset()

    const metricsModule = await import('@/lib/observability/metrics')
    recordAuthzDenyMock = metricsModule.recordAuthzDeny as unknown as Mock
    recordAuthzDenyMock.mockReset()

    const flagServerModule = await import('@/lib/feature-flags/server')
    invalidateFeatureFlagCacheMock = flagServerModule.invalidateFeatureFlagCache as unknown as Mock
    invalidateFeatureFlagCacheMock.mockReset()

    const module = await import('@/app/api/admin/feature-flags/route')
    requireAdminProfile = module.requireAdminProfile
    PURGE = module.PURGE
  })

  it('returns 401 when no user session is present and records telemetry', async () => {
    createServerClientMock.mockReturnValue(buildSupabaseClient({ user: null, profile: null }))

    const result = await requireAdminProfile()

    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(401)
    }
    expect(recordAuthzDenyMock).toHaveBeenCalledWith('feature_flag_admin', { reason: 'no_session' })
  })

  it('returns 403 when profile missing and records telemetry', async () => {
    createServerClientMock.mockReturnValue(
      buildSupabaseClient({ user: { id: 'user-1' }, profile: null }),
    )

    const result = await requireAdminProfile()

    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(403)
    }
    expect(recordAuthzDenyMock).toHaveBeenCalledWith(
      'feature_flag_admin',
      expect.objectContaining({ reason: 'missing_profile', user_id: 'user-1' }),
    )
  })

  it('returns 403 when profile is not admin and records telemetry', async () => {
    createServerClientMock.mockReturnValue(
      buildSupabaseClient({ user: { id: 'user-2' }, profile: { id: 'profile-2', is_admin: false } }),
    )

    const result = await requireAdminProfile()

    expect('response' in result).toBe(true)
    if ('response' in result) {
      expect(result.response.status).toBe(403)
    }
    expect(recordAuthzDenyMock).toHaveBeenCalledWith(
      'feature_flag_admin',
      expect.objectContaining({ reason: 'forbidden', profile_id: 'profile-2' }),
    )
  })

  it('returns profile when admin', async () => {
    createServerClientMock.mockReturnValue(
      buildSupabaseClient({ user: { id: 'user-3' }, profile: { id: 'profile-3', is_admin: true } }),
    )

    const result = await requireAdminProfile()

    expect('profile' in result).toBe(true)
    if ('profile' in result) {
      expect(result.profile.id).toBe('profile-3')
    }
    expect(recordAuthzDenyMock).not.toHaveBeenCalled()
  })

  it('guards PURGE endpoint by admin check', async () => {
    createServerClientMock.mockReturnValue(buildSupabaseClient({ user: null, profile: null }))

    const response = await PURGE()

    expect(response.status).toBe(401)
    expect(invalidateFeatureFlagCacheMock).not.toHaveBeenCalled()
  })

  it('allows PURGE when admin and invalidates cache', async () => {
    createServerClientMock.mockReturnValue(
      buildSupabaseClient({ user: { id: 'user-4' }, profile: { id: 'profile-4', is_admin: true } }),
    )

    const response = await PURGE()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'Feature flag cache cleared.' })
    expect(invalidateFeatureFlagCacheMock).toHaveBeenCalledTimes(1)
  })
})
