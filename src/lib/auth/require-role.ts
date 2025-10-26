import { NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/audit/log'
import { recordAuthzDeny } from '@/lib/observability/metrics'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { compareRolePriority, normalizeRoleSlug } from '@/lib/rbac/permissions'
import type { CanonicalRoleSlug } from '@/lib/rbac/permissions'

interface RequireRoleOptions {
  resource: string
  action: string
  minimumRole: CanonicalRoleSlug
  entityId?: string | null
  spaceId?: string | null
}

interface RoleGuardContext {
  profileId: string
  userId: string
  role: CanonicalRoleSlug
  isAdmin: boolean
}

export type RequireRoleResult =
  | { ok: true; context: RoleGuardContext }
  | { ok: false; response: NextResponse }

const logDenial = async (
  options: RequireRoleOptions,
  actor: { profileId: string | null; role: CanonicalRoleSlug | 'unknown'; reason: string },
) => {
  recordAuthzDeny(options.resource, {
    role: actor.role,
    reason: actor.reason,
    space: options.spaceId ?? undefined,
  })

  await writeAuditLog({
    actorId: actor.profileId,
    actorRole: actor.role,
    resource: options.resource,
    action: 'access_denied',
    entityId: options.entityId ?? null,
    spaceId: options.spaceId ?? null,
    reason: actor.reason,
    metadata: { guard_action: options.action },
  })
}

const resolveRoleSlug = async (primaryRoleId: string | null): Promise<CanonicalRoleSlug> => {
  if (!primaryRoleId) {
    return 'member'
  }

  const serviceClient = createServiceRoleClient<Database>()
  const { data, error } = await serviceClient
    .from('roles')
    .select('slug')
    .eq('id', primaryRoleId)
    .maybeSingle<{ slug: string | null }>()

  if (error) {
    console.error('[requireRole] unable to resolve role slug', {
      error: error.message,
      primaryRoleId,
    })
    return 'member'
  }

  return normalizeRoleSlug(data?.slug)
}

export const requireRole = async (
  options: RequireRoleOptions,
): Promise<RequireRoleResult> => {
  const supabase = createServerClient<Database>()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error('[requireRole] session lookup failed', { error: authError.message })
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unable to load session.' }, { status: 500 }),
    }
  }

  if (!user) {
    await logDenial(options, { profileId: null, role: 'unknown', reason: 'no_session' })
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_admin, primary_role_id')
    .eq('user_id', user.id)
    .maybeSingle<{ id: string; is_admin: boolean; primary_role_id: string | null }>()

  if (profileError) {
    console.error('[requireRole] profile lookup failed', { error: profileError.message })
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unable to load profile.' }, { status: 500 }),
    }
  }

  if (!profile) {
    await logDenial(options, { profileId: null, role: 'unknown', reason: 'missing_profile' })
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  if (profile.is_admin) {
    return {
      ok: true,
      context: {
        profileId: profile.id,
        userId: user.id,
        role: 'admin',
        isAdmin: true,
      },
    }
  }

  const roleSlug = await resolveRoleSlug(profile.primary_role_id)

  if (compareRolePriority(roleSlug, options.minimumRole) < 0) {
    await logDenial(options, { profileId: profile.id, role: roleSlug, reason: 'insufficient_role' })
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return {
    ok: true,
    context: {
      profileId: profile.id,
      userId: user.id,
      role: roleSlug,
      isAdmin: false,
    },
  }
}
