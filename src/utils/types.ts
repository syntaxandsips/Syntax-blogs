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
