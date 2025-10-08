import type { Database } from '@/lib/supabase/types'
import type {
  BadgeDefinition,
  BadgeEvaluationContext,
  OwnedBadge,
  SupabaseClient,
} from './types'

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

  const requirements = (badge.requirements ?? {}) as Record<string, unknown>

  if (requirements.requires && Array.isArray(requirements.requires)) {
    const required = requirements.requires as string[]
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
    const actions = requirements.actions_required as Array<{ action: string; count?: number }>
    const requiredAction = actions.find((entry) => entry.action === context.action.actionType)
    if (!requiredAction) {
      return false
    }
  }

  return true
}

const mapBadgeRow = (
  badge: Database['public']['Tables']['gamification_badges']['Row'],
  awardedAt: string,
): OwnedBadge => ({
  id: badge.id,
  slug: badge.slug,
  name: badge.name,
  description: badge.description,
  category: badge.category,
  rarity: badge.rarity,
  icon: badge.icon,
  theme: badge.theme,
  requirements: badge.requirements,
  rewardPoints: badge.reward_points,
  availableFrom: badge.available_from,
  availableTo: badge.available_to,
  awardedAt,
  state: 'awarded',
  notifiedAt: null,
})

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

  for (const entry of ownedBadgesData ?? []) {
    const slugValue = Array.isArray(entry.badges) ? entry.badges[0]?.slug : (entry as any)?.badges?.slug
    if (typeof slugValue === 'string') {
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

  for (const badge of badgeCatalog ?? []) {
    const badgeDef: BadgeDefinition = {
      id: badge.id,
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      rarity: badge.rarity,
      icon: badge.icon,
      theme: badge.theme,
      requirements: badge.requirements,
      rewardPoints: badge.reward_points,
      availableFrom: badge.available_from,
      availableTo: badge.available_to,
    }

    if (!meetsBadgeCriteria(badgeDef, context, ownedSlugs)) {
      continue
    }

    const { error: insertError } = await supabase.from('profile_badges').upsert(
      {
        profile_id: context.profile.profileId,
        badge_id: badge.id,
        state: 'awarded',
        awarded_at: nowIso,
        notified_at: null,
        progress: {},
      },
      { onConflict: 'profile_id,badge_id' },
    )

    if (insertError) {
      console.error(`Unable to award badge ${badge.slug}`, insertError)
      continue
    }

    earnedBadges.push(mapBadgeRow(badge, nowIso))
  }

  return { newBadges: earnedBadges }
}
