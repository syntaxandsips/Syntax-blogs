import { NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { content } = (await request.json().catch(() => ({}))) as { content?: string }
  const trimmedContent = content?.trim() ?? ''

  if (trimmedContent.length < 10) {
    return NextResponse.json({ error: 'Comments should be at least 10 characters long.' }, { status: 422 })
  }

  const authClient = createServerComponentClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'You need to sign in to comment.' }, { status: 401 })
  }

  const serviceClient = createServiceRoleClient()

  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found for user.' }, { status: 404 })
  }

  const { data: prompt, error: promptError } = await serviceClient
    .from('prompts')
    .select('id, moderation_status')
    .eq('slug', slug)
    .maybeSingle()

  if (promptError) {
    return NextResponse.json({ error: promptError.message }, { status: 500 })
  }

  if (!prompt || prompt.moderation_status !== 'approved') {
    return NextResponse.json({ error: 'Prompt not found or not published yet.' }, { status: 404 })
  }

  const { error: insertError } = await serviceClient.from('prompt_comments').insert({
    prompt_id: prompt.id,
    user_id: profile.id,
    content: trimmedContent,
    markdown_content: trimmedContent,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Thanks! Your comment is pending moderation.' }, { status: 201 })
}

