#!/usr/bin/env ts-node
import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

interface LegacyPost {
  id?: string
  title: string
  slug: string
  excerpt?: string
  content: string
  category?: string
  accentColor?: string
  status?: string
  views?: number
  createdAt?: string
  publishedAt?: string
  publishDate?: string
  author?: string
  tags?: string[]
  scheduledFor?: string
}

interface CategoryInput {
  slug: string
  name: string
}

const SUPPORTED_STATUSES = new Set(['draft', 'scheduled', 'published'])

function normaliseStatus(status?: string): 'draft' | 'scheduled' | 'published' {
  if (!status) return 'draft'
  const normalised = status.toLowerCase()
  if (SUPPORTED_STATUSES.has(normalised)) {
    return normalised as 'draft' | 'scheduled' | 'published'
  }
  throw new Error(`Unsupported status value: ${status}`)
}

function toISO(date?: string) {
  if (!date) return null
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${date}`)
  }
  return parsed.toISOString()
}

async function main() {
  const inputPath = process.argv[2]
  if (!inputPath) {
    console.error('Usage: ts-node scripts/migrate-posts.ts <path-to-export.json>')
    process.exit(1)
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL before running the migration script.')
  }

  if (!serviceKey) {
    throw new Error('Set SUPABASE_SERVICE_ROLE_KEY before running the migration script.')
  }

  const fileContents = await readFile(inputPath, 'utf8')
  const rawPosts: LegacyPost[] = JSON.parse(fileContents)

  const categories = new Map<string, CategoryInput>()

  for (const post of rawPosts) {
    if (post.category) {
      const slug = post.category.trim().toLowerCase().replace(/\s+/g, '-')
      categories.set(slug, {
        slug,
        name: post.category.trim(),
      })
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  if (categories.size > 0) {
    const { error: categoryError } = await supabase
      .from('categories')
      .upsert(Array.from(categories.values()), { onConflict: 'slug' })

    if (categoryError) {
      console.error('Failed to upsert categories:', categoryError)
      process.exit(1)
    }
  }

  const postsPayload = rawPosts.map((post) => {
    const status = normaliseStatus(post.status)
    const publishedAt = status === 'published' ? toISO(post.publishedAt || post.publishDate) : null
    const scheduledFor = status === 'scheduled' ? toISO(post.scheduledFor) : null
    const createdAt = toISO(post.createdAt) ?? new Date().toISOString()

    const categorySlug = post.category
      ? post.category.trim().toLowerCase().replace(/\s+/g, '-')
      : null

    return {
      id: post.id && post.id.length === 36 ? post.id : undefined,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? null,
      content: post.content,
      accent_color: post.accentColor ?? null,
      status,
      views: post.views ?? 0,
      created_at: createdAt,
      published_at: publishedAt,
      scheduled_for: scheduledFor,
      seo_title: post.title,
      seo_description: post.excerpt ?? null,
      categorySlug,
      tags: post.tags ?? [],
    }
  }) as Array<{
    id?: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    accent_color: string | null
    status: 'draft' | 'scheduled' | 'published'
    views: number
    created_at: string
    published_at: string | null
    scheduled_for: string | null
    seo_title: string | null
    seo_description: string | null
    categorySlug: string | null
    tags: string[]
  }>

  for (const { tags, categorySlug, ...rest } of postsPayload) {

    let categoryId: string | null = null
    if (categorySlug) {
      const { data: categoryData, error: categoryLookupError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (categoryLookupError) {
        console.error(`Failed to look up category for slug ${categorySlug}:`, categoryLookupError)
        process.exit(1)
      }

      categoryId = categoryData?.id ?? null
    }

    const { data: insertedPost, error: postError } = await supabase
      .from('posts')
      .upsert({
        ...rest,
        category_id: categoryId,
      }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (postError) {
      console.error(`Failed to upsert post ${rest.slug}:`, postError)
      process.exit(1)
    }

    if (tags && tags.length > 0 && insertedPost?.id) {
      const normalisedTags = tags.map((tag: string) => ({
        slug: tag.trim().toLowerCase().replace(/\s+/g, '-'),
        name: tag.trim(),
      }))

      const { data: tagRows, error: tagError } = await supabase
        .from('tags')
        .upsert(normalisedTags, { onConflict: 'slug' })
        .select('id, slug')

      if (tagError) {
        console.error(`Failed to upsert tags for post ${rest.slug}:`, tagError)
        process.exit(1)
      }

      const tagLookup = new Map(tagRows?.map((row) => [row.slug, row.id]))

      const postTags = normalisedTags
        .map((tag) => tagLookup.get(tag.slug))
        .filter((id): id is string => Boolean(id))
        .map((tagId) => ({ post_id: insertedPost.id, tag_id: tagId }))

      if (postTags.length > 0) {
        const { error: postTagError } = await supabase
          .from('post_tags')
          .upsert(postTags, { onConflict: 'post_id,tag_id' })

        if (postTagError) {
          console.error(`Failed to link tags for post ${rest.slug}:`, postTagError)
          process.exit(1)
        }
      }
    }
  }

  console.log(`Successfully migrated ${postsPayload.length} posts.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
