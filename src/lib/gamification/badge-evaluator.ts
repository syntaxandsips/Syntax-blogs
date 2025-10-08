import type {
  BadgeDefinition,
  BadgeEvaluationContext,
  OwnedBadge,
  SupabaseClient,
} from './types'
import type { Database } from '@/lib/supabase/types'
import {
  extractRelationSlug,
  ensureJsonRecord,
  isRecordLike,
  toNumber,
  toNullableString,
} from './utils'

interface BadgeEvaluationResult {
  newBadges: OwnedBadge[]
}

const meetsBadgeCriteria = (
  badge: BadgeDefinition,
  context: BadgeEvaluationContext,
  ownedBadgeSlugs: Set<string>,
) => {
  if (ownedBadgeSlugs.has(badge.slug)) {
    return false
  }

  const requirements = ensureJsonRecord(badge.requirements ?? {})

  if (requirements.requires && Array.isArray(requirements.requires)) {
    const required = requirements.requires.filter((value): value is string => typeof value === 'string')
    if (required.includes('onboarding_completed') && context.action.actionType !== 'onboarding.completed') {
      return false
    }
  }

  if (typeof requirements.streak_days === 'number') {
    if (context.profile.currentStreak < Number(requirements.streak_days)) {
      return false
    }
  }

  if (typeof requirements.total_xp === 'number') {
    if (context.profile.xpTotal < Number(requirements.total_xp)) {
      return false
    }
  }

  if (requirements.actions_required && Array.isArray(requirements.actions_required)) {
    const actions = requirements.actions_required.filter(
      (entry): entry is { action: string; count?: number } =>
        isRecordLike(entry) && typeof entry.action === 'string',
    )
    const requiredAction = actions.find((entry) => entry.action === context.action.actionType)
    if (!requiredAction) {
      return false
    }
  }

  return true
}

const mapBadgeToOwned = (badge: BadgeDefinition, awardedAt: string): OwnedBadge => ({
  ...badge,
  awardedAt,
  state: 'awarded',
  notifiedAt: null,
})

const normalizeBadgeDefinition = (value: unknown): BadgeDefinition | null => {
  if (!isRecordLike(value)) {
    return null
  }

  const id = typeof value.id === 'string' ? value.id : null
  const slug = typeof value.slug === 'string' ? value.slug : null
  const name = typeof value.name === 'string' ? value.name : null
  const category = typeof value.category === 'string' ? value.category : null
  const rarity = typeof value.rarity === 'string' ? value.rarity : null

  if (!id || !slug || !name || !category || !rarity) {
    return null
  }

  const description = typeof value.description === 'string' ? value.description : null
  const icon = toNullableString(value.icon)
  const theme = toNullableString(value.theme)
  const requirements = ensureJsonRecord(value.requirements ?? {})
  const rewardPoints = toNumber(value.reward_points, 0)
  const availableFrom = toNullableString(value.available_from)
  const availableTo = toNullableString(value.available_to)

  return {
    id,
    slug,
    name,
    description,
    category,
    rarity,
    icon,
    theme,
    requirements,
    rewardPoints,
    availableFrom,
    availableTo,
  }
}

export const evaluateBadgesForAction = async (
  context: BadgeEvaluationContext,
  supabase: SupabaseClient,
): Promise<BadgeEvaluationResult> => {
  const nowIso = new Date().toISOString()

  const { data: ownedBadgesData, error: ownedError } = await supabase
    .from('profile_badges')
    .select('badge_id, badges:badge_id (slug)')
    .eq('profile_id', context.profile.profileId)

  if (ownedError) {
    console.error('Unable to load owned badges for evaluation', ownedError)
    return { newBadges: [] }
  }

  const ownedSlugs = new Set<string>()

  const ownedBadgeEntries: unknown[] = ownedBadgesData ?? []

  for (const entry of ownedBadgeEntries) {
    if (!isRecordLike(entry)) {
      continue
    }

    const slugValue = extractRelationSlug(entry.badges)
    if (slugValue) {
      ownedSlugs.add(slugValue)
    }
  }

  const { data: badgeCatalog, error: badgeError } = await supabase
    .from('gamification_badges')
    .select('*')

  if (badgeError) {
    console.error('Unable to load badge catalog', badgeError)
    return { newBadges: [] }
  }

  const earnedBadges: OwnedBadge[] = []

  const badgeEntries: unknown[] = badgeCatalog ?? []

  for (const badge of badgeEntries) {
    const badgeDef = normalizeBadgeDefinition(badge)
    if (!badgeDef) {
      continue
    }

    if (!meetsBadgeCriteria(badgeDef, context, ownedSlugs)) {
      continue
    }

    const { error: insertError } = await supabase
      .from('profile_badges')
      .upsert<Database['public']['Tables']['profile_badges']['Insert']>(
        {
          profile_id: context.profile.profileId,
          badge_id: badgeDef.id,
          state: 'awarded',
          awarded_at: nowIso,
          notified_at: null,
          progress: {},
        },
        { onConflict: 'profile_id,badge_id' },
      )

    if (insertError) {
      console.error(`Unable to award badge ${badgeDef.slug}`, insertError)
      continue
    }

    earnedBadges.push(mapBadgeToOwned(badgeDef, nowIso))
  }

  return { newBadges: earnedBadges }
}
