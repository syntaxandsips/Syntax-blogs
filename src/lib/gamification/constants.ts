export interface ActionDefinition {
  points: number;
  xp: number;
  cooldownSeconds?: number;
  metadataKeys?: string[];
}

export const ACTION_DEFINITIONS: Record<string, ActionDefinition> = {
  'comment.create': { points: 10, xp: 10, cooldownSeconds: 60 },
  'comment.approved': { points: 15, xp: 20, cooldownSeconds: 60 },
  'post.publish': { points: 100, xp: 120, cooldownSeconds: 3600 },
  'post.view.1000': { points: 40, xp: 50, cooldownSeconds: 86400 },
  'onboarding.complete': { points: 60, xp: 80, cooldownSeconds: 86400 },
  'newsletter.signup': { points: 20, xp: 25, cooldownSeconds: 3600 },
  'streak.maintained': { points: 30, xp: 35, cooldownSeconds: 86400 },
  'challenge.completed': { points: 80, xp: 90, cooldownSeconds: 3600 },
};

export const ROLE_ASSIGNMENT_RULES = [
  { type: 'level', level: 3, roleSlug: 'trusted-contributor' },
  { type: 'level', level: 5, roleSlug: 'syntax-sage' },
  { type: 'badge', badgeSlug: 'thirty-day-streak', roleSlug: 'community-mentor' },
] as const;

export const LEADERBOARD_CACHE_TTL_MS = 1000 * 60 * 15;
export const PROFILE_CACHE_TTL_MS = 1000 * 60 * 5;
