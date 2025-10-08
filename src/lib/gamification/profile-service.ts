import { createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import {
  cacheGet,
  cacheSet,
  buildCacheKey,
} from './cache'
import type {
  GamificationProfileSummary,
  LeaderboardEntry,
  LeaderboardFilters,
  OwnedBadge,
  SupabaseClient,
} from './types'

const PROFILE_CACHE_TTL_SECONDS = 60
const LEADERBOARD_CACHE_TTL_SECONDS = 30

const mapProfileRow = (
  row: Database['public']['Tables']['gamification_profiles']['Row'],
): GamificationProfileSummary => {
  const xpTotal = Number(row.xp_total ?? 0)
  const nextLevelXp = Number((row.level_progress as any)?.nextLevelXp ?? 0)
  const progressPercentage = nextLevelXp > 0 ? Math.min((xpTotal / nextLevelXp) * 100, 100) : 0

  return {
    profileId: row.profile_id,
    xpTotal,
    level: Number(row.level ?? 1),
    prestigeLevel: Number(row.prestige_level ?? 0),
    currentStreak: Number(row.current_streak ?? 0),
    longestStreak: Number(row.longest_streak ?? 0),
    nextLevelXp,
    progressPercentage,
    optedIn: Boolean(row.opted_in),
    lastActionAt: row.last_action_at,
    streakFrozenUntil: row.streak_frozen_until,
    settings: row.settings ?? {},
  }
}

const mapOwnedBadge = (
  badge: {
    badges: { id: string; slug: string; name: string; description: string | null; category: string; rarity: string; icon: string | null; theme: string | null; requirements: Record<string, unknown>; reward_points: number; available_from: string | null; available_to: string | null } | null
    awarded_at: string
    state: 'awarded' | 'revoked' | 'suspended'
    notified_at: string | null
  },
): OwnedBadge | null => {
  if (!badge.badges) return null
  return {
    id: badge.badges.id,
    slug: badge.badges.slug,
    name: badge.badges.name,
    description: badge.badges.description,
    category: badge.badges.category,
    rarity: badge.badges.rarity,
    icon: badge.badges.icon,
    theme: badge.badges.theme,
    requirements: badge.badges.requirements,
    rewardPoints: badge.badges.reward_points,
    availableFrom: badge.badges.available_from,
    availableTo: badge.badges.available_to,
    awardedAt: badge.awarded_at,
    state: badge.state,
    notifiedAt: badge.notified_at,
  }
}

export interface GamificationProfilePayload {
  profile: GamificationProfileSummary | null
  badges: OwnedBadge[]
  streakHistory: Array<{ date: string; xp: number }>
  recentActions: Array<{ actionType: string; awardedAt: string; xp: number; points: number }>
}

export const fetchGamificationProfile = async (
  profileId: string,
  client: SupabaseClient = createServiceRoleClient(),
): Promise<GamificationProfilePayload> => {
  const cacheKey = buildCacheKey('gamification', 'profile', profileId)
  const cached = await cacheGet<GamificationProfilePayload>(cacheKey)
  if (cached) {
    return cached
  }

  const supabase = client

  const [{ data: profileRow }, { data: badgesData }, { data: actionsData }] = await Promise.all([
    supabase
      .from('gamification_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle(),
    supabase
      .from('profile_badges')
      .select('awarded_at, state, notified_at, badges:badge_id (id, slug, name, description, category, rarity, icon, theme, requirements, reward_points, available_from, available_to)')
      .eq('profile_id', profileId)
      .order('awarded_at', { ascending: false }),
    supabase
      .from('gamification_actions')
      .select('action_type, awarded_at, xp_awarded, points_awarded')
      .eq('profile_id', profileId)
      .order('awarded_at', { ascending: false })
      .limit(20),
  ])

  const profile = profileRow ? mapProfileRow(profileRow) : null
  const badges = (badgesData ?? [])
    .map((badge) => mapOwnedBadge(badge as any))
    .filter((value): value is OwnedBadge => Boolean(value))

  const recentActions = (actionsData ?? []).map((action) => ({
    actionType: action.action_type,
    awardedAt: action.awarded_at,
    xp: Number(action.xp_awarded ?? 0),
    points: Number(action.points_awarded ?? 0),
  }))

  const streakHistory = recentActions.map((entry) => ({
    date: entry.awardedAt,
    xp: entry.xp,
  }))

  const payload: GamificationProfilePayload = {
    profile,
    badges,
    streakHistory,
    recentActions,
  }

  await cacheSet(cacheKey, payload, PROFILE_CACHE_TTL_SECONDS)

  return payload
}

interface LeaderboardPayload {
  entries: LeaderboardEntry[]
  capturedAt: string
}

const mapLeaderboardEntries = (
  rows: Array<{
    profile_id: string
    xp_total: number
    level: number
    current_streak: number
    profiles: { display_name: string | null; avatar_url: string | null } | null
    badges: { slug: string }[] | null
  }>,
): LeaderboardEntry[] =>
  rows.map((row, index) => ({
    profileId: row.profile_id,
    xp: Number(row.xp_total ?? 0),
    level: Number(row.level ?? 1),
    streak: Number(row.current_streak ?? 0),
    displayName: row.profiles?.display_name ?? 'Community member',
    avatarUrl: row.profiles?.avatar_url ?? null,
    badges: (row.badges ?? []).map((badge) => badge.slug),
    rank: index + 1,
  }))

export const fetchLeaderboard = async (
  filters: LeaderboardFilters,
  client: SupabaseClient = createServiceRoleClient(),
): Promise<LeaderboardPayload> => {
  const cacheKey = buildCacheKey('gamification', 'leaderboard', filters.scope, filters.category ?? 'all')
  const cached = await cacheGet<LeaderboardPayload>(cacheKey)

  if (cached) {
    return cached
  }

  const supabase = client
  const { data, error } = await supabase
    .from('gamification_profiles')
    .select('profile_id, xp_total, level, current_streak, profiles:profile_id (display_name, avatar_url), badges:profile_badges!left (slug)')
    .order('xp_total', { ascending: false })
    .limit(filters.limit ?? 10)

  if (error) {
    throw new Error(`Unable to load leaderboard: ${error.message}`)
  }

  const payload: LeaderboardPayload = {
    entries: mapLeaderboardEntries(data ?? []),
    capturedAt: new Date().toISOString(),
  }

  await cacheSet(cacheKey, payload, LEADERBOARD_CACHE_TTL_SECONDS)

  return payload
}
