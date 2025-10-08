import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import { extractRelationSlug, isRecordLike } from '@/lib/gamification/utils'
import { requireAdmin } from '../shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await requireAdmin()
  if ('response' in result) {
    return result.response
  }

  const supabase = createServiceRoleClient()

  const [profilesQuery, badgesQuery, challengesQuery] = await Promise.all([
    supabase
      .from('gamification_profiles')
      .select('profile_id, xp_total, level, current_streak', { count: 'exact' }),
    supabase
      .from('profile_badges')
      .select('badge_id, badges:badge_id (slug)', { count: 'exact' }),
    supabase
      .from('profile_challenge_progress')
      .select('status', { count: 'exact' }),
  ])

  if (profilesQuery.error) {
    return NextResponse.json({ error: profilesQuery.error.message }, { status: 500 })
  }

  const profiles = profilesQuery.data ?? []
  const totalProfiles = profilesQuery.count ?? profiles.length
  const totalXp = profiles.reduce((sum, profile) => sum + Number(profile.xp_total ?? 0), 0)
  const averageLevel = totalProfiles > 0
    ? profiles.reduce((sum, profile) => sum + Number(profile.level ?? 1), 0) / totalProfiles
    : 0

  const streakLeaders = [...profiles]
    .sort((a, b) => Number(b.current_streak ?? 0) - Number(a.current_streak ?? 0))
    .slice(0, 5)
    .map((entry) => ({
      profileId: entry.profile_id,
      streak: Number(entry.current_streak ?? 0),
      level: Number(entry.level ?? 1),
      xp: Number(entry.xp_total ?? 0),
    }))

  const badgeCounts: Record<string, number> = {}

  if (!badgesQuery.error) {
    for (const entry of badgesQuery.data ?? []) {
      if (!isRecordLike(entry)) {
        continue
      }

      const slug = extractRelationSlug(entry.badges)
      if (slug) {
        badgeCounts[slug] = (badgeCounts[slug] ?? 0) + 1
      }
    }
  }

  const challengeStatusCounts: Record<string, number> = {}
  if (!challengesQuery.error) {
    for (const entry of challengesQuery.data ?? []) {
      if (!isRecordLike(entry)) {
        continue
      }

      const status = typeof entry.status === 'string' ? entry.status : 'unknown'
      challengeStatusCounts[status] = (challengeStatusCounts[status] ?? 0) + 1
    }
  }

  return NextResponse.json({
    profiles: {
      total: totalProfiles,
      totalXp,
      averageLevel: Number(averageLevel.toFixed(2)),
      streakLeaders,
    },
    badges: badgeCounts,
    challenges: challengeStatusCounts,
  })
}
