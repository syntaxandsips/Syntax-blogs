import { NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import { fetchGamificationProfile } from '@/lib/gamification/profile-service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const profileIdParam = url.searchParams.get('profileId')

  const supabaseAuth = createServerComponentClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const {
    data: requesterProfile,
    error: requesterError,
  } = await supabaseAuth
    .from('profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (requesterError) {
    return NextResponse.json({ error: requesterError.message }, { status: 500 })
  }

  if (!requesterProfile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
  }

  let profileId = requesterProfile.id

  if (profileIdParam) {
    if (profileIdParam !== requesterProfile.id && !requesterProfile.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: insufficient permissions to view this profile.' },
        { status: 403 },
      )
    }

    profileId = profileIdParam
  }

  const supabase = createServiceRoleClient()

  try {
    const payload = await fetchGamificationProfile(profileId, supabase)
    return NextResponse.json(payload)
  } catch (error) {
    console.error('Failed to load gamification profile', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load profile.' },
      { status: 500 },
    )
  }
}
