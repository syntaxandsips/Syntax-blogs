import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  GamificationChallenge,
  GamificationProfile,
  ProfileChallengeProgress,
} from './types';

interface ChallengeProcessInput {
  supabase: SupabaseClient;
  profile: GamificationProfile;
  actionType: string;
  metadata?: Record<string, unknown> | null;
}

const buildChallenge = (row: Record<string, unknown>): GamificationChallenge | null => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const requirements = row.requirements as Record<string, unknown> | null;

  if (!requirements) {
    return null;
  }

  const type = requirements.type;

  if (type === 'total_actions') {
    const actionType = requirements.actionType;
    const threshold = requirements.threshold;

    if (typeof actionType === 'string' && typeof threshold === 'number') {
      return {
        id: row.id as string,
        slug: row.slug as string,
        title: row.title as string,
        cadence: (row.cadence as GamificationChallenge['cadence']) ?? 'daily',
        requirements: { type: 'total_actions', actionType, threshold },
        rewardPoints: Number(row.reward_points ?? 0),
        rewardBadgeId: (row.reward_badge_id as string | null) ?? null,
        startsAt: row.starts_at as string,
        endsAt: row.ends_at as string,
        isActive: Boolean(row.is_active),
      };
    }
  }

  if (type === 'streak') {
    const days = requirements.days;

    if (typeof days === 'number') {
      return {
        id: row.id as string,
        slug: row.slug as string,
        title: row.title as string,
        cadence: (row.cadence as GamificationChallenge['cadence']) ?? 'daily',
        requirements: { type: 'streak', days },
        rewardPoints: Number(row.reward_points ?? 0),
        rewardBadgeId: (row.reward_badge_id as string | null) ?? null,
        startsAt: row.starts_at as string,
        endsAt: row.ends_at as string,
        isActive: Boolean(row.is_active),
      };
    }
  }

  if (type === 'level_reached') {
    const level = requirements.level;

    if (typeof level === 'number') {
      return {
        id: row.id as string,
        slug: row.slug as string,
        title: row.title as string,
        cadence: (row.cadence as GamificationChallenge['cadence']) ?? 'daily',
        requirements: { type: 'level_reached', level },
        rewardPoints: Number(row.reward_points ?? 0),
        rewardBadgeId: (row.reward_badge_id as string | null) ?? null,
        startsAt: row.starts_at as string,
        endsAt: row.ends_at as string,
        isActive: Boolean(row.is_active),
      };
    }
  }

  return null;
};

const countActionsForChallenge = async (
  supabase: SupabaseClient,
  profileId: string,
  actionType: string,
  startsAt: string,
  endsAt: string,
) => {
  const query = supabase
    .from('gamification_actions')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('action_type', actionType)
    .gte('awarded_at', startsAt)
    .lte('awarded_at', endsAt);

  const { count, error } = await query;

  if (error) {
    throw new Error(`Unable to count actions for challenge: ${error.message}`);
  }

  return count ?? 0;
};

export const processChallenges = async ({
  supabase,
  profile,
  actionType,
}: ChallengeProcessInput): Promise<ProfileChallengeProgress[]> => {
  const nowIso = new Date().toISOString();

  const { data: catalog, error: catalogError } = await supabase
    .from('gamification_challenges')
    .select('id, slug, title, cadence, requirements, reward_points, reward_badge_id, starts_at, ends_at, is_active')
    .eq('is_active', true)
    .lte('starts_at', nowIso)
    .gte('ends_at', nowIso);

  if (catalogError) {
    throw new Error(`Unable to load active challenges: ${catalogError.message}`);
  }

  if (!catalog || catalog.length === 0) {
    return [];
  }

  const challengeIds = catalog.map((row) => row.id as string);
  const { data: progressRows, error: progressError } = await supabase
    .from('profile_challenge_progress')
    .select('challenge_id, progress, status, started_at, completed_at')
    .eq('profile_id', profile.profileId)
    .in('challenge_id', challengeIds);

  if (progressError) {
    throw new Error(`Unable to load challenge progress: ${progressError.message}`);
  }

  const progressMap = new Map<string, ProfileChallengeProgress>();

  for (const row of progressRows ?? []) {
    progressMap.set(row.challenge_id as string, {
      profileId: profile.profileId,
      challengeId: row.challenge_id as string,
      status: (row.status as ProfileChallengeProgress['status']) ?? 'active',
      progress: (row.progress as Record<string, unknown>) ?? { value: 0 },
      startedAt: row.started_at as string,
      completedAt: (row.completed_at as string | null) ?? null,
    });
  }

  const updates: ProfileChallengeProgress[] = [];

  for (const entry of catalog) {
    const challenge = buildChallenge(entry);

    if (!challenge) {
      continue;
    }

    const existing = progressMap.get(challenge.id) ?? {
      profileId: profile.profileId,
      challengeId: challenge.id,
      status: 'active' as ProfileChallengeProgress['status'],
      progress: { value: 0 },
      startedAt: challenge.startsAt,
      completedAt: null,
    };

    if (existing.status === 'completed') {
      updates.push(existing);
      continue;
    }

    const previousProgress = existing.progress as { value?: unknown; target?: unknown };
    let value = Number(previousProgress?.value ?? 0);
    let target = Number(previousProgress?.target ?? 0);
    let completed = false;

    switch (challenge.requirements.type) {
      case 'total_actions': {
        if (actionType === challenge.requirements.actionType) {
          value = await countActionsForChallenge(
            supabase,
            profile.profileId,
            challenge.requirements.actionType,
            challenge.startsAt,
            challenge.endsAt,
          );
        }
        completed = value >= challenge.requirements.threshold;
        target = challenge.requirements.threshold;
        break;
      }
      case 'streak': {
        value = profile.currentStreak;
        completed = profile.currentStreak >= challenge.requirements.days;
        target = challenge.requirements.days;
        break;
      }
      case 'level_reached': {
        value = profile.level;
        completed = profile.level >= challenge.requirements.level;
        target = challenge.requirements.level;
        break;
      }
      default:
        break;
    }

    const status: ProfileChallengeProgress['status'] = completed ? 'completed' : 'active';
    const completedAt = completed ? new Date().toISOString() : existing.completedAt;

    updates.push({
      profileId: profile.profileId,
      challengeId: challenge.id,
      status,
      progress: { value, target },
      startedAt: existing.startedAt ?? challenge.startsAt,
      completedAt,
    });
  }

  if (updates.length === 0) {
    return [];
  }

  const payload = updates.map((update) => ({
    profile_id: update.profileId,
    challenge_id: update.challengeId,
    status: update.status,
    progress: update.progress,
    started_at: update.startedAt,
    completed_at: update.completedAt,
  }));

  const { error: upsertError } = await supabase.from('profile_challenge_progress').upsert(payload, {
    onConflict: 'profile_id,challenge_id',
  });

  if (upsertError) {
    throw new Error(`Unable to update challenge progress: ${upsertError.message}`);
  }

  return updates;
};
