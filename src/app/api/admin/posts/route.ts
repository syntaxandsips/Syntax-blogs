import { NextResponse } from 'next/server'
import { performance } from 'node:perf_hooks'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import { requireAdmin } from '@/lib/auth/require-admin'
import { writeAuditLog } from '@/lib/audit/log'
import {
  recordContentPublishLatency,
  recordHistogram,
} from '@/lib/observability/metrics'
import { logStructuredEvent } from '@/lib/observability/logger'
import { withSpan } from '@/lib/observability/tracing'
import { PostStatus, type AdminPost } from '@/utils/types'

const POST_SELECT = `
  id,
  title,
  slug,
  excerpt,
  content,
  accent_color,
  seo_title,
  seo_description,
  featured_image_url,
  social_image_url,
  status,
  views,
  created_at,
  published_at,
  scheduled_for,
  author_id,
  category_id,
  space_id,
  categories:categories(id, name, slug),
  post_tags:post_tags(tags(id, name, slug))
`

interface PostRecord {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  accent_color: string | null
  seo_title: string | null
  seo_description: string | null
  featured_image_url: string | null
  social_image_url: string | null
  status: string
  views: number | null
  created_at: string
  published_at: string | null
  scheduled_for: string | null
  author_id: string | null
  category_id: string | null
  space_id: string | null
  categories: { id: string | null; name: string | null; slug: string | null } | null
  post_tags: { tags: { id: string | null; name: string | null; slug: string | null } | null }[] | null
}

const mapPostRecord = (record: PostRecord): AdminPost => ({
  id: record.id,
  title: record.title,
  slug: record.slug,
  excerpt: record.excerpt ?? null,
  content: record.content,
  accentColor: record.accent_color ?? null,
  seoTitle: record.seo_title ?? null,
  seoDescription: record.seo_description ?? null,
  featuredImageUrl: record.featured_image_url ?? null,
  socialImageUrl: record.social_image_url ?? null,
  status: record.status as PostStatus,
  views: record.views ?? 0,
  createdAt: record.created_at,
  publishedAt: record.published_at ?? null,
  scheduledFor: record.scheduled_for ?? null,
  authorId: record.author_id ?? null,
  categoryId: record.category_id ?? null,
  categoryName: record.categories?.name ?? null,
  categorySlug: record.categories?.slug ?? null,
  spaceId: record.space_id ?? null,
  tags:
    (record.post_tags ?? [])
      .map((tag) => tag.tags)
      .filter(
        (tag): tag is { id: string | null; name: string | null; slug: string | null } =>
          Boolean(tag?.id),
      )
      .map((tag) => ({
        id: tag.id as string,
        name: tag.name ?? 'Untitled',
        slug: tag.slug ?? '',
      })),
})

const allowedStatuses = new Set<string>([
  PostStatus.DRAFT,
  PostStatus.SCHEDULED,
  PostStatus.PUBLISHED,
])

const normalizeStatus = (value: string | null | undefined): PostStatus => {
  if (!value) return PostStatus.DRAFT
  return allowedStatuses.has(value) ? (value as PostStatus) : PostStatus.DRAFT
}

export async function GET() {
  const guard = await requireAdmin({ resource: 'admin_posts', action: 'list' })
  if (!guard.ok) {
    return guard.response
  }

  const serviceClient = createServiceRoleClient()
  const { data, error } = await serviceClient
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: `Unable to load posts: ${error.message}` },
      { status: 500 },
    )
  }

  const posts = (data ?? []).map((record) =>
    mapPostRecord(record as unknown as PostRecord),
  )

  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  const guard = await requireAdmin({ resource: 'admin_posts', action: 'create' })
  if (!guard.ok) {
    return guard.response
  }

  const body = (await request.json()) as Record<string, unknown>

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const excerpt =
    typeof body.excerpt === 'string' && body.excerpt.trim().length > 0
      ? body.excerpt.trim()
      : null
  const accentColor =
    typeof body.accentColor === 'string' && body.accentColor.trim().length > 0
      ? body.accentColor.trim()
      : null
  const seoTitle =
    typeof body.seoTitle === 'string' && body.seoTitle.trim().length > 0
      ? body.seoTitle.trim()
      : null
  const seoDescription =
    typeof body.seoDescription === 'string' && body.seoDescription.trim().length > 0
      ? body.seoDescription.trim()
      : null
  const featuredImageUrl =
    typeof body.featuredImageUrl === 'string' && body.featuredImageUrl.trim().length > 0
      ? body.featuredImageUrl.trim()
      : null
  const socialImageUrl =
    typeof body.socialImageUrl === 'string' && body.socialImageUrl.trim().length > 0
      ? body.socialImageUrl.trim()
      : featuredImageUrl
  const categoryId =
    typeof body.categoryId === 'string' && body.categoryId.trim().length > 0
      ? body.categoryId
      : null
  const tagIds = Array.isArray(body.tagIds)
    ? (body.tagIds as unknown[])
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim())
    : []
  const spaceId =
    typeof body.spaceId === 'string' && body.spaceId.trim().length > 0
      ? body.spaceId.trim()
      : null
  const requestedStatus = normalizeStatus(body.status as string | null | undefined)
  const authorId =
    typeof body.authorId === 'string' && body.authorId.trim().length > 0
      ? body.authorId
      : guard.profile.id

  if (!title || !slug || !content) {
    return NextResponse.json(
      {
        error: 'Title, slug, and content are required.',
      },
      { status: 400 },
    )
  }

  const serviceClient = createServiceRoleClient()

  const duplicateSlugMessage =
    'A post with that slug already exists. Please choose a different slug.'

  const { count: existingSlugCount, error: existingSlugError } = await serviceClient
    .from('posts')
    .select('id', { head: true, count: 'exact' })
    .eq('slug', slug)

  if (existingSlugError) {
    return NextResponse.json(
      { error: `Unable to validate slug uniqueness: ${existingSlugError.message}` },
      { status: 400 },
    )
  }

  if ((existingSlugCount ?? 0) > 0) {
    return NextResponse.json({ error: duplicateSlugMessage }, { status: 409 })
  }

  let publishedAt: string | null = null
  let scheduledFor: string | null = null

  if (requestedStatus === PostStatus.PUBLISHED) {
    const providedPublishedAt =
      typeof body.publishedAt === 'string' && body.publishedAt.trim().length > 0
        ? body.publishedAt
        : null
    publishedAt = providedPublishedAt ?? new Date().toISOString()
    scheduledFor = null
  } else if (requestedStatus === PostStatus.SCHEDULED) {
    const providedSchedule =
      typeof body.scheduledFor === 'string' && body.scheduledFor.trim().length > 0
        ? body.scheduledFor
        : null
    if (!providedSchedule) {
      return NextResponse.json(
        { error: 'Scheduled posts require a valid scheduled date/time.' },
        { status: 400 },
      )
    }
    scheduledFor = providedSchedule
    publishedAt = null
  }

  const spanAttributes = {
    'post.slug': slug,
    'post.status': requestedStatus,
    'space.id': spaceId ?? 'global',
  }

  const publishStart = performance.now()

  let record: PostRecord
  try {
    record = await withSpan('admin.posts.create', spanAttributes, async () => {
      const { data, error } = await serviceClient
        .from('posts')
        .insert({
          title,
          slug,
          content,
          excerpt,
          accent_color: accentColor,
          seo_title: seoTitle,
          seo_description: seoDescription,
          featured_image_url: featuredImageUrl,
          social_image_url: socialImageUrl,
          status: requestedStatus,
          published_at: publishedAt,
          scheduled_for: scheduledFor,
          category_id: categoryId,
          author_id: authorId,
          space_id: spaceId,
        })
        .select(POST_SELECT)
        .single()

      if (error) {
        if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
          const conflictError = Object.assign(new Error(duplicateSlugMessage), { status: 409 })
          throw conflictError
        }

        throw Object.assign(new Error(`Unable to create post: ${error.message}`), { status: 400 })
      }

      const postRecord = data as unknown as PostRecord

      if (tagIds.length > 0) {
        const insertPayload = tagIds.map((tagId) => ({
          post_id: postRecord.id,
          tag_id: tagId,
        }))

        const { error: tagError } = await serviceClient.from('post_tags').insert(insertPayload)

        if (tagError) {
          throw Object.assign(
            new Error(`Post created but tags failed to save: ${tagError.message}`),
            { status: 400 },
          )
        }
      }

      return postRecord
    })
  } catch (unknownError) {
    const status =
      typeof (unknownError as { status?: number })?.status === 'number'
        ? ((unknownError as { status: number }).status ?? 500)
        : 500
    const message =
      unknownError instanceof Error && unknownError.message
        ? unknownError.message
        : 'Unable to create post.'

    return NextResponse.json({ error: message }, { status })
  }

  const post = mapPostRecord(record)

  if (requestedStatus === PostStatus.PUBLISHED) {
    const latency = performance.now() - publishStart
    recordContentPublishLatency(latency, {
      space: spaceId ?? 'global',
      status: requestedStatus,
    })
    recordHistogram('admin_publish_duration_ms', latency, {
      resource: 'admin_posts',
    })
  }

  logStructuredEvent({
    message: 'admin.post.created',
    userId: guard.profile.userId,
    spaceId,
    metadata: {
      post_id: post.id,
      slug,
      status: requestedStatus,
      tag_count: tagIds.length,
    },
  })

  await writeAuditLog({
    actorId: guard.profile.id,
    actorRole: guard.profile.roleSlug,
    resource: 'admin_posts',
    action: 'post_created',
    entityId: post.id,
    spaceId,
    metadata: {
      status: requestedStatus,
      slug,
      category_id: categoryId,
      tags: tagIds,
    },
  })

  return NextResponse.json({ post }, { status: 201 })
}
