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

export interface AuthenticatedProfileSummary {
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
