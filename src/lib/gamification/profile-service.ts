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
const LEADERBOARD_SNAPSHOT_TTL_SECONDS = 120

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

const buildSnapshotScopeKey = (filters: LeaderboardFilters) =>
  buildCacheKey('leaderboard', filters.scope, filters.category ?? 'all')

const purgeExpiredSnapshots = async (supabase: SupabaseClient) => {
  const nowIso = new Date().toISOString()
  const { error } = await supabase
    .from('leaderboard_snapshots')
    .delete()
    .lte('expires_at', nowIso)

  if (error) {
    console.error('Unable to purge expired leaderboard snapshots', error)
  }
}

const normalizeSnapshotEntry = (entry: unknown, index: number): LeaderboardEntry | null => {
  if (!isRecordLike(entry)) {
    return null
  }

  const profileId = typeof entry.profileId === 'string' ? entry.profileId : null
  if (!profileId) {
    return null
  }

  const displayName =
    typeof entry.displayName === 'string' && entry.displayName.trim().length
      ? entry.displayName
      : 'Community member'
  const avatarUrl = typeof entry.avatarUrl === 'string' ? entry.avatarUrl : null
  const level = Math.max(1, Math.round(toNumber(entry.level, 1)))
  const xp = Math.max(0, Math.round(toNumber(entry.xp, 0)))
  const streak = Math.max(0, Math.round(toNumber(entry.streak, 0)))
  const badges = Array.isArray(entry.badges)
    ? entry.badges.filter((badge): badge is string => typeof badge === 'string')
    : []
  const rank = Math.max(1, Math.round(toNumber(entry.rank, index + 1)))

  return {
    profileId,
    displayName,
    avatarUrl,
    level,
    xp,
    rank,
    badges,
    streak,
  }
}

const normalizeSnapshotPayload = (
  payload: unknown,
  capturedAtFallback: string,
): LeaderboardPayload | null => {
  if (!isRecordLike(payload)) {
    return null
  }

  const entriesSource = Array.isArray(payload.entries) ? payload.entries : []
  const entries = entriesSource
    .map((entry, index) => normalizeSnapshotEntry(entry, index))
    .filter((value): value is LeaderboardEntry => Boolean(value))

  const capturedAt =
    typeof payload.capturedAt === 'string' ? payload.capturedAt : capturedAtFallback

  return {
    entries,
    capturedAt,
  }
}

const loadLeaderboardSnapshot = async (
  supabase: SupabaseClient,
  scope: string,
): Promise<LeaderboardPayload | null> => {
  const { data, error } = await supabase
    .from('leaderboard_snapshots')
    .select('payload, captured_at, expires_at')
    .eq('scope', scope)
    .order('captured_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Unable to load leaderboard snapshot', error)
    return null
  }

  if (!data) {
    return null
  }

  const expiresAt = data.expires_at ? Date.parse(data.expires_at) : null
  if (expiresAt && expiresAt <= Date.now()) {
    return null
  }

  return normalizeSnapshotPayload(data.payload, data.captured_at ?? new Date().toISOString())
}

const storeLeaderboardSnapshot = async (
  supabase: SupabaseClient,
  scope: string,
  payload: LeaderboardPayload,
) => {
  const sanitizedEntries = payload.entries.map((entry, index) => ({
    profileId: entry.profileId,
    displayName: entry.displayName,
    avatarUrl: entry.avatarUrl,
    level: entry.level,
    xp: entry.xp,
    rank: index + 1,
    badges: entry.badges,
    streak: entry.streak,
  }))

  const snapshotPayload = {
    entries: sanitizedEntries,
    capturedAt: payload.capturedAt,
  }

  const expiresAt = new Date(Date.now() + LEADERBOARD_SNAPSHOT_TTL_SECONDS * 1000).toISOString()

  const { data, error } = await supabase
    .from('leaderboard_snapshots')
    .insert({ scope, expires_at: expiresAt, payload: snapshotPayload })
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('Unable to persist leaderboard snapshot', error)
    return
  }

  if (data?.id) {
    const { error: cleanupError } = await supabase
      .from('leaderboard_snapshots')
      .delete()
      .eq('scope', scope)
      .neq('id', data.id)

    if (cleanupError) {
      console.error('Unable to prune historical leaderboard snapshots', cleanupError)
    }
  }
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

      const badgeSources: unknown[] = []

      if (Array.isArray(row.badges)) {
        badgeSources.push(...row.badges)
      }

      if (isRecordLike(profileSource) && Array.isArray(profileSource.profile_badges)) {
        badgeSources.push(...profileSource.profile_badges)
      }

      const badgeSlugs = Array.from(
        new Set(
          badgeSources
            .map((badge) => {
              if (isRecordLike(badge) && typeof badge.slug === 'string') {
                return badge.slug
              }

              if (isRecordLike(badge) && isRecordLike(badge.badge) && typeof badge.badge.slug === 'string') {
                return badge.badge.slug
              }

              return null
            })
            .filter((slug): slug is string => Boolean(slug)),
        ),
      )

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
  const snapshotScope = buildSnapshotScopeKey(filters)
  const cached = await cacheGet<LeaderboardPayload>(cacheKey)

  if (cached) {
    return cached
  }

  const supabase = client
  await purgeExpiredSnapshots(supabase)

  const snapshot = await loadLeaderboardSnapshot(supabase, snapshotScope)
  if (snapshot) {
    await cacheSet(cacheKey, snapshot, LEADERBOARD_CACHE_TTL_SECONDS)
    return snapshot
  }

  const { data, error } = await supabase
    .from('gamification_profiles')
    .select(
      `
        profile_id,
        xp_total,
        level,
        current_streak,
        profiles:profile_id (
          display_name,
          avatar_url,
          profile_badges (
            badge:badge_id (
              slug
            )
          )
        )
      `,
    )
    .order('xp_total', { ascending: false })
    .limit(filters.limit ?? 10)

  if (error) {
    throw new Error(`Unable to load leaderboard: ${error.message}`)
  }

  const payload: LeaderboardPayload = {
    entries: mapLeaderboardEntries(data ?? []),
    capturedAt: new Date().toISOString(),
  }

  await storeLeaderboardSnapshot(supabase, snapshotScope, payload)
  await cacheSet(cacheKey, payload, LEADERBOARD_CACHE_TTL_SECONDS)

  return payload
}
