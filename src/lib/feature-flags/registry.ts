import type { Database } from '@/lib/supabase/types'

export const FEATURE_FLAG_KEYS = [
  'spaces_v1',
  'content_templates_v1',
  'search_unified_v1',
  'reputation_v1',
  'moderation_automation_v1',
  'donations_v1',
  'payouts_v1',
  'events_v1',
  'messaging_v1',
  'notifications_v1',
  'rbac_hardening_v1',
  'nav_ia_v1',
  'observability_v1',
] as const

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number]

export type FeatureFlagRow = Database['public']['Tables']['feature_flags']['Row']

export interface FeatureFlagDefinition {
  flagKey: FeatureFlagKey
  description: string
  enabled: boolean
  owner: string
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

const epoch = '1970-01-01T00:00:00.000Z'

export const FEATURE_FLAG_DEFAULTS: Record<FeatureFlagKey, FeatureFlagDefinition> = {
  spaces_v1: {
    flagKey: 'spaces_v1',
    description: 'Enables space creation, rules management, and membership flows.',
    enabled: false,
    owner: 'Product Lead',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  content_templates_v1: {
    flagKey: 'content_templates_v1',
    description: 'Activates template-aware editors for Articles, Discussions, Q&A, Events, and Workshops.',
    enabled: false,
    owner: 'Content PM',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  search_unified_v1: {
    flagKey: 'search_unified_v1',
    description: 'Turns on unified taxonomy, synonyms, and full-text search pipelines.',
    enabled: false,
    owner: 'Search PM',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  reputation_v1: {
    flagKey: 'reputation_v1',
    description: 'Enables reputation events, decay jobs, and privilege ladder enforcement.',
    enabled: false,
    owner: 'Community PM',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  moderation_automation_v1: {
    flagKey: 'moderation_automation_v1',
    description: 'Activates automod rules, sanctions workflows, and moderation dashboards.',
    enabled: false,
    owner: 'Safety Lead',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  donations_v1: {
    flagKey: 'donations_v1',
    description: 'Enables one-time donations and recurring pledges with fee governance.',
    enabled: false,
    owner: 'Commerce PM',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  payouts_v1: {
    flagKey: 'payouts_v1',
    description: 'Unlocks creator payout onboarding, KYC, and payout job queues.',
    enabled: false,
    owner: 'Finance Lead',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  events_v1: {
    flagKey: 'events_v1',
    description: 'Publishes events/workshops modules, ticketing, and reminder flows.',
    enabled: false,
    owner: 'Events PM',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  messaging_v1: {
    flagKey: 'messaging_v1',
    description: 'Enables threaded comments and direct messaging flows.',
    enabled: false,
    owner: 'Community PM',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  nav_ia_v1: {
    flagKey: 'nav_ia_v1',
    description: 'Activates refreshed navigation IA and associated design tokens.',
    enabled: false,
    owner: 'Design Lead',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  rbac_hardening_v1: {
    flagKey: 'rbac_hardening_v1',
    description: 'Locks down the expanded RBAC policies and exposes role governance tooling.',
    enabled: false,
    owner: 'Security Lead',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  notifications_v1: {
    flagKey: 'notifications_v1',
    description: 'Activates the notification center and outbound webhooks.',
    enabled: false,
    owner: 'Platform PM',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
  observability_v1: {
    flagKey: 'observability_v1',
    description: 'Surfaces observability baseline UI affordances and dashboards.',
    enabled: false,
    owner: 'SRE Lead',
    metadata: {},
    createdAt: epoch,
    updatedAt: epoch,
  },
}

export const isFeatureFlagKey = (value: string): value is FeatureFlagKey =>
  (FEATURE_FLAG_KEYS as readonly string[]).includes(value)
