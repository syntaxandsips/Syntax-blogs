import { NextResponse } from 'next/server'
import {
  createServerComponentClient,
  createServiceRoleClient,
} from '@/lib/supabase/server-client'
import { CommentStatus, type AdminCommentSummary } from '@/utils/types'

const COMMENT_SELECT = `
  id,
  content,
  status,
  created_at,
  post_id,
  posts:post_id (id, title, slug),
  author:author_profile_id (id, display_name)
`

interface ProfileRecord {
  id: string
  is_admin: boolean
}

interface CommentRecord {
  id: string
  content: string
  status: string
  created_at: string
  post_id: string
  posts: { id: string | null; title: string | null; slug: string | null } | null
  author: { id: string | null; display_name: string | null } | null
}

const allowedStatuses = new Set<string>([
  CommentStatus.PENDING,
  CommentStatus.APPROVED,
  CommentStatus.REJECTED,
])

const mapComment = (record: CommentRecord): AdminCommentSummary => ({
  id: record.id,
  content: record.content,
  status: (allowedStatuses.has(record.status) ? record.status : CommentStatus.PENDING) as CommentStatus,
  createdAt: record.created_at,
  postId: record.post_id,
  postTitle: record.posts?.title ?? 'Untitled post',
  postSlug: record.posts?.slug ?? '#',
  authorDisplayName: record.author?.display_name ?? null,
  authorProfileId: record.author?.id ?? null,
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

export async function GET(request: Request) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const serviceClient = createServiceRoleClient()
  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  const limitParam = searchParams.get('limit')
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : NaN
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(250, Math.max(1, parsedLimit))
    : 250

  const query = serviceClient
    .from('comments')
    .select(COMMENT_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (statusFilter && allowedStatuses.has(statusFilter)) {
    query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: `Unable to load comments: ${error.message}` },
      { status: 500 },
    )
  }

  const comments = (data ?? []).map((record) =>
    mapComment(record as unknown as CommentRecord),
  )

  return NextResponse.json({ comments })
}
