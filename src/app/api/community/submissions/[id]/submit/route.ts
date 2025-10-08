import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import { ensureContributorAccess, recordEvent } from '../../_shared'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params

  if (!submissionId) {
    return NextResponse.json({ error: 'Submission id is required.' }, { status: 400 })
  }

  const result = await ensureContributorAccess()
  if ('response' in result) {
    return result.response
  }

  const { profile, supabase } = result

  const { data: submission, error } = await supabase
    .from('community_submissions')
    .select('id, status')
    .eq('id', submissionId)
    .eq('profile_id', profile.id)
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

  if (submission.status === 'submitted' || submission.status === 'in_review') {
    return NextResponse.json(
      { error: 'This draft has already been submitted for review.' },
      { status: 409 },
    )
  }

  const now = new Date().toISOString()

  const { data: updated, error: updateError } = await supabase
    .from('community_submissions')
    .update({ status: 'submitted', submitted_at: now })
    .eq('id', submissionId)
    .select()
    .maybeSingle()

  if (updateError) {
    return NextResponse.json(
      { error: `Unable to submit draft: ${updateError.message}` },
      { status: 500 },
    )
  }

  await recordEvent(submissionId, 'community_submission', 'submitted', {}, profile.id)

  try {
    const serviceClient = createServiceRoleClient()
    await serviceClient.functions.invoke('community-author-program-notify', {
      body: {
        type: 'community-submission-submitted',
        submissionId,
        profileId: profile.id,
      },
    })
  } catch (error) {
    console.error('Submission submit notification failed', error)
  }

  return NextResponse.json({ submission: updated })
}
