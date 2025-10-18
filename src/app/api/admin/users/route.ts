import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import { requireAdmin } from '@/lib/auth/require-admin'
import { writeAuditLog } from '@/lib/audit/log'
import { withSpan } from '@/lib/observability/tracing'
import { logStructuredEvent } from '@/lib/observability/logger'
import type { AdminRole, CreateAdminUserPayload } from '@/utils/types'
import {
  fetchRoles,
  ensureRoleAssignments,
  buildUserSummary,
  fetchProfileById,
  loadAllUserSummaries,
  sanitizeRoleSlugs,
} from './shared'

export { sanitizeRoleSlugs } from './shared'

const sanitizeEmail = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return trimmed.toLowerCase()
}

const sanitizeDisplayName = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const sanitizePassword = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function GET() {
  const guard = await requireAdmin({ resource: 'admin_users', action: 'list' })
  if (!guard.ok) {
    return guard.response
  }

  return withSpan(
    'admin.users.list',
    {
      resource: 'admin_users',
      actor_id: guard.profile.id,
      actor_role: guard.profile.roleSlug,
    },
    async () => {
      try {
        const serviceClient = createServiceRoleClient()
        const [roles, users] = await Promise.all([
          fetchRoles(serviceClient),
          loadAllUserSummaries(serviceClient),
        ])

        const formattedRoles: AdminRole[] = roles.map((role) => ({
          id: role.id,
          slug: role.slug,
          name: role.name,
          description: role.description,
          priority: role.priority,
        }))

        logStructuredEvent({
          message: 'admin_users:list_succeeded',
          level: 'info',
          userId: guard.profile.userId,
          metadata: {
            actor_profile_id: guard.profile.id,
            role_count: formattedRoles.length,
            user_count: users.length,
          },
        })

        return NextResponse.json({ users, roles: formattedRoles })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load users.'
        logStructuredEvent({
          message: 'admin_users:list_failed',
          level: 'error',
          userId: guard.profile.userId,
          metadata: {
            actor_profile_id: guard.profile.id,
            reason: message,
          },
        })
        return NextResponse.json({ error: message }, { status: 500 })
      }
    },
  )
}

export async function POST(request: Request) {
  const guard = await requireAdmin({ resource: 'admin_users', action: 'create' })
  if (!guard.ok) {
    return guard.response
  }

  const body = (await request.json()) as Partial<CreateAdminUserPayload>

  const email = sanitizeEmail(body?.email)
  const password = sanitizePassword(body?.password)
  const displayName = sanitizeDisplayName(body?.displayName)
  const requestedRoles = sanitizeRoleSlugs(body?.roleSlugs)
  const isAdmin = Boolean(body?.isAdmin) || requestedRoles.includes('admin')

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters long.' },
      { status: 400 },
    )
  }

  if (!displayName) {
    return NextResponse.json({ error: 'Display name is required.' }, { status: 400 })
  }

  const serviceClient = createServiceRoleClient()

  return withSpan(
    'admin.users.create',
    {
      resource: 'admin_users',
      actor_id: guard.profile.id,
      actor_role: guard.profile.roleSlug,
    },
    async () => {
      try {
        const roles = await fetchRoles(serviceClient)

        const { data: authResult, error: authError } = await serviceClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })

        if (authError) {
          throw new Error(`Unable to create user: ${authError.message}`)
        }

        const authUser = authResult.user
        if (!authUser) {
          throw new Error('Unable to create user: missing auth record.')
        }

        const { data: profileData, error: profileError } = await serviceClient
          .from('profiles')
          .upsert(
            {
              user_id: authUser.id,
              display_name: displayName,
              is_admin: isAdmin,
            },
            { onConflict: 'user_id' },
          )
          .select(
            `id, user_id, display_name, is_admin, created_at, primary_role_id,
         profile_roles(role:roles(id, slug, name, description, priority))`,
          )
          .single()

        if (profileError || !profileData) {
          throw new Error(
            `Unable to provision profile: ${profileError?.message ?? 'missing record.'}`,
          )
        }

        await ensureRoleAssignments(
          serviceClient,
          profileData.id,
          roles,
          requestedRoles,
          isAdmin,
        )

        const refreshedProfile = await fetchProfileById(serviceClient, profileData.id)
        const summary = await buildUserSummary(serviceClient, refreshedProfile)

        await writeAuditLog({
          actorId: guard.profile.id,
          actorRole: guard.profile.roleSlug,
          resource: 'admin_users',
          action: 'user_created',
          entityId: summary.profileId,
          metadata: {
            email,
            is_admin: isAdmin,
            role_slugs: requestedRoles,
          },
        })

        logStructuredEvent({
          message: 'admin_users:create_succeeded',
          level: 'info',
          userId: guard.profile.userId,
          metadata: {
            created_profile_id: summary.profileId,
            actor_profile_id: guard.profile.id,
            role_count: requestedRoles.length,
          },
        })

        return NextResponse.json({ user: summary })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to create user.'
        const status =
          error instanceof Error && message.startsWith('Unknown role slug') ? 400 : 500

        logStructuredEvent({
          message: 'admin_users:create_failed',
          level: 'error',
          userId: guard.profile.userId,
          metadata: {
            actor_profile_id: guard.profile.id,
            reason: message,
          },
        })

        return NextResponse.json({ error: message }, { status })
      }
    },
  )
}
