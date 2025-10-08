import type { Database } from '@/lib/supabase/types'
import type {
  ChallengeDefinition,
  ChallengeProgress,
  RecordActionInput,
  SupabaseClient,
} from './types'

interface ProcessChallengesInput {
  profile: {
    profileId: string
  }
  action: RecordActionInput
  metadata: Record<string, unknown>
  xpAwarded: number
}

interface ProcessChallengesResult {
  completed: ChallengeProgress[]
}

const mapChallenge = (
  challenge: Database['public']['Tables']['gamification_challenges']['Row'],
): ChallengeDefinition => ({
  id: challenge.id,
  slug: challenge.slug,
  title: challenge.title,
  description: challenge.description,
  cadence: challenge.cadence,
  rewardPoints: challenge.reward_points,
  rewardBadgeId: challenge.reward_badge_id,
  startsAt: challenge.starts_at,
  endsAt: challenge.ends_at,
  requirements: challenge.requirements,
})

const buildProgressPayload = (
  previous: Record<string, unknown> | null,
  actionType: string,
) => {
  const progress = typeof previous === 'object' && previous !== null ? { ...previous } : {}
  const actionCounts = typeof progress.action_counts === 'object' && progress.action_counts !== null
    ? { ...(progress.action_counts as Record<string, number>) }
    : {}

  actionCounts[actionType] = (actionCounts[actionType] ?? 0) + 1

  return {
    ...progress,
    action_counts: actionCounts,
  }
}

const meetsCompletion = (
  challenge: ChallengeDefinition,
  progress: Record<string, unknown>,
) => {
  const requirements = (challenge.requirements ?? {}) as Record<string, unknown>
  const actionRequirements = Array.isArray(requirements.actions_required)
    ? (requirements.actions_required as Array<{ action: string; count?: number }>)
    : []
  const actionCounts = (progress.action_counts as Record<string, number> | undefined) ?? {}

  return actionRequirements.every((req) => {
    const requiredCount = Number(req.count ?? 1)
    return (actionCounts[req.action] ?? 0) >= requiredCount
  })
}

export const processChallengesForAction = async (
  input: ProcessChallengesInput,
  supabase: SupabaseClient,
): Promise<ProcessChallengesResult> => {
  const { data: activeChallenges, error: challengeError } = await supabase
    .from('gamification_challenges')
    .select('*')
    .eq('is_active', true)

  if (challengeError) {
    console.error('Unable to fetch active challenges', challengeError)
    return { completed: [] }
  }

  const completed: ChallengeProgress[] = []

  for (const challenge of activeChallenges ?? []) {
    const definition = mapChallenge(challenge)

    const { data: progressRow, error: progressError } = await supabase
      .from('profile_challenge_progress')
      .select('*')
      .eq('profile_id', input.profile.profileId)
      .eq('challenge_id', challenge.id)
      .maybeSingle()

    if (progressError) {
      console.error('Unable to load challenge progress', progressError)
      continue
    }

    const progressPayload = buildProgressPayload(progressRow?.progress ?? {}, input.action.actionType)

    if (!progressRow) {
      const { error: insertError } = await supabase.from('profile_challenge_progress').insert({
        profile_id: input.profile.profileId,
        challenge_id: challenge.id,
        progress: progressPayload,
      })

      if (insertError) {
        console.error('Unable to start challenge progress', insertError)
        continue
      }
    } else {
      const { error: updateError } = await supabase
        .from('profile_challenge_progress')
        .update({
          progress: progressPayload,
          status: 'active',
        })
        .eq('id', progressRow.id)

      if (updateError) {
        console.error('Unable to update challenge progress', updateError)
        continue
      }
    }

    if (meetsCompletion(definition, progressPayload)) {
      const completionTime = new Date().toISOString()
      const { data: completedRow, error: completionError } = await supabase
        .from('profile_challenge_progress')
        .update({
          status: 'completed',
          completed_at: completionTime,
          progress: progressPayload,
        })
        .eq('profile_id', input.profile.profileId)
        .eq('challenge_id', challenge.id)
        .select('*')
        .maybeSingle()

      if (completionError || !completedRow) {
        console.error('Unable to finalize challenge completion', completionError)
        continue
      }

      completed.push({
        id: completedRow.id,
        profileId: completedRow.profile_id,
        challengeId: completedRow.challenge_id,
        progress: completedRow.progress,
        status: completedRow.status,
        streakCount: completedRow.streak_count,
        startedAt: completedRow.started_at,
        completedAt: completedRow.completed_at,
      })
    }
  }

  return { completed }
}
