import { NextResponse } from 'next/server'
import {
  createServerComponentClient,
  createServiceRoleClient,
} from '@/lib/supabase/server-client'
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
  categories:categories(id, name, slug),
  post_tags:post_tags(tags(id, name, slug))
`

interface ProfileRecord {
  id: string
  is_admin: boolean
}

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
  categories: { id: string | null; name: string | null; slug: string | null } | null
  post_tags: { tags: { id: string | null; name: string | null; slug: string | null } | null }[] | null
}

const allowedStatuses = new Set<string>([
  PostStatus.DRAFT,
  PostStatus.SCHEDULED,
  PostStatus.PUBLISHED,
])

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

const getAdminProfile = async (): Promise<
  | { profile: ProfileRecord }
  | { response: NextResponse }
> => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return {
      response: NextResponse.json(
        { error: `Unable to load profile: ${error.message}` },
        { status: 500 },
      ),
    }
  }

  if (!profile || !profile.is_admin) {
    return {
      response: NextResponse.json(
        { error: 'Forbidden: admin access required.' },
        { status: 403 },
      ),
    }
  }

  return { profile }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Post id is required.' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>

  const updates: Record<string, unknown> = {}

  if (typeof body.title === 'string') {
    updates.title = body.title.trim()
  }

  if (typeof body.slug === 'string') {
    updates.slug = body.slug.trim()
  }

  if (typeof body.excerpt === 'string') {
    updates.excerpt = body.excerpt.trim() || null
  }

  if (typeof body.content === 'string') {
    updates.content = body.content.trim()
  }

  if (typeof body.accentColor === 'string') {
    updates.accent_color = body.accentColor.trim() || null
  }

  if (typeof body.seoTitle === 'string') {
    updates.seo_title = body.seoTitle.trim() || null
  }

  if (typeof body.seoDescription === 'string') {
    updates.seo_description = body.seoDescription.trim() || null
  }

  if (typeof body.featuredImageUrl === 'string') {
    updates.featured_image_url = body.featuredImageUrl.trim() || null
  }

  if (typeof body.socialImageUrl === 'string') {
    updates.social_image_url = body.socialImageUrl.trim() || null
  }

  if (typeof body.categoryId === 'string') {
    updates.category_id = body.categoryId.trim() || null
  } else if (body.categoryId === null) {
    updates.category_id = null
  }

  if (typeof body.authorId === 'string') {
    updates.author_id = body.authorId.trim()
  }

  if (typeof body.status === 'string' && allowedStatuses.has(body.status)) {
    const status = body.status as PostStatus
    updates.status = status

    if (status === PostStatus.PUBLISHED) {
      const providedPublishedAt =
        typeof body.publishedAt === 'string' && body.publishedAt.trim().length > 0
          ? body.publishedAt
          : null
      updates.published_at = providedPublishedAt ?? new Date().toISOString()
      updates.scheduled_for = null
    } else if (status === PostStatus.SCHEDULED) {
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
      updates.scheduled_for = providedSchedule
      updates.published_at = null
    } else {
      updates.published_at = null
      updates.scheduled_for = null
    }
  }

  const serviceClient = createServiceRoleClient()

  const { error: existingError, data: existing } = await serviceClient
    .from('posts')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json(
      { error: `Unable to load post: ${existingError.message}` },
      { status: 500 },
    )
  }

  if (!existing) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided.' }, { status: 400 })
  }

  const { data, error } = await serviceClient
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select(POST_SELECT)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: `Unable to update post: ${error.message}` },
      { status: 400 },
    )
  }

  const tagIds = Array.isArray(body.tagIds)
    ? (body.tagIds as unknown[])
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim())
    : null

  if (tagIds !== null) {
    const { error: deleteError } = await serviceClient
      .from('post_tags')
      .delete()
      .eq('post_id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: `Unable to update tags: ${deleteError.message}` },
        { status: 400 },
      )
    }

    if (tagIds.length > 0) {
      const insertPayload = tagIds.map((tagId) => ({
        post_id: id,
        tag_id: tagId,
      }))

      const { error: insertError } = await serviceClient
        .from('post_tags')
        .insert(insertPayload)

      if (insertError) {
        return NextResponse.json(
          { error: `Unable to update tags: ${insertError.message}` },
          { status: 400 },
        )
      }
    }
  }

  const recordSource = data
    ? (data as unknown as PostRecord | null)
    : null

  if (!recordSource) {
    return NextResponse.json(
      { error: 'Unable to update post: Post not found.' },
      { status: 404 },
    )
  }

  if (tagIds !== null) {
    const { data: refreshed, error: refreshError } = await serviceClient
      .from('posts')
      .select(POST_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (refreshError) {
      return NextResponse.json(
        { error: `Post updated but failed to reload tags: ${refreshError.message}` },
        { status: 400 },
      )
    }

    if (!refreshed) {
      return NextResponse.json(
        { error: 'Unable to load updated post.' },
        { status: 404 },
      )
    }

    const refreshedRecord = refreshed as unknown as PostRecord
    return NextResponse.json({ post: mapPostRecord(refreshedRecord) })
  }

  const record = recordSource

  return NextResponse.json({ post: mapPostRecord(record) })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Post id is required.' }, { status: 400 })
  }

  const serviceClient = createServiceRoleClient()

  const { error } = await serviceClient.from('posts').delete().eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: `Unable to delete post: ${error.message}` },
      { status: 400 },
    )
  }

  return NextResponse.json({ success: true })
}
