import { NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/audit/log'
import { recordAuthzDeny } from '@/lib/observability/metrics'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'

interface RequireAdminOptions {
  resource: string
  action: string
  entityId?: string | null
  spaceId?: string | null
}

interface AdminProfileContext {
  id: string
  userId: string
  roleSlug: string
  isAdmin: boolean
}

export type AdminGuardResult =
  | { ok: true; profile: AdminProfileContext }
  | { ok: false; response: NextResponse }

const resolveRoleSlug = async (primaryRoleId: string | null): Promise<string> => {
  if (!primaryRoleId) {
    return 'member'
  }

  const serviceClient = createServiceRoleClient<Database>()
  const { data, error } = await serviceClient
    .from('roles')
    .select('slug')
    .eq('id', primaryRoleId)
    .maybeSingle<{ slug: string }>()

  if (error) {
    console.error('[requireAdmin] unable to resolve role slug', { error: error.message, primaryRoleId })
    return 'member'
  }

  return data?.slug ?? 'member'
}

const logDenial = async (
  options: RequireAdminOptions,
  actor: { profileId: string | null; roleSlug: string },
  reason: string,
) => {
  recordAuthzDeny(options.resource, {
    role: actor.roleSlug,
    reason,
    space: options.spaceId ?? undefined,
  })

  await writeAuditLog({
    actorId: actor.profileId,
    actorRole: actor.roleSlug,
    resource: options.resource,
    action: 'access_denied',
    entityId: options.entityId ?? null,
    spaceId: options.spaceId ?? null,
    reason,
    metadata: { guard_action: options.action },
  })
}

export const requireAdmin = async (options: RequireAdminOptions): Promise<AdminGuardResult> => {
  const supabase = createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error('[requireAdmin] session lookup failed', { error: authError.message })
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unable to load session.' }, { status: 500 }),
    }
  }

  if (!user) {
    await logDenial(options, { profileId: null, roleSlug: 'unknown' }, 'no_session')
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_admin, primary_role_id')
    .eq('user_id', user.id)
    .maybeSingle<{ id: string; is_admin: boolean; primary_role_id: string | null }>()

  if (profileError) {
    console.error('[requireAdmin] profile lookup failed', { error: profileError.message })
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unable to load profile.' }, { status: 500 }),
    }
  }

  if (!profile) {
    await logDenial(options, { profileId: null, roleSlug: 'unknown' }, 'missing_profile')
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden: admin access required.' }, { status: 403 }),
    }
  }

  const roleSlug = await resolveRoleSlug(profile.primary_role_id)

  if (!profile.is_admin) {
    await logDenial(options, { profileId: profile.id, roleSlug }, 'forbidden')
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden: admin access required.' }, { status: 403 }),
    }
  }

  return {
    ok: true,
    profile: {
      id: profile.id,
      userId: user.id,
      roleSlug,
      isAdmin: profile.is_admin,
    },
  }
}
