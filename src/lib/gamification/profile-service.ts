import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteCached, getCached, setCached } from './cache';
import { PROFILE_CACHE_TTL_MS } from './constants';
import type { GamificationBadge, GamificationProfile, LeaderboardEntry, LeaderboardFilters } from './types';

const PROFILE_WITH_BADGES_KEY = (profileId: string) => `gamification:profile:full:${profileId}`;

export interface FullGamificationProfile {
  profile: GamificationProfile;
  badges: GamificationBadge[];
  challengeProgress: {
    slug: string;
    status: string;
    progressValue: number;
    progressTarget: number;
    endsAt: string;
  }[];
  levels: { level: number; minXp: number }[];
}

const mapGamificationProfile = (row: Record<string, unknown>): GamificationProfile => ({
  profileId: row.profile_id as string,
  xpTotal: Number(row.xp_total ?? 0),
  level: Number(row.level ?? 1),
  prestige: Number(row.prestige ?? 0),
  currentStreak: Number(row.current_streak ?? 0),
  longestStreak: Number(row.longest_streak ?? 0),
  lastActionAt: (row.last_action_at as string | null) ?? null,
  settings: (row.settings as GamificationProfile['settings']) ?? {
    optedIn: true,
    showcaseBadges: true,
    emailNotifications: true,
    betaTester: false,
  },
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const mapBadge = (row: Record<string, unknown>): GamificationBadge | null => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const requirements = row.requirements as Record<string, unknown> | null;

  if (!requirements) {
    return null;
  }

  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    category: row.category as string,
    rarity: (row.rarity as GamificationBadge['rarity']) ?? 'common',
    requirements: requirements as unknown as GamificationBadge['requirements'],
    isTimeLimited: Boolean(row.is_time_limited),
    availableFrom: (row.available_from as string | null) ?? null,
    availableTo: (row.available_to as string | null) ?? null,
  };
};

export const fetchFullGamificationProfile = async (
  supabase: SupabaseClient,
  profileId: string,
): Promise<FullGamificationProfile | null> => {
  const cacheKey = PROFILE_WITH_BADGES_KEY(profileId);
  const cached = await getCached<FullGamificationProfile>(cacheKey);

  if (cached) {
    return cached;
  }

  const { data: profileRow, error: profileError } = await supabase
    .from('gamification_profiles')
    .select('profile_id, xp_total, level, prestige, current_streak, longest_streak, last_action_at, settings, created_at, updated_at')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to load gamification profile: ${profileError.message}`);
  }

  if (!profileRow) {
    return null;
  }

  const profile = mapGamificationProfile(profileRow);

  const { data: badgeRows, error: badgeError } = await supabase
    .from('profile_badges')
    .select('badge:badge_id (id, slug, name, description, category, rarity, requirements, is_time_limited, available_from, available_to), awarded_at')
    .eq('profile_id', profileId)
    .order('awarded_at', { ascending: false });

  if (badgeError) {
    throw new Error(`Unable to load badge ownership: ${badgeError.message}`);
  }

  const badges: GamificationBadge[] = [];

  for (const row of badgeRows ?? []) {
    const badge = row.badge;

    if (!badge || typeof badge !== 'object' || Array.isArray(badge)) {
      continue;
    }

    const mapped = mapBadge(badge as Record<string, unknown>);

    if (mapped) {
      badges.push(mapped);
    }
  }

  const { data: challengeRows, error: challengeError } = await supabase
    .from('profile_challenge_progress')
    .select('status, progress, completed_at, challenge:challenge_id (slug, ends_at)')
    .eq('profile_id', profileId);

  if (challengeError) {
    throw new Error(`Unable to load challenge progress: ${challengeError.message}`);
  }

  const challengeProgress = (challengeRows ?? []).map((row) => ({
    slug: ((row.challenge as { slug?: string })?.slug as string) ?? 'unknown',
    status: (row.status as string) ?? 'active',
    progressValue: Number(((row.progress as Record<string, unknown>)?.value as number) ?? 0),
    progressTarget: Number(((row.progress as Record<string, unknown>)?.target as number) ?? 0),
    endsAt: ((row.challenge as { ends_at?: string })?.ends_at as string) ?? '',
  }));

  const { data: levelRows, error: levelError } = await supabase
    .from('gamification_levels')
    .select('level, min_xp')
    .order('level', { ascending: true });

  if (levelError) {
    throw new Error(`Unable to load level definitions: ${levelError.message}`);
  }

  const levels = (levelRows ?? []).map((row) => ({
    level: Number(row.level ?? 1),
    minXp: Number(row.min_xp ?? 0),
  }));

  const result: FullGamificationProfile = {
    profile,
    badges,
    challengeProgress,
    levels,
  };

  await setCached(cacheKey, result, PROFILE_CACHE_TTL_MS);
  return result;
};

export const updateGamificationSettings = async (
  supabase: SupabaseClient,
  profileId: string,
  settings: Partial<GamificationProfile['settings']>,
) => {
  const { data: current, error: currentError } = await supabase
    .from('gamification_profiles')
    .select('profile_id, xp_total, level, prestige, current_streak, longest_streak, last_action_at, settings, created_at, updated_at')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (currentError) {
    throw new Error(`Unable to load gamification settings: ${currentError.message}`);
  }

  if (!current) {
    throw new Error('Gamification profile missing during settings update.');
  }

  const mergedSettings = {
    ...(current.settings as GamificationProfile['settings']),
    ...settings,
  } satisfies GamificationProfile['settings'];

  const { data, error } = await supabase
    .from('gamification_profiles')
    .update({ settings: mergedSettings })
    .eq('profile_id', profileId)
    .select('profile_id, xp_total, level, prestige, current_streak, longest_streak, last_action_at, settings, created_at, updated_at')
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update gamification settings: ${error.message}`);
  }

  if (!data) {
    throw new Error('Gamification profile missing during settings update.');
  }

  const profile = mapGamificationProfile(data);
  await deleteCached(PROFILE_WITH_BADGES_KEY(profileId));
  await deleteCached(`gamification:profile:${profileId}`);
  return profile;
};

const LEADERBOARD_CACHE_KEY = (scope: string) => `gamification:leaderboard:${scope}`;

export const fetchLeaderboard = async (
  supabase: SupabaseClient,
  filters: LeaderboardFilters,
): Promise<LeaderboardEntry[]> => {
  const scope = filters.scope ?? 'global';
  const cacheKey = LEADERBOARD_CACHE_KEY(scope);
  const cached = await getCached<LeaderboardEntry[]>(cacheKey);

  if (cached && cached.length) {
    return cached.slice(0, filters.limit ?? cached.length);
  }

  const { data: snapshotRow } = await supabase
    .from('leaderboard_snapshots')
    .select('payload, expires_at')
    .eq('scope', scope)
    .order('captured_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let entries: LeaderboardEntry[] = [];

  if (snapshotRow && snapshotRow.payload && Array.isArray(snapshotRow.payload)) {
    entries = (snapshotRow.payload as LeaderboardEntry[]).map((entry, index) => ({
      ...entry,
      rank: entry.rank ?? index + 1,
    }));
  } else {
    const { data, error } = await supabase
      .from('gamification_profiles')
      .select('profile_id, xp_total, level, current_streak')
      .order('xp_total', { ascending: false })
      .limit(filters.limit ?? 20);

    if (error) {
      throw new Error(`Unable to build leaderboard: ${error.message}`);
    }

    entries = (data ?? []).map((row, index) => ({
      profileId: row.profile_id as string,
      displayName: row.profile_id as string,
      avatarUrl: null,
      level: Number(row.level ?? 1),
      xpTotal: Number(row.xp_total ?? 0),
      rank: index + 1,
      streak: Number(row.current_streak ?? 0),
    }));
  }

  await setCached(cacheKey, entries, PROFILE_CACHE_TTL_MS * 3);
  return entries.slice(0, filters.limit ?? entries.length);
};
