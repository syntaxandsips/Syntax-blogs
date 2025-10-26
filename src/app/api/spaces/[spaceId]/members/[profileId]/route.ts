import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isFeatureEnabled } from '@/lib/feature-flags/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { withSpan } from '@/lib/observability/tracing'
import { recordSpaceJoinApprovalLatency } from '@/lib/observability/metrics'
import { writeAuditLog } from '@/lib/audit/log'
import { requireSpaceRole, type SpaceRole } from '@/lib/auth/require-space-role'
import { normalizeRoleSlug } from '@/lib/rbac/permissions'

const updateSchema = z.object({
  action: z.enum(['approve', 'ban', 'promote']),
  role: z.enum(['member', 'contributor', 'organizer', 'moderator']).optional(),
  reason: z.string().max(240).optional(),
})

const roleToSlug = (role: string | null | undefined): SpaceRole => {
  return normalizeRoleSlug(role) as SpaceRole
}

const resolveRoleId = async (role: SpaceRole): Promise<string | null> => {
  const serviceClient = createServiceRoleClient<Database>()
  const { data, error } = await serviceClient
    .from('roles')
    .select('id')
    .eq('slug', role)
    .maybeSingle<{ id: string }>()

  if (error) {
    console.error('[spaces:members:update] failed to resolve role id', { error: error.message })
    return null
  }

  return data?.id ?? null
}

export async function PATCH(
  request: Request,
  { params }: { params: { spaceId: string; profileId: string } },
) {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const guard = await requireSpaceRole({
    resource: 'space_membership',
    action: 'moderate',
    spaceId: params.spaceId,
    minimumRole: 'organizer',
  })

  if (!guard.ok) {
    return guard.response
  }
  const actor = guard

  const body = await request.json().catch(() => ({}))
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  return withSpan('api.space_members.update', { flag: 'spaces_v1', space_id: params.spaceId }, async () => {
    const supabase = createServerClient<Database>()
    const { data: membership, error: membershipError } = await supabase
      .from('space_members')
      .select('status, requested_at, role_slug, role_id')
      .eq('space_id', params.spaceId)
      .eq('profile_id', params.profileId)
      .maybeSingle<{
        status: Database['public']['Enums']['space_membership_status']
        requested_at: string | null
        role_slug: string | null
        role_id: string | null
      }>()

    if (membershipError || !membership) {
      console.error('[spaces:members:update] membership lookup failed', {
        error: membershipError?.message,
      })
      return NextResponse.json({ error: 'Membership not found.' }, { status: 404 })
    }

    const now = Date.now()
    const updates: Record<string, unknown> = {
      decision_at: new Date(now).toISOString(),
    }

    if (parsed.data.action === 'approve') {
      updates.status = 'active'
      if (membership.requested_at) {
        const latency = now - new Date(membership.requested_at).getTime()
        if (latency > 0) {
          recordSpaceJoinApprovalLatency(latency, {
            space_id: params.spaceId,
            actor_role: actor.membership?.role ?? 'organizer',
          })
        }
      }
    }

    if (parsed.data.action === 'ban') {
      updates.status = 'banned'
    }

    if (parsed.data.action === 'promote') {
      const desiredRole = roleToSlug(parsed.data.role ?? 'member')
      const roleId = await resolveRoleId(desiredRole)
      if (!roleId) {
        return NextResponse.json({ error: 'Unable to resolve role.' }, { status: 500 })
      }
      updates.role_id = roleId
      updates.role_slug = desiredRole
    }

    const { error: updateError } = await supabase
      .from('space_members')
      .update(updates)
      .eq('space_id', params.spaceId)
      .eq('profile_id', params.profileId)

    if (updateError) {
      console.error('[spaces:members:update] failed', { error: updateError.message })
      return NextResponse.json({ error: 'Unable to update membership.' }, { status: 500 })
    }

    await writeAuditLog({
      actorId: actor.profileId,
      actorRole: actor.isAdmin ? 'admin' : actor.membership?.role ?? 'organizer',
      resource: 'space_membership',
      action: parsed.data.action,
      entityId: params.profileId,
      spaceId: params.spaceId,
      reason: parsed.data.reason ?? null,
      metadata: {
        target_status: updates.status ?? membership.status,
        target_role: updates.role_slug ?? membership.role_slug ?? 'member',
      },
    })

    return NextResponse.json({ success: true })
  })
}
