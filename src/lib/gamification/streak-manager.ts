import type { Database } from '@/lib/supabase/types'

interface StreakResult {
  currentStreak: number
  streakFrozenUntil: string | null
}

const STREAK_GRACE_PERIOD_HOURS = 36

const parseDate = (value: string | null) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const applyStreakProgress = (
  profile: Database['public']['Tables']['gamification_profiles']['Row'],
  nowIso: string,
): StreakResult => {
  const now = parseDate(nowIso) ?? new Date()
  const lastAction = parseDate(profile.last_action_at)
  const frozenUntil = parseDate(profile.streak_frozen_until)

  if (frozenUntil && frozenUntil > now) {
    return {
      currentStreak: profile.current_streak ?? 0,
      streakFrozenUntil: profile.streak_frozen_until,
    }
  }

  if (!lastAction) {
    return {
      currentStreak: 1,
      streakFrozenUntil: null,
    }
  }

  const diffHours = Math.abs(now.getTime() - lastAction.getTime()) / (1000 * 60 * 60)

  if (diffHours <= STREAK_GRACE_PERIOD_HOURS) {
    return {
      currentStreak: Number(profile.current_streak ?? 0) + 1,
      streakFrozenUntil: null,
    }
  }

  return {
    currentStreak: 1,
    streakFrozenUntil: null,
  }
}

export const applyStreakFreeze = (
  profileId: string,
  supabase: import('./types').SupabaseClient,
  hours: number,
) => {
  const freezeUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
  return supabase
    .from('gamification_profiles')
    .update({ streak_frozen_until: freezeUntil })
    .eq('profile_id', profileId)
}
