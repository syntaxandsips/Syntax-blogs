import { NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'

export const dynamic = 'force-dynamic'

interface CommentRecord {
  id: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  author: {
    id: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}

const mapComment = (record: CommentRecord) => ({
  id: record.id,
  content: record.content,
  status: record.status,
  createdAt: record.created_at,
  author: {
    id: record.author?.id ?? null,
    displayName: record.author?.display_name ?? record.author?.id ?? 'Anonymous',
    avatarUrl: record.author?.avatar_url ?? null,
  },
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const supabase = createServiceRoleClient()

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 })
  }

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('comments')
    .select(
      `id, content, status, created_at, author:author_profile_id (id, display_name, avatar_url)`,
    )
    .eq('post_id', post.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as unknown as CommentRecord[]
  const comments = rows.map((record) => mapComment(record))
  return NextResponse.json({ comments })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const payload = (await request.json().catch(() => ({}))) as { content?: string }
  const content = typeof payload.content === 'string' ? payload.content.trim() : ''

  if (content.length < 10) {
    return NextResponse.json(
      { error: 'Comments should be at least 10 characters long.' },
      { status: 422 },
    )
  }

  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in to comment.' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json(
      { error: 'A profile is required to leave comments.' },
      { status: 403 },
    )
  }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 })
  }

  if (!post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  const { error: insertError } = await supabase.from('comments').insert({
    post_id: post.id,
    author_profile_id: profile.id,
    content,
    status: 'pending',
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      message: 'Thanks for sharing! Your comment is pending review before it appears publicly.',
    },
    { status: 201 },
  )
}
