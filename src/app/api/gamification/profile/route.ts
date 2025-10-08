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

  if (!user && !profileIdParam) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  let profileId = profileIdParam

  if (!profileId) {
    const { data: profileRecord, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user?.id ?? '')
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    if (!profileRecord) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    profileId = profileRecord.id
  }

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
