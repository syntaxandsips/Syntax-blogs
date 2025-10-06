import { cache } from 'react'
import { createServiceRoleClient } from '@/lib/supabase/server-client'

interface CategoryRecord {
  id: string | null
  name: string | null
  slug: string | null
}

interface AuthorRecord {
  id: string | null
  display_name: string | null
  avatar_url: string | null
}

interface TagRecord {
  tags: { id: string | null; name: string | null; slug: string | null } | null
}

interface PostListRecord {
  id: string
  title: string
  slug: string
  excerpt: string | null
  accent_color: string | null
  views: number | null
  published_at: string | null
  categories: CategoryRecord | null
}

interface PostDetailRecord extends PostListRecord {
  content: string
  seo_title: string | null
  seo_description: string | null
  authors: AuthorRecord | null
  post_tags: TagRecord[] | null
}

export interface BlogListPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  category: {
    id: string | null
    name: string | null
    slug: string | null
  }
  accentColor: string | null
  publishedAt: string | null
  views: number
}

export interface BlogPostDetail extends BlogListPost {
  content: string
  author: {
    id: string | null
    displayName: string | null
    avatarUrl: string | null
  }
  tags: string[]
  seoTitle: string | null
  seoDescription: string | null
}

const mapListPost = (record: PostListRecord): BlogListPost => ({
  id: record.id,
  slug: record.slug,
  title: record.title,
  excerpt: record.excerpt ?? null,
  category: {
    id: record.categories?.id ?? null,
    name: record.categories?.name ?? null,
    slug: record.categories?.slug ?? null,
  },
  accentColor: record.accent_color ?? null,
  publishedAt: record.published_at ?? null,
  views: record.views ?? 0,
})

const mapDetailPost = (record: PostDetailRecord): BlogPostDetail => ({
  ...mapListPost(record),
  content: record.content,
  author: {
    id: record.authors?.id ?? null,
    displayName: record.authors?.display_name ?? null,
    avatarUrl: record.authors?.avatar_url ?? null,
  },
  tags:
    (record.post_tags ?? [])
      .map((entry) => entry.tags?.name ?? null)
      .filter((tag: string | null): tag is string => Boolean(tag)),
  seoTitle: record.seo_title ?? null,
  seoDescription: record.seo_description ?? null,
})

export const getPublishedPosts = cache(async () => {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('posts')
    .select(
      `id, title, slug, excerpt, accent_color, views, published_at, categories:categories(id, name, slug)`,
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    throw new Error(`Unable to load published posts: ${error.message}`)
  }

  const rows = (data ?? []) as PostListRecord[]
  return rows.map(mapListPost)
})

export const getPublishedPostBySlug = cache(async (slug: string) => {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        content,
        accent_color,
        views,
        published_at,
        seo_title,
        seo_description,
        categories:categories(id, name, slug),
        authors:authors(id, display_name, avatar_url),
        post_tags:post_tags(tags(id, name, slug))
      `,
    )
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load post ${slug}: ${error.message}`)
  }

  return data ? mapDetailPost(data as PostDetailRecord) : null
})

export const getPublishedSlugs = cache(async () => {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published')

  if (error) {
    throw new Error(`Unable to load slugs: ${error.message}`)
  }

  return (data ?? []).map((row) => row.slug)
})
