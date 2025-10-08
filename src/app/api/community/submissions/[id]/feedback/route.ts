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
    .select('id, profile_id, status')
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

  const { data: updated, error: updateError } = await serviceClient
    .from('community_submissions')
    .update({
      status: 'needs_revision',
      reviewed_at: now,
      feedback: notes ?? null,
    })
    .eq('id', submissionId)
    .select()
    .maybeSingle()

  if (updateError) {
    return NextResponse.json(
      { error: `Unable to post feedback: ${updateError.message}` },
      { status: 500 },
    )
  }

  await recordEvent(submissionId, 'community_submission', 'feedback', { notes }, profile.id)

  try {
    await serviceClient.functions.invoke('community-author-program-notify', {
      body: {
        type: 'community-submission-feedback',
        submissionId,
        profileId: submission.profile_id,
        notes,
      },
    })
  } catch (error) {
    console.error('Submission feedback notification failed', error)
  }

  return NextResponse.json({ submission: updated })
}
