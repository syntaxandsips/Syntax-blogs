import { NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { GamificationActionType } from '@/lib/gamification/types'
import { recordAction } from '@/lib/gamification/points-engine'

export const dynamic = 'force-dynamic'

interface RequestPayload {
  profileId?: string
  actionType?: GamificationActionType
  metadata?: Record<string, unknown>
  actionSource?: string
  requestId?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RequestPayload

  const supabaseAuth = createServerComponentClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  const { data: profileRecord, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (!profileRecord) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
  }

  const profileId = typeof body.profileId === 'string' ? body.profileId : profileRecord.id

  const { data: targetProfile, error: targetProfileError } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('id', profileId)
    .maybeSingle()

  if (targetProfileError) {
    return NextResponse.json({ error: targetProfileError.message }, { status: 500 })
  }

  if (!targetProfile) {
    return NextResponse.json({ error: 'Target profile not found.' }, { status: 404 })
  }

  if (targetProfile.user_id !== user.id && !profileRecord.is_admin) {
    return NextResponse.json({ error: 'You are not allowed to record actions for this profile.' }, { status: 403 })
  }

  const actionType = body.actionType ?? 'custom.manual_adjustment'

  try {
    const result = await recordAction(
      {
        profileId,
        actionType,
        metadata: body.metadata ?? {},
        actionSource: body.actionSource,
        requestId: body.requestId,
      },
      supabase,
    )

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Failed to record gamification action', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to record action.' },
      { status: 500 },
    )
  }
}
