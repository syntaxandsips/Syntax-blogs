import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('@/lib/observability/metrics', () => ({
  recordAuthzDeny: vi.fn(),
}))

vi.mock('@/lib/audit/log', () => ({
  writeAuditLog: vi.fn(),
}))

vi.mock('@/lib/supabase/server-client', () => ({
  createServerClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
}))

const buildMaybeSingle = (result: unknown, error: Error | null = null) =>
  vi.fn().mockResolvedValue({ data: result, error })

describe('requireRole guard', () => {
  let createServerClientMock: Mock
  let createServiceRoleClientMock: Mock
  let recordAuthzDenyMock: Mock
  let writeAuditLogMock: Mock

  beforeEach(async () => {
    vi.resetModules()
    const serverClientModule = await import('@/lib/supabase/server-client')
    createServerClientMock = serverClientModule.createServerClient as unknown as Mock
    createServiceRoleClientMock = serverClientModule.createServiceRoleClient as unknown as Mock
    createServerClientMock.mockReset()
    createServiceRoleClientMock.mockReset()

    const metricsModule = await import('@/lib/observability/metrics')
    recordAuthzDenyMock = metricsModule.recordAuthzDeny as unknown as Mock
    recordAuthzDenyMock.mockReset()

    const auditModule = await import('@/lib/audit/log')
    writeAuditLogMock = auditModule.writeAuditLog as unknown as Mock
    writeAuditLogMock.mockReset()
  })

  const configureMocks = ({
    user,
    profile,
    roleSlug = 'organizer',
    authError = null,
    profileError = null,
  }: {
    user: { id: string } | null
    profile: { id: string; is_admin: boolean; primary_role_id: string | null } | null
    roleSlug?: string
    authError?: Error | null
    profileError?: Error | null
  }) => {
    const profileMaybeSingle = buildMaybeSingle(profile, profileError ?? null)
    const profileEq = vi.fn().mockReturnValue({ maybeSingle: profileMaybeSingle })
    const profileSelect = vi.fn().mockReturnValue({ eq: profileEq })
    const profileFrom = vi.fn().mockReturnValue({ select: profileSelect })

    createServerClientMock.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError ?? null }) },
      from: profileFrom,
    })

    const roleMaybeSingle = buildMaybeSingle({ slug: roleSlug })
    const roleEq = vi.fn().mockReturnValue({ maybeSingle: roleMaybeSingle })
    const roleSelect = vi.fn().mockReturnValue({ eq: roleEq })
    const roleFrom = vi.fn().mockReturnValue({ select: roleSelect })

    createServiceRoleClientMock.mockReturnValue({ from: roleFrom })
  }

  it('returns 500 when session lookup fails', async () => {
    configureMocks({ user: null, profile: null, authError: new Error('boom') })
    const { requireRole } = await import('@/lib/auth/require-role')

    const result = await requireRole({ resource: 'test', action: 'read', minimumRole: 'organizer' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(500)
    }
  })

  it('denies when user missing', async () => {
    configureMocks({ user: null, profile: null })
    const { requireRole } = await import('@/lib/auth/require-role')

    const result = await requireRole({ resource: 'test', action: 'read', minimumRole: 'organizer' })

    expect(result.ok).toBe(false)
    expect(recordAuthzDenyMock).toHaveBeenCalledWith('test', {
      role: 'unknown',
      reason: 'no_session',
      space: undefined,
    })
    expect(writeAuditLogMock).toHaveBeenCalled()
  })

  it('grants access when admin', async () => {
    configureMocks({ user: { id: 'user-1' }, profile: { id: 'p1', is_admin: true, primary_role_id: null } })
    const { requireRole } = await import('@/lib/auth/require-role')

    const result = await requireRole({ resource: 'test', action: 'read', minimumRole: 'organizer' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.context.role).toBe('admin')
      expect(result.context.isAdmin).toBe(true)
    }
  })

  it('denies when canonical role is below threshold', async () => {
    configureMocks({
      user: { id: 'user-1' },
      profile: { id: 'p1', is_admin: false, primary_role_id: 'role-1' },
      roleSlug: 'member',
    })

    const { requireRole } = await import('@/lib/auth/require-role')

    const result = await requireRole({ resource: 'test', action: 'update', minimumRole: 'organizer' })

    expect(result.ok).toBe(false)
    expect(recordAuthzDenyMock).toHaveBeenCalledWith('test', {
      role: 'member',
      reason: 'insufficient_role',
      space: undefined,
    })
  })
})
