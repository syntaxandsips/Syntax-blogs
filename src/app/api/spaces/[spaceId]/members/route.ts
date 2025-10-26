import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isFeatureEnabled } from '@/lib/feature-flags/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { writeAuditLog } from '@/lib/audit/log'

const requestSchema = z.object({
  message: z.string().max(240).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { spaceId: string } },
) {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = createServerClient<Database>()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error('[spaces:members:request] auth error', { error: authError.message })
    return NextResponse.json({ error: 'Unable to load session.' }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle<{ id: string }>()

  if (profileError || !profile) {
    console.error('[spaces:members:request] profile lookup failed', {
      error: profileError?.message,
    })
    return NextResponse.json({ error: 'Unable to load profile.' }, { status: 500 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const serviceClient = createServiceRoleClient<Database>()
  const { data: memberRole, error: roleError } = await serviceClient
    .from('roles')
    .select('id, slug')
    .eq('slug', 'member')
    .maybeSingle<{ id: string }>()

  if (roleError || !memberRole) {
    console.error('[spaces:members:request] unable to resolve member role', {
      error: roleError?.message,
    })
    return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 })
  }

  const { data: existing } = await supabase
    .from('space_members')
    .select('status')
    .eq('space_id', params.spaceId)
    .eq('profile_id', profile.id)
    .maybeSingle<{ status: Database['public']['Enums']['space_membership_status'] }>()

  if (existing && existing.status === 'active') {
    return NextResponse.json({ error: 'Already a member.' }, { status: 409 })
  }

  const { error: upsertError } = await supabase
    .from('space_members')
    .upsert(
      {
        space_id: params.spaceId,
        profile_id: profile.id,
        role_id: memberRole.id,
        status: 'pending',
        requested_at: new Date().toISOString(),
      },
      { onConflict: 'space_id,profile_id' },
    )

  if (upsertError) {
    console.error('[spaces:members:request] upsert failed', { error: upsertError.message })
    return NextResponse.json({ error: 'Unable to request access.' }, { status: 500 })
  }

  await writeAuditLog({
    actorId: profile.id,
    actorRole: 'member',
    resource: 'space_membership',
    action: 'request',
    entityId: params.spaceId,
    spaceId: params.spaceId,
    metadata: { message: parsed.data.message ?? null },
  })

  return NextResponse.json({ success: true })
}
