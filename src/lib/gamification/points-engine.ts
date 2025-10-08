import { createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import {
  cacheGet,
  cacheInvalidate,
  cacheSet,
  buildCacheKey,
} from './cache'
import type {
  ActionDefinition,
  GamificationProfileSummary,
  GamificationActionType,
  RecordActionInput,
  RecordActionResult,
  SupabaseClient,
} from './types'
import { evaluateBadgesForAction } from './badge-evaluator'
import { applyStreakProgress } from './streak-manager'
import { processChallengesForAction } from './challenge-service'
import { syncRolesForProfile } from './role-service'

const ACTION_DEFINITIONS: Record<GamificationActionType, ActionDefinition> = {
  'post.published': {
    type: 'post.published',
    baseXp: 120,
    basePoints: 100,
    description: 'Published a new article',
    cooldownMs: 1000 * 60 * 30,
  },
  'post.updated': {
    type: 'post.updated',
    baseXp: 40,
    basePoints: 30,
    description: 'Updated an existing article',
    cooldownMs: 1000 * 60 * 10,
    maxDailyOccurrences: 5,
  },
  'comment.approved': {
    type: 'comment.approved',
    baseXp: 25,
    basePoints: 15,
    description: 'Had a comment approved',
    cooldownMs: 1000 * 60 * 5,
  },
  'comment.submitted': {
    type: 'comment.submitted',
    baseXp: 10,
    basePoints: 5,
    description: 'Submitted a comment pending review',
    cooldownMs: 1000 * 60,
    maxDailyOccurrences: 10,
  },
  'comment.received_upvote': {
    type: 'comment.received_upvote',
    baseXp: 15,
    basePoints: 10,
    description: 'Received a community upvote',
    cooldownMs: 1000 * 60,
    maxDailyOccurrences: 20,
  },
  'onboarding.completed': {
    type: 'onboarding.completed',
    baseXp: 150,
    basePoints: 200,
    description: 'Completed onboarding journey',
  },
  'account.login_streak': {
    type: 'account.login_streak',
    baseXp: 35,
    basePoints: 25,
    description: 'Maintained a login streak',
    cooldownMs: 1000 * 60 * 60 * 12,
  },
  'challenge.completed': {
    type: 'challenge.completed',
    baseXp: 200,
    basePoints: 160,
    description: 'Completed an active challenge',
  },
  'badge.awarded': {
    type: 'badge.awarded',
    baseXp: 80,
    basePoints: 60,
    description: 'Badge unlocked bonus',
  },
  'custom.manual_adjustment': {
    type: 'custom.manual_adjustment',
    baseXp: 0,
    basePoints: 0,
    description: 'Manual admin adjustment',
  },
}

const LEVEL_CACHE_KEY = 'gamification:levels:v1'
const LEVEL_CACHE_TTL_SECONDS = 60 * 15

interface LevelDefinition {
  level: number
  min_xp: number
  title: string
}

const mapProfileRowToSummary = (
  row: Database['public']['Tables']['gamification_profiles']['Row'],
  nextLevelXp: number,
): GamificationProfileSummary => {
  const xpTotal = Number(row.xp_total ?? 0)
  const currentLevel = Number(row.level ?? 1)
  const xpToNext = Math.max(nextLevelXp - xpTotal, 0)
  const levelProgress = nextLevelXp > 0 ? Math.min((xpTotal / nextLevelXp) * 100, 100) : 0

  return {
    profileId: row.profile_id,
    xpTotal,
    level: currentLevel,
    prestigeLevel: Number(row.prestige_level ?? 0),
    currentStreak: Number(row.current_streak ?? 0),
    longestStreak: Number(row.longest_streak ?? 0),
    nextLevelXp,
    progressPercentage: Math.round(levelProgress * 100) / 100,
    optedIn: Boolean(row.opted_in),
    lastActionAt: row.last_action_at,
    streakFrozenUntil: row.streak_frozen_until,
    settings: row.settings ?? {},
  }
}

const loadLevelDefinitions = async (supabase: SupabaseClient): Promise<LevelDefinition[]> => {
  const cached = await cacheGet<LevelDefinition[]>(LEVEL_CACHE_KEY)

  if (cached) {
    return cached
  }

  const { data, error } = await supabase
    .from('gamification_levels')
    .select('level, min_xp, title')
    .order('min_xp', { ascending: true })

  if (error) {
    throw new Error(`Unable to load gamification levels: ${error.message}`)
  }

  const mapped: LevelDefinition[] = (data ?? []).map((entry) => ({
    level: Number(entry.level),
    min_xp: Number(entry.min_xp),
    title: String(entry.title ?? `Level ${entry.level}`),
  }))

  await cacheSet(LEVEL_CACHE_KEY, mapped, LEVEL_CACHE_TTL_SECONDS)

  return mapped
}

const resolveLevel = (levels: LevelDefinition[], xpTotal: number) => {
  let currentLevel = 1
  let nextLevelXp = xpTotal

  for (const levelDef of levels) {
    if (xpTotal >= levelDef.min_xp) {
      currentLevel = levelDef.level
    } else {
      nextLevelXp = levelDef.min_xp
      break
    }
  }

  const lastLevel = levels[levels.length - 1]

  if (!levels.some((level) => level.level === currentLevel)) {
    currentLevel = lastLevel ? lastLevel.level : 1
  }

  if (xpTotal >= (lastLevel?.min_xp ?? 0)) {
    nextLevelXp = (lastLevel?.min_xp ?? xpTotal) + Math.pow(1.5, currentLevel) * 500
  }

  return { currentLevel, nextLevelXp }
}

const hasExceededDailyCap = async (
  supabase: SupabaseClient,
  profileId: string,
  actionType: GamificationActionType,
  maxDailyOccurrences?: number,
) => {
  if (!maxDailyOccurrences) {
    return false
  }

  const startOfDay = new Date()
  startOfDay.setUTCHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('gamification_actions')
    .select('id', { head: true, count: 'exact' })
    .eq('profile_id', profileId)
    .eq('action_type', actionType)
    .gte('awarded_at', startOfDay.toISOString())

  if (error) {
    console.error('Unable to check action daily cap', error)
    return false
  }

  return typeof count === 'number' && count >= maxDailyOccurrences
}

const shouldApplyCooldown = async (
  profileId: string,
  action: ActionDefinition,
): Promise<boolean> => {
  if (!action.cooldownMs) {
    return false
  }

  const cacheKey = buildCacheKey('gamification', 'cooldown', profileId, action.type)
  const expiresAt = await cacheGet<number>(cacheKey)

  if (expiresAt && expiresAt > Date.now()) {
    return true
  }

  await cacheSet(cacheKey, Date.now() + action.cooldownMs, Math.ceil(action.cooldownMs / 1000))
  return false
}

const coerceNumber = (value: unknown, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const ensureProfileRecord = async (supabase: SupabaseClient, profileId: string) => {
  const { data, error } = await supabase
    .from('gamification_profiles')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load gamification profile: ${error.message}`)
  }

  if (data) {
    return data
  }

  const insertPayload: Database['public']['Tables']['gamification_profiles']['Insert'] = {
    profile_id: profileId,
    xp_total: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
    level_progress: {},
    settings: {},
  }

  const { data: inserted, error: insertError } = await supabase
    .from('gamification_profiles')
    .insert(insertPayload)
    .select('*')
    .maybeSingle()

  if (insertError) {
    throw new Error(`Unable to create gamification profile: ${insertError.message}`)
  }

  return inserted!
}

export const recordAction = async (
  input: RecordActionInput,
  client: SupabaseClient = createServiceRoleClient(),
): Promise<RecordActionResult> => {
  const definition = ACTION_DEFINITIONS[input.actionType] ?? ACTION_DEFINITIONS['custom.manual_adjustment']
  const supabase = client

  const existingProfileRow = await ensureProfileRecord(supabase, input.profileId)

  if (!existingProfileRow.opted_in && input.actionType !== 'custom.manual_adjustment') {
    return {
      applied: false,
      xpAwarded: 0,
      pointsAwarded: 0,
      profile: mapProfileRowToSummary(existingProfileRow, 0),
      newlyEarnedBadges: [],
      completedChallenges: [],
    }
  }

  if (await shouldApplyCooldown(input.profileId, definition)) {
    return {
      applied: false,
      xpAwarded: 0,
      pointsAwarded: 0,
      profile: mapProfileRowToSummary(existingProfileRow, 0),
      newlyEarnedBadges: [],
      completedChallenges: [],
    }
  }

  if (await hasExceededDailyCap(supabase, input.profileId, definition.type, definition.maxDailyOccurrences)) {
    return {
      applied: false,
      xpAwarded: 0,
      pointsAwarded: 0,
      profile: mapProfileRowToSummary(existingProfileRow, 0),
      newlyEarnedBadges: [],
      completedChallenges: [],
    }
  }

  const metadata = input.metadata ?? {}
  const xpAwarded = coerceNumber(metadata.xp ?? definition.baseXp, definition.baseXp)
  const pointsAwarded = coerceNumber(metadata.points ?? definition.basePoints, definition.basePoints)

  const nowIso = new Date().toISOString()

  const { error: insertError } = await supabase.from('gamification_actions').insert({
    profile_id: input.profileId,
    action_type: definition.type,
    action_source: input.actionSource ?? null,
    metadata,
    xp_awarded: xpAwarded,
    points_awarded: pointsAwarded,
    awarded_at: nowIso,
    request_id: input.requestId ?? null,
  })

  if (insertError) {
    throw new Error(`Unable to record gamification action: ${insertError.message}`)
  }

  const levels = await loadLevelDefinitions(supabase)

  const newXpTotal = coerceNumber(existingProfileRow.xp_total) + xpAwarded
  const streakResult = applyStreakProgress(existingProfileRow, nowIso)
  const { currentLevel, nextLevelXp } = resolveLevel(levels, newXpTotal)

  const updatedPayload: Database['public']['Tables']['gamification_profiles']['Update'] = {
    xp_total: newXpTotal,
    level: currentLevel,
    current_streak: streakResult.currentStreak,
    longest_streak: Math.max(streakResult.currentStreak, coerceNumber(existingProfileRow.longest_streak)),
    last_action_at: nowIso,
    level_progress: {
      nextLevelXp,
      xpAwarded,
      pointsAwarded,
      actionType: definition.type,
    },
  }

  if (streakResult.streakFrozenUntil) {
    updatedPayload.streak_frozen_until = streakResult.streakFrozenUntil
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from('gamification_profiles')
    .update(updatedPayload)
    .eq('profile_id', input.profileId)
    .select('*')
    .maybeSingle()

  if (updateError || !updatedRow) {
    throw new Error(`Unable to update gamification profile: ${updateError?.message ?? 'unknown error'}`)
  }

  await cacheInvalidate(buildCacheKey('gamification', 'leaderboard'))

  const profileSummary = mapProfileRowToSummary(updatedRow, nextLevelXp)

  const badgeResults = await evaluateBadgesForAction({
    profile: profileSummary,
    action: input,
    metadata,
  }, supabase)

  const challengeResults = await processChallengesForAction({
    profile: profileSummary,
    action: input,
    xpAwarded,
    metadata,
  }, supabase)

  await syncRolesForProfile(profileSummary, supabase)

  return {
    applied: true,
    xpAwarded,
    pointsAwarded,
    profile: profileSummary,
    newlyEarnedBadges: badgeResults.newBadges,
    completedChallenges: challengeResults.completed,
  }
}
