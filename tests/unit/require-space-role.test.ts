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

describe('requireSpaceRole guard', () => {
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
    membership,
    membershipError = null,
    authError = null,
    roleSlug = 'organizer',
  }: {
    user: { id: string } | null
    profile: { id: string; is_admin: boolean; primary_role_id: string | null } | null
    membership: { status: 'pending' | 'active' | 'banned'; role_slug: string | null } | null
    membershipError?: Error | null
    authError?: Error | null
    roleSlug?: string
  }) => {
    const profileMaybeSingle = buildMaybeSingle(profile, null)
    const membershipMaybeSingle = buildMaybeSingle(membership, membershipError)

    const fromMock = vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ maybeSingle: profileMaybeSingle }),
          }),
        }
      }

      if (table === 'space_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockImplementation((column: string) => {
              if (column === 'space_id') {
                return {
                  eq: vi.fn().mockReturnValue({ maybeSingle: membershipMaybeSingle }),
                }
              }
              return { maybeSingle: membershipMaybeSingle }
            }),
          }),
        }
      }

      return { select: vi.fn() }
    })

    createServerClientMock.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError ?? null }) },
      from: fromMock,
    })

    const roleMaybeSingle = buildMaybeSingle({ slug: roleSlug })
    createServiceRoleClientMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: roleMaybeSingle }) }),
      }),
    })
  }

  it('denies when no active membership', async () => {
    configureMocks({
      user: { id: 'user-1' },
      profile: { id: 'p1', is_admin: false, primary_role_id: 'role-1' },
      membership: null,
      roleSlug: 'member',
    })

    const { requireSpaceRole } = await import('@/lib/auth/require-space-role')

    const result = await requireSpaceRole({
      resource: 'space',
      action: 'update',
      spaceId: 'space-1',
      minimumRole: 'organizer',
    })

    expect(result.ok).toBe(false)
    expect(recordAuthzDenyMock).toHaveBeenCalledWith('space', {
      role: 'member',
      space: 'space-1',
      reason: 'not_a_member',
    })
  })

  it('grants access when membership is active and role meets threshold', async () => {
    configureMocks({
      user: { id: 'user-1' },
      profile: { id: 'p1', is_admin: false, primary_role_id: 'role-1' },
      membership: { status: 'active', role_slug: 'organizer' },
      roleSlug: 'member',
    })

    const { requireSpaceRole } = await import('@/lib/auth/require-space-role')

    const result = await requireSpaceRole({
      resource: 'space',
      action: 'update',
      spaceId: 'space-1',
      minimumRole: 'organizer',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.membership?.role).toBe('organizer')
    }
  })

  it('denies when membership inactive', async () => {
    configureMocks({
      user: { id: 'user-1' },
      profile: { id: 'p1', is_admin: false, primary_role_id: 'role-1' },
      membership: { status: 'pending', role_slug: 'organizer' },
      roleSlug: 'member',
    })

    const { requireSpaceRole } = await import('@/lib/auth/require-space-role')

    const result = await requireSpaceRole({
      resource: 'space',
      action: 'update',
      spaceId: 'space-1',
      minimumRole: 'organizer',
    })

    expect(result.ok).toBe(false)
    expect(recordAuthzDenyMock).toHaveBeenCalledWith('space', {
      role: 'organizer',
      space: 'space-1',
      reason: 'inactive_membership',
    })
  })
})
