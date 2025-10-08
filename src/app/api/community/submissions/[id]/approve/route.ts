import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import { ensureAdminAccess, recordEvent } from '../../_shared'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const submissionId = params.id
  if (!submissionId) {
    return NextResponse.json({ error: 'Submission id is required.' }, { status: 400 })
  }

  const { notes } = (await request.json()) as { notes?: string }

  const adminResult = await ensureAdminAccess()
  if ('response' in adminResult) {
    return adminResult.response
  }

  const { profile } = adminResult
  const serviceClient = createServiceRoleClient()

  const { data: submission, error } = await serviceClient
    .from('community_submissions')
    .select('id, post_id, profile_id, title, summary, slug, content, metadata, tags, categories')
    .eq('id', submissionId)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: `Unable to load submission: ${error.message}` },
      { status: 500 },
    )
  }

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
  }

  const now = new Date().toISOString()
  const postPayload = {
    title: submission.title,
    slug: submission.slug,
    excerpt: submission.summary,
    content: submission.content,
    status: 'draft',
    author_id: submission.profile_id,
  }

  const postMutation = submission.post_id
    ? serviceClient.from('posts').update(postPayload).eq('id', submission.post_id).select('id').maybeSingle()
    : serviceClient.from('posts').insert(postPayload).select('id').maybeSingle()

  const { data: post, error: postError } = await postMutation

  if (postError) {
    return NextResponse.json(
      { error: `Unable to sync post record: ${postError.message}` },
      { status: 500 },
    )
  }

  const { data: updated, error: updateError } = await serviceClient
    .from('community_submissions')
    .update({
      status: 'approved',
      reviewed_at: now,
      feedback: notes ?? null,
      post_id: post?.id ?? submission.post_id ?? null,
    })
    .eq('id', submissionId)
    .select()
    .maybeSingle()

  if (updateError) {
    return NextResponse.json(
      { error: `Unable to approve submission: ${updateError.message}` },
      { status: 500 },
    )
  }

  await recordEvent(submissionId, 'community_submission', 'approved', { postId: post?.id }, profile.id)

  try {
    await serviceClient.functions.invoke('community-author-program-notify', {
      body: {
        type: 'community-submission-approved',
        submissionId,
        postId: post?.id ?? submission.post_id,
        profileId: submission.profile_id,
        notes,
      },
    })
  } catch (error) {
    console.error('Submission approval notification failed', error)
  }

  return NextResponse.json({ submission: updated })
}
