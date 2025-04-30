export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published'
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  accentColor?: string;
  status: PostStatus;
  views: number;
  createdAt: string;
  publishedAt?: string;
  author?: string;
}
