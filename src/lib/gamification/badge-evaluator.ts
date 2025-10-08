import type { SupabaseClient } from '@supabase/supabase-js';
import type { BadgeRequirement, GamificationBadge, GamificationProfile } from './types';

interface EvaluateBadgeInput {
  supabase: SupabaseClient;
  profile: GamificationProfile;
  actionType: string;
  metadata?: Record<string, unknown> | null;
}

const parseRequirement = (raw: unknown): BadgeRequirement | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const requirement = raw as Record<string, unknown>;
  const type = requirement.type;

  switch (type) {
    case 'total_actions': {
      const actionType = requirement.actionType;
      const threshold = requirement.threshold;

      if (typeof actionType === 'string' && typeof threshold === 'number') {
        return { type: 'total_actions', actionType, threshold };
      }
      break;
    }
    case 'level_reached': {
      const level = requirement.level;

      if (typeof level === 'number') {
        return { type: 'level_reached', level };
      }
      break;
    }
    case 'streak': {
      const days = requirement.days;

      if (typeof days === 'number') {
        return { type: 'streak', days };
      }
      break;
    }
    case 'event': {
      const eventKey = requirement.eventKey;

      if (typeof eventKey === 'string') {
        return { type: 'event', eventKey };
      }
      break;
    }
    case 'challenge_completed': {
      const challengeSlug = requirement.challengeSlug;

      if (typeof challengeSlug === 'string') {
        return { type: 'challenge_completed', challengeSlug };
      }
      break;
    }
    default:
      return null;
  }

  return null;
};

const isBadgeActive = (badge: { is_time_limited: boolean; available_from: string | null; available_to: string | null }) => {
  if (!badge.is_time_limited) {
    return true;
  }

  const now = Date.now();
  const from = badge.available_from ? Date.parse(badge.available_from) : null;
  const to = badge.available_to ? Date.parse(badge.available_to) : null;

  if (from && now < from) {
    return false;
  }

  if (to && now > to) {
    return false;
  }

  return true;
};

const hasReachedActionThreshold = async (
  supabase: SupabaseClient,
  profileId: string,
  actionType: string,
  threshold: number,
) => {
  const { count, error } = await supabase
    .from('gamification_actions')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('action_type', actionType);

  if (error) {
    throw new Error(`Unable to count gamification actions: ${error.message}`);
  }

  return (count ?? 0) >= threshold;
};

const hasCompletedChallenge = async (
  supabase: SupabaseClient,
  profileId: string,
  challengeSlug: string,
) => {
  const { data: challenge, error: challengeError } = await supabase
    .from('gamification_challenges')
    .select('id')
    .eq('slug', challengeSlug)
    .maybeSingle();

  if (challengeError) {
    throw new Error(`Unable to fetch challenge for badge check: ${challengeError.message}`);
  }

  if (!challenge) {
    return false;
  }

  const { data, error } = await supabase
    .from('profile_challenge_progress')
    .select('status')
    .eq('profile_id', profileId)
    .eq('challenge_id', challenge.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to verify challenge completion: ${error.message}`);
  }

  return (data?.status as string | null) === 'completed';
};

const buildBadge = (row: Record<string, unknown>): GamificationBadge | null => {
  const requirement = parseRequirement(row.requirements);

  if (!requirement) {
    return null;
  }

  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    category: row.category as string,
    rarity: (row.rarity as GamificationBadge['rarity']) ?? 'common',
    requirements: requirement,
    isTimeLimited: Boolean(row.is_time_limited),
    availableFrom: (row.available_from as string | null) ?? null,
    availableTo: (row.available_to as string | null) ?? null,
  };
};

export const evaluateBadges = async ({
  supabase,
  profile,
  actionType,
}: EvaluateBadgeInput): Promise<GamificationBadge[]> => {
  const { data: ownedBadges, error: ownedError } = await supabase
    .from('profile_badges')
    .select('badge_id')
    .eq('profile_id', profile.profileId);

  if (ownedError) {
    throw new Error(`Unable to load earned badges: ${ownedError.message}`);
  }

  const ownedIds = new Set((ownedBadges ?? []).map((row) => row.badge_id as string));

  const { data: catalog, error: catalogError } = await supabase
    .from('gamification_badges')
    .select('id, slug, name, description, category, rarity, requirements, is_time_limited, available_from, available_to');

  if (catalogError) {
    throw new Error(`Unable to load badge catalog: ${catalogError.message}`);
  }

  const eligible: GamificationBadge[] = [];

  for (const row of catalog ?? []) {
    if (!row || typeof row !== 'object') {
      continue;
    }

    if (ownedIds.has(row.id as string)) {
      continue;
    }

    if (!isBadgeActive({
      is_time_limited: Boolean(row.is_time_limited),
      available_from: (row.available_from as string | null) ?? null,
      available_to: (row.available_to as string | null) ?? null,
    })) {
      continue;
    }

    const badge = buildBadge(row);

    if (!badge) {
      continue;
    }

    let meetsRequirement = false;

    switch (badge.requirements.type) {
      case 'total_actions':
        meetsRequirement = await hasReachedActionThreshold(
          supabase,
          profile.profileId,
          badge.requirements.actionType,
          badge.requirements.threshold,
        );
        break;
      case 'level_reached':
        meetsRequirement = profile.level >= badge.requirements.level;
        break;
      case 'streak':
        meetsRequirement = profile.longestStreak >= badge.requirements.days;
        break;
      case 'event':
        meetsRequirement = actionType === badge.requirements.eventKey;
        break;
      case 'challenge_completed':
        meetsRequirement = await hasCompletedChallenge(
          supabase,
          profile.profileId,
          badge.requirements.challengeSlug,
        );
        break;
      default:
        meetsRequirement = false;
    }

    if (!meetsRequirement) {
      continue;
    }

    eligible.push(badge);
  }

  if (eligible.length === 0) {
    return [];
  }

  const rows = eligible.map((badge) => ({
    profile_id: profile.profileId,
    badge_id: badge.id,
    awarded_at: new Date().toISOString(),
  }));

  const { error: insertError } = await supabase.from('profile_badges').upsert(rows, {
    onConflict: 'profile_id,badge_id',
  });

  if (insertError) {
    throw new Error(`Unable to award badges: ${insertError.message}`);
  }

  return eligible;
};
