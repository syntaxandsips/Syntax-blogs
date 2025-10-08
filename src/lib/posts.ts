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
  author_id: string | null
  featured_image_url: string | null
  social_image_url: string | null
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
  featuredImageUrl: string | null
  socialImageUrl: string | null
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

const OPTIONAL_IMAGE_COLUMNS = ['featured_image_url', 'social_image_url'] as const

const isMissingOptionalImageColumnsError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return false
  }

  const readString = (value: unknown) => (typeof value === 'string' ? value : '')

  const fallback = (() => {
    try {
      return String(error)
    } catch {
      return ''
    }
  })()

  const fields = [
    readString('message' in error ? (error as { message?: unknown }).message : ''),
    readString('details' in error ? (error as { details?: unknown }).details : ''),
    readString('hint' in error ? (error as { hint?: unknown }).hint : ''),
    fallback,
  ]

  const combined = fields.filter(Boolean).join(' ')

  if (OPTIONAL_IMAGE_COLUMNS.some((column) => combined.includes(column))) {
    return true
  }

  const code = 'code' in error ? (error as { code?: unknown }).code : undefined

  if (code === '42703') {
    return OPTIONAL_IMAGE_COLUMNS.some((column) =>
      combined.includes(column) || combined.includes(`posts.${column}`) || combined.includes(`"${column}"`),
    )
  }

  return false
}

const ensureOptionalImageColumns = (record: unknown): PostDetailRecord => {
  const typedRecord = record as PostDetailRecord & {
    post_tags?: ({
      tags?: TagRecord['tags'] | TagRecord['tags'][] | null
    } | null)[] | null
  }

  const normalizeTags = (raw: typeof typedRecord.post_tags): TagRecord[] | null => {
    if (!raw) {
      return null
    }

    if (!Array.isArray(raw)) {
      return null
    }

    return raw.map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return { tags: null }
      }

      const rawTags = (entry as { tags?: unknown }).tags

      if (Array.isArray(rawTags)) {
        const [first] = rawTags

        if (!first || typeof first !== 'object') {
          return { tags: null }
        }

        return { tags: first as TagRecord['tags'] }
      }

      if (!rawTags || typeof rawTags !== 'object') {
        return { tags: null }
      }

      return { tags: rawTags as TagRecord['tags'] }
    })
  }

  return {
    ...typedRecord,
    featured_image_url: typedRecord?.featured_image_url ?? null,
    social_image_url: typedRecord?.social_image_url ?? null,
    post_tags: normalizeTags(typedRecord.post_tags),
  }
}

const mapDetailPost = (record: PostDetailRecord, author: AuthorRecord | null): BlogPostDetail => ({
  ...mapListPost(record),
  content: record.content,
  author: {
    id: author?.id ?? record.author_id ?? null,
    displayName: author?.display_name ?? null,
    avatarUrl: author?.avatar_url ?? null,
  },
  tags:
    (record.post_tags ?? [])
      .map((entry) => entry.tags?.name ?? null)
      .filter((tag: string | null): tag is string => Boolean(tag)),
  seoTitle: record.seo_title ?? null,
  seoDescription: record.seo_description ?? null,
  featuredImageUrl: record.featured_image_url ?? null,
  socialImageUrl: record.social_image_url ?? null,
})

/**
 * Retrieve all posts that have been published.
 *
 * The result is cached via `react`'s `cache` helper to prevent duplicate Supabase roundtrips
 * during the same request lifecycle.
 *
 * @returns {Promise<BlogListPost[]>} Array of normalized blog posts ordered by `published_at` descending.
 */
export const getPublishedPosts = cache(async () => {
  const supabase = createServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `id, title, slug, excerpt, accent_color, views, published_at, categories:categories(id, name, slug)`,
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      throw error
    }

    const rows = (data ?? []) as unknown as PostListRecord[]
    return rows.map(mapListPost)
  } catch (error) {
    console.error('Unable to load published posts:', error)
    return []
  }
})

/**
 * Fetch the most viewed published posts.
 *
 * @param {number} [limit=6] Upper bound of results to return (values outside 1-12 are coerced).
 * @returns {Promise<BlogListPost[]>} Ranked list of posts ordered by view count.
 */
export const getTrendingPosts = async (limit = 6) => {
  const supabase = createServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `id, title, slug, excerpt, accent_color, views, published_at, categories:categories(id, name, slug)`,
      )
      .eq('status', 'published')
      .order('views', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      throw error
    }

    const rows = (data ?? []) as unknown as PostListRecord[]
    return rows.map(mapListPost)
  } catch (error) {
    console.error('Unable to load trending posts:', error)
    return []
  }
}

/**
 * Load a single published post by slug, including author, SEO metadata, and tag information.
 *
 * @param {string} slug URL slug associated with the post.
 * @returns {Promise<BlogPostDetail | null>} Detailed post payload or `null` when not found.
 * @throws {Error} When Supabase returns an unexpected error that is not related to optional columns.
 */
export const getPublishedPostBySlug = cache(async (slug: string) => {
  const supabase = createServiceRoleClient()

  const detailSelect = `
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
        featured_image_url,
        social_image_url,
        author_id,
        categories:categories(id, name, slug),
        post_tags:post_tags(tags(id, name, slug))
      `

  const legacyDetailSelect = `
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
        author_id,
        categories:categories(id, name, slug),
        post_tags:post_tags(tags(id, name, slug))
      `

  let record: PostDetailRecord | null = null

  const { data, error } = await supabase
    .from('posts')
    .select(
      detailSelect,
    )
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    if (isMissingOptionalImageColumnsError(error)) {
      const { data: legacyData, error: legacyError } = await supabase
        .from('posts')
        .select(legacyDetailSelect)
        .eq('status', 'published')
        .eq('slug', slug)
        .maybeSingle()

      if (legacyError) {
        throw new Error(`Unable to load post ${slug}: ${legacyError.message}`)
      }

      if (!legacyData) {
        return null
      }

      record = ensureOptionalImageColumns(legacyData)
    } else {
      throw new Error(`Unable to load post ${slug}: ${error.message}`)
    }
  }

  if (!record) {
    if (!data) {
      return null
    }

    record = ensureOptionalImageColumns(data)
  }

  let author: AuthorRecord | null = null

  if (record.author_id) {
    const { data: authorData, error: authorError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', record.author_id)
      .maybeSingle()

    if (authorError) {
      throw new Error(`Unable to load author for post ${slug}: ${authorError.message}`)
    }

    author = (authorData as AuthorRecord | null) ?? null
  }

  return mapDetailPost(record, author)
})

/**
 * Perform a case-insensitive search across published posts using Supabase `ilike` filters.
 *
 * @param {string} query Raw search query supplied by the caller.
 * @param {number} [limit=12] Maximum number of matches to return.
 * @returns {Promise<BlogListPost[]>} Posts whose title, excerpt, or content matches the query.
 */
export const searchPublishedPosts = async (query: string, limit = 12) => {
  const supabase = createServiceRoleClient()

  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return []
  }

  try {
    const ilikeQuery = `%${normalizedQuery.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`

    const { data, error } = await supabase
      .from('posts')
      .select(
        `id, title, slug, excerpt, accent_color, views, published_at, categories:categories(id, name, slug)`,
      )
      .eq('status', 'published')
      .or(
        [
          `title.ilike.${ilikeQuery}`,
          `excerpt.ilike.${ilikeQuery}`,
          `content.ilike.${ilikeQuery}`,
        ].join(','),
      )
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    const rows = (data ?? []) as unknown as PostListRecord[]
    return rows.map(mapListPost)
  } catch (error) {
    console.error('Unable to search posts:', error)
    return []
  }
}

/**
 * Derive a set of related posts based on shared tags and optional category alignment.
 *
 * @param {string} postId Identifier for the post to exclude from the result set.
 * @param {string | null} categorySlug Category slug used for secondary relevance scoring.
 * @param {string[]} tagNames List of tag names associated with the source post.
 * @param {number} [limit=3] Desired number of related posts; falls back to recency when insufficient matches exist.
 * @returns {Promise<BlogListPost[]>} Ranked list of related posts.
 */
export const getRelatedPosts = async (postId: string, categorySlug: string | null, tagNames: string[], limit = 3) => {
  const supabase = createServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `id, title, slug, excerpt, accent_color, views, published_at, categories:categories(id, name, slug), post_tags:post_tags(tags(name, slug))`,
      )
      .eq('status', 'published')
      .neq('id', postId)
      .order('published_at', { ascending: false })
      .limit(30)

    if (error) {
      throw error
    }

    const rows = (data ?? []) as unknown as (PostListRecord & { post_tags?: TagRecord[] | null })[]
    const normalizedTags = tagNames.map((tag) => tag.toLowerCase())

    const related = rows
      .map((row) => {
        const tags = (row.post_tags ?? [])
          .map((entry) => entry.tags?.name ?? null)
          .filter((value): value is string => Boolean(value))

        const sharedTags = tags.filter((tag) => normalizedTags.includes(tag.toLowerCase()))
        const sameCategory = categorySlug && row.categories?.slug === categorySlug

        const relevanceScore = sharedTags.length * 2 + (sameCategory ? 1 : 0)

        return {
          post: mapListPost(row),
          relevanceScore,
        }
      })
      .filter((entry) => entry.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore || (new Date(b.post.publishedAt ?? 0).getTime() - new Date(a.post.publishedAt ?? 0).getTime()))
      .slice(0, limit)
      .map((entry) => entry.post)

    if (related.length < limit) {
      const fallback = rows
        .map(mapListPost)
        .filter((candidate) => !related.some((existing) => existing.id === candidate.id))
        .filter((candidate) => (categorySlug ? candidate.category.slug === categorySlug : true))
        .slice(0, limit - related.length)

      return [...related, ...fallback]
    }

    return related
  } catch (error) {
    console.error('Unable to load related posts:', error)
    return []
  }
}

/**
 * Fetch all slugs for published posts.
 *
 * @returns {Promise<string[]>} Array of slugs suitable for static generation.
 */
export const getPublishedSlugs = cache(async () => {
  const supabase = createServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published')

    if (error) {
      throw error
    }

    return (data ?? []).map((row) => row.slug)
  } catch (error) {
    console.error('Unable to load slugs:', error)
    return []
  }
})
