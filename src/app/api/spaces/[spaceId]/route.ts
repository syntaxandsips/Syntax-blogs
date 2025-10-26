import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isFeatureEnabled } from '@/lib/feature-flags/server'
import { createServerClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { withSpan } from '@/lib/observability/tracing'
import { writeAuditLog } from '@/lib/audit/log'
import { requireSpaceRole } from '@/lib/auth/require-space-role'

const updateSchema = z.object({
  name: z.string().min(3).max(120).optional(),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  featureFlags: z.record(z.string(), z.boolean()).optional(),
  bannerImageUrl: z.string().url().or(z.literal(null)).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { spaceId: string } },
) {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const guard = await requireSpaceRole({
    resource: 'space',
    action: 'update',
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

  return withSpan('api.spaces.update', { flag: 'spaces_v1', space_id: params.spaceId }, async () => {
    const supabase = createServerClient<Database>()

    const { error } = await supabase
      .from('spaces')
      .update({
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description ?? null }
          : {}),
        ...(parsed.data.visibility ? { visibility: parsed.data.visibility } : {}),
        ...(parsed.data.featureFlags ? { feature_flags: parsed.data.featureFlags } : {}),
        ...(parsed.data.bannerImageUrl !== undefined
          ? { banner_image_url: parsed.data.bannerImageUrl }
          : {}),
      })
      .eq('id', params.spaceId)

    if (error) {
      console.error('[spaces:update] failed', { error: error.message })
      return NextResponse.json({ error: 'Unable to update space.' }, { status: 500 })
    }

    await writeAuditLog({
      actorId: actor.profileId,
      actorRole: actor.isAdmin ? 'admin' : actor.membership?.role ?? 'member',
      resource: 'space',
      action: 'update',
      entityId: params.spaceId,
      metadata: parsed.data,
    })

    return NextResponse.json({ success: true })
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { spaceId: string } },
) {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const guard = await requireSpaceRole({
    resource: 'space',
    action: 'delete',
    spaceId: params.spaceId,
    minimumRole: 'organizer',
  })

  if (!guard.ok) {
    return guard.response
  }
  const actorDelete = guard

  return withSpan('api.spaces.delete', { flag: 'spaces_v1', space_id: params.spaceId }, async () => {
    const supabase = createServerClient<Database>()

    const { error } = await supabase.from('spaces').delete().eq('id', params.spaceId)

    if (error) {
      console.error('[spaces:delete] failed', { error: error.message })
      return NextResponse.json({ error: 'Unable to delete space.' }, { status: 500 })
    }

    await writeAuditLog({
      actorId: actorDelete.profileId,
      actorRole: actorDelete.isAdmin ? 'admin' : actorDelete.membership?.role ?? 'member',
      resource: 'space',
      action: 'delete',
      entityId: params.spaceId,
    })

    return NextResponse.json({ success: true })
  })
}
