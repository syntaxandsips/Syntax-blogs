import type { Database } from '@/lib/supabase/types'

type Json = Database['public']['Tables']['gamification_profiles']['Row']['settings']

type Maybe<T> = T | null

export type GamificationActionType =
  | 'post.published'
  | 'post.updated'
  | 'comment.approved'
  | 'comment.submitted'
  | 'comment.received_upvote'
  | 'onboarding.completed'
  | 'account.login_streak'
  | 'challenge.completed'
  | 'badge.awarded'
  | 'custom.manual_adjustment'

export interface ActionDefinition {
  type: GamificationActionType
  baseXp: number
  basePoints: number
  description: string
  cooldownMs?: number
  maxDailyOccurrences?: number
  metadataKeys?: string[]
}

export interface GamificationProfileSummary {
  profileId: string
  xpTotal: number
  level: number
  prestigeLevel: number
  currentStreak: number
  longestStreak: number
  nextLevelXp: number
  progressPercentage: number
  optedIn: boolean
  lastActionAt: Maybe<string>
  streakFrozenUntil: Maybe<string>
  settings: Json
}

export interface LeaderboardEntry {
  profileId: string
  displayName: string
  avatarUrl: Maybe<string>
  level: number
  xp: number
  rank: number
  badges: string[]
  streak: number
}

export interface BadgeDefinition {
  id: string
  slug: string
  name: string
  description: Maybe<string>
  category: string
  rarity: string
  icon: Maybe<string>
  theme: Maybe<string>
  requirements: Json
  rewardPoints: number
  availableFrom: Maybe<string>
  availableTo: Maybe<string>
}

export interface OwnedBadge extends BadgeDefinition {
  awardedAt: string
  state: 'awarded' | 'revoked' | 'suspended'
  notifiedAt: Maybe<string>
}

export interface ChallengeDefinition {
  id: string
  slug: string
  title: string
  description: Maybe<string>
  cadence: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'event'
  rewardPoints: number
  rewardBadgeId: Maybe<string>
  startsAt: Maybe<string>
  endsAt: Maybe<string>
  requirements: Json
}

export interface ChallengeProgress {
  id: string
  challengeId: string
  profileId: string
  progress: Json
  status: 'active' | 'completed' | 'expired' | 'abandoned'
  streakCount: number
  startedAt: string
  completedAt: Maybe<string>
}

export interface GamificationAnalyticsSnapshot {
  totalProfiles: number
  totalXpAwarded: number
  averageLevel: number
  streakLeaders: LeaderboardEntry[]
  badgeCounts: Array<{ badgeSlug: string; total: number }>
  activeChallenges: ChallengeDefinition[]
}

export interface RecordActionInput {
  profileId: string
  actionType: GamificationActionType
  metadata?: Record<string, unknown>
  actionSource?: string
  requestId?: string
}

export interface RecordActionResult {
  applied: boolean
  xpAwarded: number
  pointsAwarded: number
  profile: GamificationProfileSummary
  newlyEarnedBadges: OwnedBadge[]
  completedChallenges: ChallengeProgress[]
}

export interface BadgeEvaluationContext {
  profile: GamificationProfileSummary
  action: RecordActionInput
  metadata: Record<string, unknown>
}

export interface LeaderboardFilters {
  scope: 'global' | 'seasonal' | 'category'
  category?: string
  limit?: number
  cursor?: string
}

export interface ConsentToggleInput {
  profileId: string
  optedIn: boolean
}

export type SupabaseClient = ReturnType<typeof import('@supabase/supabase-js')['createClient']<
  Database,
  'public',
  any
>>
