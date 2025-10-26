import { NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/audit/log'
import { recordAuthzDeny } from '@/lib/observability/metrics'
import { createServerClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { compareRolePriority, normalizeRoleSlug } from '@/lib/rbac/permissions'

export type SpaceRole = 'member' | 'contributor' | 'organizer' | 'moderator' | 'admin'

interface RequireSpaceRoleOptions {
  spaceId: string
  resource: string
  action: string
  minimumRole: SpaceRole
}

interface SpaceMembershipContext {
  profileId: string
  role: SpaceRole
  status: Database['public']['Enums']['space_membership_status'] | null
}

interface SpaceRoleResult {
  ok: true
  profileId: string
  userId: string
  isAdmin: boolean
  membership: SpaceMembershipContext | null
}

export type RequireSpaceRoleResult =
  | SpaceRoleResult
  | { ok: false; response: NextResponse }

const resolveDenial = async (
  options: RequireSpaceRoleOptions,
  actor: { profileId: string | null; role: SpaceRole | 'unknown'; reason: string },
) => {
  recordAuthzDeny(options.resource, {
    role: actor.role,
    space: options.spaceId,
    reason: actor.reason,
  })

  await writeAuditLog({
    actorId: actor.profileId,
    actorRole: actor.role,
    resource: options.resource,
    action: 'access_denied',
    entityId: options.spaceId,
    spaceId: options.spaceId,
    reason: actor.reason,
    metadata: { guard_action: options.action },
  })

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export const requireSpaceRole = async (
  options: RequireSpaceRoleOptions,
): Promise<RequireSpaceRoleResult> => {
  const supabase = createServerClient<Database>()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error('[requireSpaceRole] failed to load session', { error: authError.message })
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unable to verify session.' }, { status: 500 }),
    }
  }

  if (!user) {
    return {
      ok: false,
      response: await resolveDenial(options, {
        profileId: null,
        role: 'unknown',
        reason: 'no_session',
      }),
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_admin, primary_role_id')
    .eq('user_id', user.id)
    .maybeSingle<{ id: string; is_admin: boolean; primary_role_id: string | null }>()

  if (profileError) {
    console.error('[requireSpaceRole] profile lookup failed', { error: profileError.message })
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unable to load profile.' }, { status: 500 }),
    }
  }

  if (!profile) {
    return {
      ok: false,
      response: await resolveDenial(options, {
        profileId: null,
        role: 'unknown',
        reason: 'missing_profile',
      }),
    }
  }

  if (profile.is_admin) {
    return {
      ok: true,
      profileId: profile.id,
      userId: user.id,
      isAdmin: true,
      membership: null,
    }
  }

  const { data: membership, error: membershipError } = await supabase
    .from('space_members')
    .select('space_id, profile_id, status, role_slug, roles:role_id(slug)')
    .eq('space_id', options.spaceId)
    .eq('profile_id', profile.id)
    .maybeSingle<{
      space_id: string
      profile_id: string
      status: Database['public']['Enums']['space_membership_status']
      role_slug: string | null
      roles: { slug: string | null } | null
    }>()

  if (membershipError) {
    console.error('[requireSpaceRole] membership lookup failed', {
      error: membershipError.message,
      spaceId: options.spaceId,
    })
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unable to verify membership.' }, { status: 500 }),
    }
  }

  if (!membership || membership.status !== 'active') {
    return {
      ok: false,
      response: await resolveDenial(options, {
        profileId: profile.id,
        role: membership ? normalizeRoleSlug(membership.role_slug) : 'member',
        reason: membership ? 'inactive_membership' : 'not_a_member',
      }),
    }
  }

  const normalizedRole = normalizeRoleSlug(
    membership.role_slug ?? membership.roles?.slug ?? 'member',
  ) as SpaceRole

  if (compareRolePriority(normalizedRole, options.minimumRole) < 0) {
    return {
      ok: false,
      response: await resolveDenial(options, {
        profileId: profile.id,
        role: normalizedRole,
        reason: 'insufficient_role',
      }),
    }
  }

  return {
    ok: true,
    profileId: profile.id,
    userId: user.id,
    isAdmin: false,
    membership: {
      profileId: profile.id,
      role: normalizedRole,
      status: membership.status,
    },
  }
}
