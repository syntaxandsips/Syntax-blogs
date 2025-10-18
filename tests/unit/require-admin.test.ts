import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

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

describe('requireAdmin guard', () => {
  let createServerClientMock: Mock
  let createServiceRoleClientMock: Mock
  let recordAuthzDenyMock: Mock
  let writeAuditLogMock: Mock

  beforeEach(async () => {
    vi.resetModules()

    const serverClientFactory = await import('@/lib/supabase/server-client')
    createServerClientMock = serverClientFactory.createServerClient as unknown as Mock
    createServiceRoleClientMock = serverClientFactory.createServiceRoleClient as unknown as Mock
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
    profileError,
    roleSlug = 'admin',
    authError = null,
  }: {
    user: { id: string } | null
    profile: { id: string; is_admin: boolean; primary_role_id: string | null } | null
    profileError?: Error | null
    roleSlug?: string
    authError?: Error | null
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
    configureMocks({ user: null, profile: null, profileError: null, authError: new Error('boom') })
    const { requireAdmin } = await import('@/lib/auth/require-admin')

    const result = await requireAdmin({ resource: 'admin_test', action: 'read' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(500)
    }
    expect(recordAuthzDenyMock).not.toHaveBeenCalled()
    expect(writeAuditLogMock).not.toHaveBeenCalled()
  })

  it('returns 401 when no user session', async () => {
    configureMocks({ user: null, profile: null })
    const { requireAdmin } = await import('@/lib/auth/require-admin')

    const result = await requireAdmin({ resource: 'admin_test', action: 'read' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(401)
    }
    expect(recordAuthzDenyMock).toHaveBeenCalledWith('admin_test', {
      role: 'unknown',
      reason: 'no_session',
    })
    expect(writeAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'access_denied', reason: 'no_session' }),
    )
  })

  it('returns 403 when profile missing', async () => {
    configureMocks({ user: { id: 'user-1' }, profile: null })
    const { requireAdmin } = await import('@/lib/auth/require-admin')

    const result = await requireAdmin({ resource: 'admin_test', action: 'read', entityId: 'entity-1' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(403)
    }
    expect(recordAuthzDenyMock).toHaveBeenCalledWith('admin_test', {
      role: 'unknown',
      reason: 'missing_profile',
      space: undefined,
    })
    expect(writeAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ entityId: 'entity-1', reason: 'missing_profile' }),
    )
  })

  it('returns 403 when user lacks admin privileges', async () => {
    configureMocks({
      user: { id: 'user-2' },
      profile: { id: 'profile-2', is_admin: false, primary_role_id: 'role-123' },
      roleSlug: 'contributor',
    })
    const { requireAdmin } = await import('@/lib/auth/require-admin')

    const result = await requireAdmin({ resource: 'admin_test', action: 'update', spaceId: 'space-9' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(403)
    }
    expect(recordAuthzDenyMock).toHaveBeenCalledWith('admin_test', {
      role: 'contributor',
      reason: 'forbidden',
      space: 'space-9',
    })
    expect(writeAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ actorId: 'profile-2', reason: 'forbidden' }),
    )
  })

  it('returns profile context when admin', async () => {
    configureMocks({
      user: { id: 'user-3' },
      profile: { id: 'profile-3', is_admin: true, primary_role_id: 'role-abc' },
      roleSlug: 'admin',
    })
    const { requireAdmin } = await import('@/lib/auth/require-admin')

    const result = await requireAdmin({ resource: 'admin_test', action: 'read' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.profile).toEqual({
        id: 'profile-3',
        userId: 'user-3',
        roleSlug: 'admin',
        isAdmin: true,
      })
    }
    expect(recordAuthzDenyMock).not.toHaveBeenCalled()
    expect(writeAuditLogMock).not.toHaveBeenCalled()
  })
})
