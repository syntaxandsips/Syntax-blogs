import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import type { UpdateAdminUserPayload } from '@/utils/types'
import { requireAdmin } from '@/lib/auth/require-admin'
import { writeAuditLog } from '@/lib/audit/log'
import { withSpan } from '@/lib/observability/tracing'
import { logStructuredEvent } from '@/lib/observability/logger'
import { recordAuthzDeny } from '@/lib/observability/metrics'
import {
  fetchRoles,
  fetchProfileById,
  ensureRoleAssignments,
  buildUserSummary,
  sanitizeRoleSlugs,
} from '../shared'

const sanitizeDisplayName = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const sanitizePassword = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: profileId } = await params
  if (!profileId) {
    return NextResponse.json({ error: 'Profile id is required.' }, { status: 400 })
  }

  const guard = await requireAdmin({
    resource: 'admin_users',
    action: 'update',
    entityId: profileId,
  })
  if (!guard.ok) {
    return guard.response
  }

  const body = (await request.json()) as Partial<UpdateAdminUserPayload>

  const displayName = sanitizeDisplayName(body?.displayName)
  const requestedRoles = sanitizeRoleSlugs(body?.roleSlugs)
  const isAdmin = Boolean(body?.isAdmin) || requestedRoles.includes('admin')
  const newPassword = sanitizePassword(body?.newPassword)

  if (!displayName) {
    return NextResponse.json({ error: 'Display name is required.' }, { status: 400 })
  }

  const serviceClient = createServiceRoleClient()

  return withSpan(
    'admin.users.update',
    {
      resource: 'admin_users',
      actor_id: guard.profile.id,
      actor_role: guard.profile.roleSlug,
      target_profile_id: profileId,
    },
    async () => {
      try {
        const profileRecord = await fetchProfileById(serviceClient, profileId)

        const roles = await fetchRoles(serviceClient)

        const { error: profileUpdateError } = await serviceClient
          .from('profiles')
          .update({ display_name: displayName, is_admin: isAdmin })
          .eq('id', profileId)

        if (profileUpdateError) {
          throw new Error(`Unable to update profile: ${profileUpdateError.message}`)
        }

        await ensureRoleAssignments(serviceClient, profileId, roles, requestedRoles, isAdmin)

        if (newPassword) {
          if (newPassword.length < 8) {
            return NextResponse.json(
              { error: 'New password must be at least 8 characters long.' },
              { status: 400 },
            )
          }

          const { error: passwordError } = await serviceClient.auth.admin.updateUserById(
            profileRecord.user_id,
            { password: newPassword },
          )

          if (passwordError) {
            throw new Error(`Unable to update password: ${passwordError.message}`)
          }
        }

        const refreshedProfile = await fetchProfileById(serviceClient, profileId)
        const summary = await buildUserSummary(serviceClient, refreshedProfile)

        await writeAuditLog({
          actorId: guard.profile.id,
          actorRole: guard.profile.roleSlug,
          resource: 'admin_users',
          action: 'user_updated',
          entityId: summary.profileId,
          metadata: {
            display_name: displayName,
            role_slugs: requestedRoles,
            is_admin: isAdmin,
            password_reset: Boolean(newPassword),
          },
        })

        logStructuredEvent({
          message: 'admin_users:update_succeeded',
          level: 'info',
          userId: guard.profile.userId,
          metadata: {
            target_profile_id: summary.profileId,
            actor_profile_id: guard.profile.id,
            role_count: requestedRoles.length,
            password_reset: Boolean(newPassword),
          },
        })

        return NextResponse.json({ user: summary })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update user.'
        let status = 500
        if (error instanceof Error) {
          if (message.startsWith('Unknown role slug')) {
            status = 400
          } else if (message.includes('Profile not found')) {
            status = 404
          }
        }

        logStructuredEvent({
          message: 'admin_users:update_failed',
          level: 'error',
          userId: guard.profile.userId,
          metadata: {
            target_profile_id: profileId,
            actor_profile_id: guard.profile.id,
            reason: message,
          },
        })

        return NextResponse.json({ error: message }, { status })
      }
    },
  )
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: profileId } = await params
  if (!profileId) {
    return NextResponse.json({ error: 'Profile id is required.' }, { status: 400 })
  }

  const guard = await requireAdmin({
    resource: 'admin_users',
    action: 'delete',
    entityId: profileId,
  })
  if (!guard.ok) {
    return guard.response
  }

  const { id: currentProfileId, roleSlug } = guard.profile

  if (profileId === currentProfileId) {
    recordAuthzDeny('admin_users', {
      role: roleSlug,
      reason: 'self_delete_attempt',
    })
    return NextResponse.json(
      { error: 'You cannot delete your own account.' },
      { status: 400 },
    )
  }

  const serviceClient = createServiceRoleClient()

  return withSpan(
    'admin.users.delete',
    {
      resource: 'admin_users',
      actor_id: guard.profile.id,
      actor_role: roleSlug,
      target_profile_id: profileId,
    },
    async () => {
      try {
        const profileRecord = await fetchProfileById(serviceClient, profileId)

        const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(
          profileRecord.user_id,
        )

        if (authDeleteError) {
          throw new Error(`Unable to delete auth user: ${authDeleteError.message}`)
        }

        const { error: profileDeleteError } = await serviceClient
          .from('profiles')
          .delete()
          .eq('id', profileId)

        if (profileDeleteError) {
          throw new Error(`Unable to delete profile: ${profileDeleteError.message}`)
        }

        await writeAuditLog({
          actorId: guard.profile.id,
          actorRole: roleSlug,
          resource: 'admin_users',
          action: 'user_deleted',
          entityId: profileId,
          metadata: {
            deleted_user_id: profileRecord.user_id,
          },
        })

        logStructuredEvent({
          message: 'admin_users:delete_succeeded',
          level: 'info',
          userId: guard.profile.userId,
          metadata: {
            target_profile_id: profileId,
            actor_profile_id: guard.profile.id,
          },
        })

        return NextResponse.json({ success: true })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to delete user.'
        let status = 500
        if (error instanceof Error && message.includes('Profile not found')) {
          status = 404
        }

        logStructuredEvent({
          message: 'admin_users:delete_failed',
          level: 'error',
          userId: guard.profile.userId,
          metadata: {
            target_profile_id: profileId,
            actor_profile_id: guard.profile.id,
            reason: message,
          },
        })

        return NextResponse.json({ error: message }, { status })
      }
    },
  )
}
