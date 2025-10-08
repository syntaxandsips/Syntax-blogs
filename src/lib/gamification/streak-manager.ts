import type { GamificationProfile } from './types';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  maintained: boolean;
}

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
const STREAK_TOLERANCE_MS = MILLISECONDS_IN_DAY * 1.5;

export const updateStreak = (profile: GamificationProfile, actionIsoDate: string): StreakState => {
  if (!profile.lastActionAt) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, profile.longestStreak),
      maintained: true,
    };
  }

  const previous = Date.parse(profile.lastActionAt);
  const current = Date.parse(actionIsoDate);

  if (Number.isNaN(previous) || Number.isNaN(current)) {
    return {
      currentStreak: profile.currentStreak || 1,
      longestStreak: Math.max(profile.longestStreak, profile.currentStreak || 1),
      maintained: false,
    };
  }

  const delta = current - previous;

  if (delta <= STREAK_TOLERANCE_MS) {
    const nextStreak = Math.max(1, profile.currentStreak + 1);
    return {
      currentStreak: nextStreak,
      longestStreak: Math.max(profile.longestStreak, nextStreak),
      maintained: true,
    };
  }

  return {
    currentStreak: 1,
    longestStreak: Math.max(profile.longestStreak, profile.currentStreak, 1),
    maintained: false,
  };
};
