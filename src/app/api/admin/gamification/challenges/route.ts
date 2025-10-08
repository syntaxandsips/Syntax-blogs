import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import { requireAdmin } from '../shared'

export const dynamic = 'force-dynamic'

const sanitizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const sanitizeNumber = (value: unknown, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

export async function GET() {
  const result = await requireAdmin()
  if ('response' in result) {
    return result.response
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('gamification_challenges')
    .select('*, profile_challenge_progress(count)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const challenges = (data ?? []).map((challenge) => ({
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    description: challenge.description,
    cadence: challenge.cadence,
    requirements: challenge.requirements,
    rewardPoints: challenge.reward_points,
    rewardBadgeId: challenge.reward_badge_id,
    startsAt: challenge.starts_at,
    endsAt: challenge.ends_at,
    isActive: challenge.is_active,
    participantCount: Array.isArray(challenge.profile_challenge_progress)
      ? (challenge.profile_challenge_progress[0]?.count as number | null) ?? 0
      : 0,
  }))

  return NextResponse.json({ challenges })
}

export async function POST(request: Request) {
  const result = await requireAdmin()
  if ('response' in result) {
    return result.response
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>

  const id = sanitizeString(payload.id)
  const slug = sanitizeString(payload.slug)
  const title = sanitizeString(payload.title)
  const description = sanitizeString(payload.description) || null
  const cadence = sanitizeString(payload.cadence) as
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'seasonal'
    | 'event'
  const rewardPoints = sanitizeNumber(payload.rewardPoints, 0)
  const rewardBadgeId = sanitizeString(payload.rewardBadgeId) || null
  const startsAt = sanitizeString(payload.startsAt) || null
  const endsAt = sanitizeString(payload.endsAt) || null
  const isActive = typeof payload.isActive === 'boolean' ? payload.isActive : true
  const requirements = (payload.requirements as Record<string, unknown> | undefined) ?? {}

  if (!slug || !title || !cadence) {
    return NextResponse.json(
      { error: 'Slug, title, and cadence are required.' },
      { status: 422 },
    )
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('gamification_challenges')
    .upsert(
      {
        id: id || undefined,
        slug,
        title,
        description,
        cadence,
        reward_points: rewardPoints,
        reward_badge_id: rewardBadgeId,
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: isActive,
        requirements,
      },
      { onConflict: 'slug' },
    )
    .select('*')
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Unable to save challenge.' }, { status: 500 })
  }

  await supabase.from('gamification_audit').insert({
    action: 'challenge_catalog_update',
    delta: null,
    metadata: { challengeSlug: slug },
    reason: 'Challenge catalog updated via admin API',
  })

  return NextResponse.json({ challenge: data })
}
