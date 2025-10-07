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
  status,
  views,
  created_at,
  published_at,
  scheduled_for,
  author_id,
  category_id,
  categories:categories(id, name, slug)
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
  status: string
  views: number | null
  created_at: string
  published_at: string | null
  scheduled_for: string | null
  author_id: string | null
  category_id: string | null
  categories: { id: string | null; name: string | null; slug: string | null } | null
}

const mapPostRecord = (record: PostRecord): AdminPost => ({
  id: record.id,
  title: record.title,
  slug: record.slug,
  excerpt: record.excerpt ?? null,
  content: record.content,
  accentColor: record.accent_color ?? null,
  status: record.status as PostStatus,
  views: record.views ?? 0,
  createdAt: record.created_at,
  publishedAt: record.published_at ?? null,
  scheduledFor: record.scheduled_for ?? null,
  authorId: record.author_id ?? null,
  categoryId: record.category_id ?? null,
  categoryName: record.categories?.name ?? null,
  categorySlug: record.categories?.slug ?? null,
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

export async function GET() {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
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
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
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
  const categoryId =
    typeof body.categoryId === 'string' && body.categoryId.trim().length > 0
      ? body.categoryId
      : null
  const requestedStatus = normalizeStatus(body.status as string | null | undefined)
  const authorId =
    typeof body.authorId === 'string' && body.authorId.trim().length > 0
      ? body.authorId
      : result.profile.id

  if (!title || !slug || !content) {
    return NextResponse.json(
      {
        error: 'Title, slug, and content are required.',
      },
      { status: 400 },
    )
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

  const serviceClient = createServiceRoleClient()
  const { data, error } = await serviceClient
    .from('posts')
    .insert({
      title,
      slug,
      content,
      excerpt,
      accent_color: accentColor,
      status: requestedStatus,
      published_at: publishedAt,
      scheduled_for: scheduledFor,
      category_id: categoryId,
      author_id: authorId,
    })
    .select(POST_SELECT)
    .single()

  if (error) {
    return NextResponse.json(
      { error: `Unable to create post: ${error.message}` },
      { status: 400 },
    )
  }

  const post = mapPostRecord(data as unknown as PostRecord)
  return NextResponse.json({ post }, { status: 201 })
}
