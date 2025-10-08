import type { SupabaseClient } from '@supabase/supabase-js';
import { ACTION_DEFINITIONS, PROFILE_CACHE_TTL_MS } from './constants';
import { getCached, setCached, deleteCached } from './cache';
import type {
  GamificationLevel,
  GamificationProfile,
  PointsAwardResult,
  PointsEngineContext,
} from './types';
import { evaluateBadges } from './badge-evaluator';
import { updateStreak } from './streak-manager';
import { processChallenges } from './challenge-service';
import { syncRoleAssignments } from './role-service';

const LEVELS_CACHE_KEY = 'gamification:levels';
const PROFILE_CACHE_KEY = (profileId: string) => `gamification:profile:${profileId}`;

const fetchLevels = async (supabase: SupabaseClient): Promise<GamificationLevel[]> => {
  const cached = await getCached<GamificationLevel[]>(LEVELS_CACHE_KEY);

  if (cached) {
    return cached;
  }

  const { data, error } = await supabase
    .from('gamification_levels')
    .select('level, min_xp, perks')
    .order('level', { ascending: true });

  if (error) {
    throw new Error(`Unable to fetch gamification levels: ${error.message}`);
  }

  const levels = (data ?? []).map((row) => ({
    level: Number(row.level),
    minXp: Number(row.min_xp ?? 0),
    perks: (row.perks as Record<string, unknown> | null) ?? null,
  }));

  await setCached(LEVELS_CACHE_KEY, levels, PROFILE_CACHE_TTL_MS * 4);
  return levels;
};

const resolveLevel = (xpTotal: number, levels: GamificationLevel[]) => {
  if (levels.length === 0) {
    return 1;
  }

  let resolved = levels[0]?.level ?? 1;

  for (const level of levels) {
    if (xpTotal >= level.minXp) {
      resolved = level.level;
    } else {
      break;
    }
  }

  return resolved;
};

const loadProfile = async (supabase: SupabaseClient, profileId: string): Promise<GamificationProfile | null> => {
  const cacheKey = PROFILE_CACHE_KEY(profileId);
  const cached = await getCached<GamificationProfile>(cacheKey);

  if (cached) {
    return cached;
  }

  const { data, error } = await supabase
    .from('gamification_profiles')
    .select('profile_id, xp_total, level, prestige, current_streak, longest_streak, last_action_at, settings, created_at, updated_at')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load gamification profile: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const profile: GamificationProfile = {
    profileId: data.profile_id as string,
    xpTotal: Number(data.xp_total ?? 0),
    level: Number(data.level ?? 1),
    prestige: Number(data.prestige ?? 0),
    currentStreak: Number(data.current_streak ?? 0),
    longestStreak: Number(data.longest_streak ?? 0),
    lastActionAt: (data.last_action_at as string | null) ?? null,
    settings: (data.settings as GamificationProfile['settings']) ?? {
      optedIn: false,
      showcaseBadges: false,
      emailNotifications: true,
      betaTester: false,
    },
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };

  await setCached(cacheKey, profile, PROFILE_CACHE_TTL_MS);
  return profile;
};

const saveProfile = async (
  supabase: SupabaseClient,
  profile: GamificationProfile,
): Promise<GamificationProfile> => {
  const { data, error } = await supabase
    .from('gamification_profiles')
    .update({
      xp_total: profile.xpTotal,
      level: profile.level,
      prestige: profile.prestige,
      current_streak: profile.currentStreak,
      longest_streak: profile.longestStreak,
      last_action_at: profile.lastActionAt,
      updated_at: new Date().toISOString(),
    })
    .eq('profile_id', profile.profileId)
    .select('profile_id, xp_total, level, prestige, current_streak, longest_streak, last_action_at, settings, created_at, updated_at')
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to persist gamification profile: ${error.message}`);
  }

  if (!data) {
    throw new Error('Gamification profile update returned no data.');
  }

  const nextProfile: GamificationProfile = {
    profileId: data.profile_id as string,
    xpTotal: Number(data.xp_total ?? 0),
    level: Number(data.level ?? 1),
    prestige: Number(data.prestige ?? 0),
    currentStreak: Number(data.current_streak ?? 0),
    longestStreak: Number(data.longest_streak ?? 0),
    lastActionAt: (data.last_action_at as string | null) ?? null,
    settings: (data.settings as GamificationProfile['settings']) ?? profile.settings,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };

  await setCached(PROFILE_CACHE_KEY(nextProfile.profileId), nextProfile, PROFILE_CACHE_TTL_MS);
  return nextProfile;
};

const withinCooldown = async (
  supabase: SupabaseClient,
  profileId: string,
  actionType: string,
  cooldownSeconds?: number,
) => {
  if (!cooldownSeconds || cooldownSeconds <= 0) {
    return false;
  }

  const threshold = new Date(Date.now() - cooldownSeconds * 1000).toISOString();

  const { data, error } = await supabase
    .from('gamification_actions')
    .select('id')
    .eq('profile_id', profileId)
    .eq('action_type', actionType)
    .gte('awarded_at', threshold)
    .limit(1);

  if (error) {
    throw new Error(`Unable to verify action cooldown: ${error.message}`);
  }

  return Boolean(data?.length);
};

export const recordGamificationAction = async ({
  supabase,
  profileId,
  actionType,
  metadata = null,
}: PointsEngineContext): Promise<PointsAwardResult> => {
  const definition = ACTION_DEFINITIONS[actionType];

  if (!definition) {
    throw new Error(`Unknown gamification action: ${actionType}`);
  }

  const profile = await loadProfile(supabase, profileId);

  if (!profile) {
    throw new Error('Gamification profile not found.');
  }

  if (!profile.settings.optedIn) {
    return { profile };
  }

  if (await withinCooldown(supabase, profileId, actionType, definition.cooldownSeconds)) {
    return { profile };
  }

  const levels = await fetchLevels(supabase);
  const awardDate = new Date().toISOString();

  const { data: actionData, error: actionError } = await supabase
    .from('gamification_actions')
    .insert({
      profile_id: profileId,
      action_type: actionType,
      points: definition.points,
      xp: definition.xp,
      metadata,
      awarded_at: awardDate,
    })
    .select('id, profile_id, action_type, points, xp, metadata, awarded_at')
    .maybeSingle();

  if (actionError) {
    throw new Error(`Unable to record gamification action: ${actionError.message}`);
  }

  if (!actionData) {
    throw new Error('Gamification action did not persist.');
  }

  deleteCached(PROFILE_CACHE_KEY(profileId)).catch(() => {});

  const streakState = updateStreak(profile, awardDate);
  const updatedProfile: GamificationProfile = {
    ...profile,
    xpTotal: profile.xpTotal + definition.xp,
    currentStreak: streakState.currentStreak,
    longestStreak: streakState.longestStreak,
    lastActionAt: awardDate,
  };

  const resolvedLevel = resolveLevel(updatedProfile.xpTotal, levels);
  let levelUp = false;

  if (resolvedLevel > updatedProfile.level) {
    updatedProfile.level = resolvedLevel;
    levelUp = true;
  }

  const persistedProfile = await saveProfile(supabase, updatedProfile);

  const newlyAwardedBadges = await evaluateBadges({
    supabase,
    profile: persistedProfile,
    actionType,
    metadata,
  });

  const challengeUpdates = await processChallenges({
    supabase,
    profile: persistedProfile,
    actionType,
    metadata,
  });

  await syncRoleAssignments({
    supabase,
    profileId,
    profile: persistedProfile,
    newlyAwardedBadges,
  }).catch((error) => {
    console.error('Failed to sync gamified roles', error);
  });

  const action = {
    id: actionData.id as string,
    profileId: actionData.profile_id as string,
    actionType: actionData.action_type as string,
    points: Number(actionData.points ?? definition.points),
    xp: Number(actionData.xp ?? definition.xp),
    metadata: (actionData.metadata as Record<string, unknown> | null) ?? metadata,
    awardedAt: actionData.awarded_at as string,
  };

  return {
    action,
    profile: persistedProfile,
    levelUp,
    newlyAwardedBadges,
    challengeUpdates,
  };
};
