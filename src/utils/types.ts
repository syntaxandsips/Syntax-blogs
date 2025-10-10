import type { FeatureFlagKey } from '@/lib/feature-flags/registry'

export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
}

export interface CategoryOption {
  id: string
  name: string
  slug: string
}

export interface TagOption {
  id: string
  name: string
  slug: string
}

export interface AdminModelCategory {
  id: string
  name: string
  slug: string
  description: string | null
  accentColor: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateModelCategoryPayload {
  name: string
  slug: string
  description?: string | null
  accentColor?: string | null
}

export type UpdateModelCategoryPayload = Partial<CreateModelCategoryPayload>

export interface AdminModelSummary {
  id: string
  name: string
  displayName: string
  categoryId: string | null
  categoryName: string | null
  categorySlug: string | null
  family: string | null
  provider: string | null
  version: string | null
  description: string | null
  iconUrl: string | null
  parametersSchema: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAdminModelPayload {
  name: string
  displayName: string
  categoryId?: string | null
  family?: string | null
  provider?: string | null
  version?: string | null
  description?: string | null
  iconUrl?: string | null
  parametersSchema?: Record<string, unknown> | null
  isActive?: boolean
}

export interface UpdateAdminModelPayload extends Partial<CreateAdminModelPayload> {
  isActive?: boolean
}

export interface AdminPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  categoryId: string | null
  categoryName: string | null
  categorySlug: string | null
  accentColor: string | null
  seoTitle: string | null
  seoDescription: string | null
  featuredImageUrl: string | null
  socialImageUrl: string | null
  tags: TagOption[]
  status: PostStatus
  views: number
  createdAt: string
  publishedAt: string | null
  scheduledFor: string | null
  authorId: string | null
}

export interface PostFormValues {
  id?: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  categoryId: string | null
  accentColor: string | null
  seoTitle: string | null
  seoDescription: string | null
  featuredImageUrl: string | null
  socialImageUrl: string | null
  tagIds: string[]
  status: PostStatus
  publishedAt: string | null
  scheduledFor: string | null
  authorId?: string | null
}

export interface AdminRole {
  id: string
  slug: string
  name: string
  description: string | null
  priority: number
}

export interface AdminUserRole {
  id: string
  slug: string
  name: string
  description: string | null
  priority: number
}

export type OnboardingStatus = 'pending' | 'in_progress' | 'completed'

export type OnboardingPersona =
  | 'learning-explorer'
  | 'hands-on-builder'
  | 'community-connector'
  | 'career-switcher'
  | 'team-enabler'

export type OnboardingExperienceLevel =
  | 'early-career'
  | 'mid-level'
  | 'senior-practitioner'
  | 'strategic-leader'

export type OnboardingGoal =
  | 'publish-signature-series'
  | 'grow-technical-voice'
  | 'level-up-ai-skills'
  | 'ship-side-projects'
  | 'find-peers'
  | 'transition-role'

export type OnboardingContribution =
  | 'write-articles'
  | 'host-events'
  | 'share-code-snippets'
  | 'produce-videos'
  | 'mentor-community'

export type OnboardingLearningFormat =
  | 'deep-dives'
  | 'quick-tips'
  | 'live-builds'
  | 'case-studies'
  | 'audio-notes'

export type OnboardingSupportPreference =
  | 'editorial-reviews'
  | 'pair-programming'
  | 'career-coaching'
  | 'community-challenges'
  | 'office-hours'

export type OnboardingAccountability =
  | 'progress-updates'
  | 'quiet-focus'
  | 'public-goals'
  | 'one-on-one'

export type OnboardingCommunication =
  | 'weekly-digest'
  | 'event-reminders'
  | 'opportunity-alerts'
  | 'product-updates'

export interface ProfileOnboardingResponses {
  persona: OnboardingPersona | null
  experienceLevel: OnboardingExperienceLevel | null
  motivations: OnboardingGoal[]
  focusAreas: OnboardingContribution[]
  preferredLearningFormats: OnboardingLearningFormat[]
  supportPreferences: OnboardingSupportPreference[]
  accountabilityStyle: OnboardingAccountability | null
  communicationPreferences: OnboardingCommunication[]
}

export interface ProfileOnboardingJourney {
  status: OnboardingStatus
  currentStep: string | null
  completedAt: string | null
  updatedAt?: string | null
  version: string | null
  responses: ProfileOnboardingResponses | null
}

export interface AdminUserSummary {
  profileId: string
  userId: string
  email: string
  displayName: string
  isAdmin: boolean
  createdAt: string
  primaryRoleId: string | null
  roles: AdminUserRole[]
}

export interface CreateAdminUserPayload {
  email: string
  password: string
  displayName: string
  isAdmin: boolean
  roleSlugs: string[]
}

export interface UpdateAdminUserPayload {
  displayName: string
  isAdmin: boolean
  roleSlugs: string[]
  newPassword?: string | null
}

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface AdminCommentSummary {
  id: string
  content: string
  status: CommentStatus
  createdAt: string
  postId: string
  postTitle: string
  postSlug: string
  authorDisplayName: string | null
  authorProfileId: string | null
}

export interface AdminFeatureFlagRecord {
  id: string | null
  flagKey: FeatureFlagKey
  description: string
  owner: string
  enabled: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  persisted: boolean
}

export interface AdminFeatureFlagAuditEntry {
  id: string
  flagKey: FeatureFlagKey
  previousEnabled: boolean | null
  newEnabled: boolean | null
  changedBy: string | null
  changedByRole: string
  reason: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AuthenticatedProfileSummary {
  profileId: string
  userId: string
  email: string
  displayName: string
  avatarUrl: string | null
  isAdmin: boolean
  createdAt: string
  lastSignInAt: string | null
  emailConfirmedAt: string | null
  primaryRoleId: string | null
  roles: AdminUserRole[]
  onboarding: ProfileOnboardingJourney | null
}

export interface UserPostSummary {
  id: string
  title: string
  slug: string | null
  status: PostStatus
  views: number
  createdAt: string
  publishedAt: string | null
}

export interface UserCommentSummary {
  id: string
  content: string
  status: CommentStatus
  createdAt: string
  postTitle: string | null
  postSlug: string | null
}

export interface UserContributionTotals {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  scheduledPosts: number
  totalViews: number
  totalComments: number
  approvedComments: number
  pendingComments: number
  rejectedComments: number
}

export interface UserContributionSnapshot {
  posts: UserPostSummary[]
  comments: UserCommentSummary[]
  totals: UserContributionTotals
}

export interface UserList {
  id: string
  profileId: string
  title: string
  description: string | null
  slug: string
  isPublic: boolean
  coverImageUrl: string | null
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface ListItem {
  id: string
  listId: string
  postId: string
  postTitle: string
  postSlug: string
  postExcerpt: string | null
  postCoverImage: string | null
  note: string | null
  position: number
  addedAt: string
}

export interface SavedList {
  id: string
  profileId: string
  listId: string
  listTitle: string
  listDescription: string | null
  listOwnerName: string
  listItemCount: number
  savedAt: string
}

export interface Highlight {
  id: string
  profileId: string
  postId: string
  postTitle: string
  postSlug: string
  highlightedText: string
  note: string | null
  color: string
  positionStart: number
  positionEnd: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface ReadingHistoryEntry {
  id: string
  profileId: string
  postId: string
  postTitle: string
  postSlug: string
  postExcerpt: string | null
  postCoverImage: string | null
  readAt: string
  readDurationSeconds: number | null
  scrollPercentage: number | null
  completed: boolean
  lastPosition: number
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: string
  profileId: string
  postId: string
  postTitle: string
  postSlug: string
  postExcerpt: string | null
  postCoverImage: string | null
  createdAt: string
}

export interface LibraryStats {
  totalBookmarks: number
  totalLists: number
  totalListItems: number
  totalHighlights: number
  totalReadingHistory: number
  readingStreak: number
  totalReadingTime: number
}
