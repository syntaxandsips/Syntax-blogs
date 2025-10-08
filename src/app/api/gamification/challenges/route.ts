import { NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabaseAuth = createServerComponentClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  const supabase = createServiceRoleClient()

  let profileId: string | null = null

  if (user) {
    const { data: profileRecord } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    profileId = profileRecord?.id ?? null
  }

  const { data, error } = await supabase
    .from('gamification_challenges')
    .select(
      `id, slug, title, description, cadence, reward_points, reward_badge_id, starts_at, ends_at, requirements, is_active,
       progress:profile_challenge_progress(profile_id, status, progress, completed_at, started_at, streak_count)`
    )
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const challenges = (data ?? []).map((challenge) => {
    const progressEntries = Array.isArray(challenge.progress) ? challenge.progress : []
    const progressForProfile = progressEntries.find((entry) => entry.profile_id === profileId)

    return {
      id: challenge.id,
      slug: challenge.slug,
      title: challenge.title,
      description: challenge.description,
      cadence: challenge.cadence,
      rewardPoints: challenge.reward_points,
      rewardBadgeId: challenge.reward_badge_id,
      startsAt: challenge.starts_at,
      endsAt: challenge.ends_at,
      requirements: challenge.requirements,
      status: progressForProfile?.status ?? 'active',
      progress: progressForProfile?.progress ?? {},
      streakCount: progressForProfile?.streak_count ?? 0,
      completedAt: progressForProfile?.completed_at ?? null,
    }
  })

  return NextResponse.json({ challenges })
}
