import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import { requireAdmin } from '../shared'

export const dynamic = 'force-dynamic'

const sanitizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const sanitizeBoolean = (value: unknown, fallback = false) =>
  typeof value === 'boolean' ? value : fallback

export async function GET() {
  const result = await requireAdmin()
  if ('response' in result) {
    return result.response
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('gamification_badges')
    .select('*, profile_badges(count)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const badges = (data ?? []).map((badge) => ({
    id: badge.id,
    slug: badge.slug,
    name: badge.name,
    description: badge.description,
    category: badge.category,
    rarity: badge.rarity,
    icon: badge.icon,
    theme: badge.theme,
    rewardPoints: badge.reward_points,
    requirements: badge.requirements,
    isTimeLimited: badge.is_time_limited,
    availableFrom: badge.available_from,
    availableTo: badge.available_to,
    totalAwarded: Array.isArray(badge.profile_badges)
      ? (badge.profile_badges[0]?.count as number | null) ?? 0
      : 0,
  }))

  return NextResponse.json({ badges })
}

export async function POST(request: Request) {
  const result = await requireAdmin()
  if ('response' in result) {
    return result.response
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>

  const id = sanitizeString(payload.id)
  const slug = sanitizeString(payload.slug)
  const name = sanitizeString(payload.name)
  const category = sanitizeString(payload.category)
  const rarity = sanitizeString(payload.rarity || 'common') || 'common'
  const description = sanitizeString(payload.description) || null
  const icon = sanitizeString(payload.icon) || null
  const theme = sanitizeString(payload.theme) || null
  const rewardPoints = Number(payload.rewardPoints ?? 0)
  const requirements = (payload.requirements as Record<string, unknown> | undefined) ?? {}
  const isTimeLimited = sanitizeBoolean(payload.isTimeLimited, false)
  const availableFrom = sanitizeString(payload.availableFrom) || null
  const availableTo = sanitizeString(payload.availableTo) || null

  if (!slug || !name || !category) {
    return NextResponse.json(
      { error: 'Slug, name, and category are required.' },
      { status: 422 },
    )
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('gamification_badges')
    .upsert(
      {
        id: id || undefined,
        slug,
        name,
        category,
        rarity,
        description,
        icon,
        theme,
        reward_points: rewardPoints,
        requirements,
        is_time_limited: isTimeLimited,
        available_from: availableFrom,
        available_to: availableTo,
      },
      { onConflict: 'slug' },
    )
    .select('*')
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Unable to save badge.' },
      { status: 500 },
    )
  }

  await supabase.from('gamification_audit').insert({
    action: 'badge_catalog_update',
    delta: null,
    metadata: { badgeSlug: slug },
    reason: 'Badge catalog updated via admin API',
  })

  return NextResponse.json({ badge: data })
}
