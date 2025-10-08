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
import {
  extractNumericField,
  ensureJsonRecord,
  isBadgeState,
  isRecordLike,
  toNumber,
  toNullableString,
} from './utils'

const PROFILE_CACHE_TTL_SECONDS = 60
const LEADERBOARD_CACHE_TTL_SECONDS = 30

const mapProfileRow = (
  row: Database['public']['Tables']['gamification_profiles']['Row'],
): GamificationProfileSummary => {
  const xpTotal = Number(row.xp_total ?? 0)
  const nextLevelXp = extractNumericField(row.level_progress, 'nextLevelXp') ?? 0
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
    settings: ensureJsonRecord(row.settings ?? {}),
  }
}

interface BadgeDetails {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  rarity: string
  icon: string | null
  theme: string | null
  requirements: Record<string, unknown>
  rewardPoints: number
  availableFrom: string | null
  availableTo: string | null
}

const resolveBadgeDetails = (value: unknown): BadgeDetails | null => {
  if (!isRecordLike(value)) {
    return null
  }

  const requiredStrings: Array<keyof typeof value> = ['id', 'slug', 'name', 'category', 'rarity']
  if (!requiredStrings.every((key) => typeof value[key] === 'string')) {
    return null
  }

  const requirements = ensureJsonRecord(value.requirements)

  return {
    id: value.id as string,
    slug: value.slug as string,
    name: value.name as string,
    description: typeof value.description === 'string' ? value.description : null,
    category: value.category as string,
    rarity: value.rarity as string,
    icon: toNullableString(value.icon),
    theme: toNullableString(value.theme),
    requirements,
    rewardPoints: toNumber(value.reward_points, 0),
    availableFrom: toNullableString(value.available_from),
    availableTo: toNullableString(value.available_to),
  }
}

const mapOwnedBadge = (badge: unknown): OwnedBadge | null => {
  if (!isRecordLike(badge)) {
    return null
  }

  const details = resolveBadgeDetails(badge.badges)
  if (!details) {
    return null
  }

  const awardedAt = toNullableString(badge.awarded_at)
  const state = isBadgeState(badge.state) ? badge.state : null

  if (!awardedAt || !state) {
    return null
  }

  return {
    id: details.id,
    slug: details.slug,
    name: details.name,
    description: details.description,
    category: details.category,
    rarity: details.rarity,
    icon: details.icon,
    theme: details.theme,
    requirements: details.requirements,
    rewardPoints: details.rewardPoints,
    availableFrom: details.availableFrom,
    availableTo: details.availableTo,
    awardedAt,
    state,
    notifiedAt: toNullableString(badge.notified_at),
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
    .map((badge) => mapOwnedBadge(badge))
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

const mapLeaderboardEntries = (rows: unknown[]): LeaderboardEntry[] =>
  rows
    .map((row, index) => {
      if (!isRecordLike(row)) {
        return null
      }

      const profileId = typeof row.profile_id === 'string' ? row.profile_id : null
      if (!profileId) {
        return null
      }

      const xp = toNumber(row.xp_total, 0)
      const level = toNumber(row.level, 1)
      const streak = toNumber(row.current_streak, 0)

      const profileSource = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
      const displayName =
        isRecordLike(profileSource) && typeof profileSource.display_name === 'string'
          ? profileSource.display_name
          : null
      const avatarUrl =
        isRecordLike(profileSource) && typeof profileSource.avatar_url === 'string'
          ? profileSource.avatar_url
          : null

      const badgeSlugs = (Array.isArray(row.badges) ? row.badges : [])
        .map((badge) => (isRecordLike(badge) && typeof badge.slug === 'string' ? badge.slug : null))
        .filter((slug): slug is string => Boolean(slug))

      return {
        profileId,
        xp,
        level,
        streak,
        displayName: displayName ?? 'Community member',
        avatarUrl: avatarUrl ?? null,
        badges: badgeSlugs,
        rank: index + 1,
      }
    })
    .filter((entry): entry is LeaderboardEntry => Boolean(entry))

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
