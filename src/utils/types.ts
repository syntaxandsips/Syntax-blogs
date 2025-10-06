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
