import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export type GamificationConsentSettings = {
  optedIn: boolean;
  showcaseBadges: boolean;
  emailNotifications: boolean;
  betaTester: boolean;
};

export interface GamificationProfile {
  profileId: string;
  xpTotal: number;
  level: number;
  prestige: number;
  currentStreak: number;
  longestStreak: number;
  lastActionAt: string | null;
  settings: GamificationConsentSettings;
  createdAt: string;
  updatedAt: string;
}

export interface GamificationAction {
  id: string;
  profileId: string;
  actionType: string;
  points: number;
  xp: number;
  metadata: Record<string, unknown> | null;
  awardedAt: string;
}

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface GamificationBadge {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  rarity: BadgeRarity;
  requirements: BadgeRequirement;
  isTimeLimited: boolean;
  availableFrom: string | null;
  availableTo: string | null;
}

export type BadgeRequirement =
  | { type: 'total_actions'; actionType: string; threshold: number }
  | { type: 'level_reached'; level: number }
  | { type: 'streak'; days: number }
  | { type: 'event'; eventKey: string }
  | { type: 'challenge_completed'; challengeSlug: string };

export interface ProfileBadge {
  badge: GamificationBadge;
  awardedAt: string;
  evidence: Record<string, unknown> | null;
  progress: Record<string, unknown> | null;
}

export interface GamificationLevel {
  level: number;
  minXp: number;
  perks: Record<string, unknown> | null;
}

export type ChallengeCadence = 'daily' | 'weekly' | 'monthly' | 'seasonal';

export type ChallengeRequirement =
  | { type: 'total_actions'; actionType: string; threshold: number }
  | { type: 'streak'; days: number }
  | { type: 'level_reached'; level: number };

export interface GamificationChallenge {
  id: string;
  slug: string;
  title: string;
  cadence: ChallengeCadence;
  requirements: ChallengeRequirement;
  rewardPoints: number;
  rewardBadgeId: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface ProfileChallengeProgress {
  profileId: string;
  challengeId: string;
  status: 'active' | 'completed' | 'expired';
  progress: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
}

export interface LeaderboardEntry {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  xpTotal: number;
  rank: number;
  streak: number;
}

export interface LeaderboardSnapshot {
  id: string;
  scope: string;
  capturedAt: string;
  payload: LeaderboardEntry[];
  expiresAt: string;
}

export interface PointsEngineContext {
  supabase: SupabaseClient;
  profileId: string;
  actionType: string;
  metadata?: Record<string, unknown> | null;
}

export interface PointsAwardResult {
  action?: GamificationAction;
  profile?: GamificationProfile;
  levelUp?: boolean;
  newlyAwardedBadges?: GamificationBadge[];
  challengeUpdates?: ProfileChallengeProgress[];
}

export type GamificationApiResponse<T> = PostgrestSingleResponse<T> & {
  error?: { message: string };
};

export type RoleAssignmentRule =
  | { type: 'level'; level: number; roleSlug: string }
  | { type: 'badge'; badgeSlug: string; roleSlug: string };

export interface RoleAssignmentContext {
  supabase: SupabaseClient;
  profileId: string;
  profile: GamificationProfile;
  newlyAwardedBadges?: GamificationBadge[];
}

export interface LeaderboardFilters {
  scope?: 'global' | 'weekly' | 'monthly' | 'seasonal';
  limit?: number;
}

export interface CachedValue<T> {
  value: T;
  expiresAt: number;
}
