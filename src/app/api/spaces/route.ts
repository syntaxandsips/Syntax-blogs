import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isFeatureEnabled } from '@/lib/feature-flags/server'
import { createServerClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { withSpan } from '@/lib/observability/tracing'
import { recordSpaceCreationSuccess } from '@/lib/observability/metrics'
import { writeAuditLog } from '@/lib/audit/log'
import { requireRole } from '@/lib/auth/require-role'

const createSpaceSchema = z.object({
  name: z.string().min(3).max(120),
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'private']).default('public'),
  featureFlags: z.record(z.string(), z.boolean()).optional(),
  bannerImageUrl: z.string().url().optional(),
})

export async function GET() {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    return NextResponse.json({ spaces: [] }, { status: 404 })
  }

  const supabase = createServerClient<Database>()
  const { data, error } = await supabase
    .from('spaces')
    .select('id, slug, name, description, visibility, feature_flags, banner_image_url')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[spaces:get] failed to load spaces', { error: error.message })
    return NextResponse.json({ error: 'Unable to load spaces.' }, { status: 500 })
  }

  return NextResponse.json({ spaces: data ?? [] })
}

export async function POST(request: Request) {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    return NextResponse.json({ error: 'Spaces are not available.' }, { status: 404 })
  }

  const guard = await requireRole({
    resource: 'spaces',
    action: 'create',
    minimumRole: 'organizer',
  })

  if (!guard.ok) {
    return guard.response
  }
  const actor = guard.context

  const body = await request.json().catch(() => ({}))
  const parsed = createSpaceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  return withSpan('api.spaces.create', { flag: 'spaces_v1' }, async () => {
    const supabase = createServerClient<Database>()

    const { data: existing } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', parsed.data.slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 })
    }

    const { error } = await supabase.from('spaces').insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      visibility: parsed.data.visibility,
      feature_flags: parsed.data.featureFlags ?? {},
      banner_image_url: parsed.data.bannerImageUrl ?? null,
      created_by: actor.profileId,
    })

    if (error) {
      console.error('[spaces:create] failed to insert', { error: error.message })
      return NextResponse.json({ error: 'Unable to create space.' }, { status: 500 })
    }

    recordSpaceCreationSuccess({ visibility: parsed.data.visibility })

    await writeAuditLog({
      actorId: actor.profileId,
      actorRole: actor.role,
      resource: 'space',
      action: 'create',
      entityId: parsed.data.slug,
      metadata: {
        visibility: parsed.data.visibility,
        feature_flags: parsed.data.featureFlags ?? {},
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  })
}
