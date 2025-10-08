import { NextRequest, NextResponse } from 'next/server'
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

  if (submission.status === 'approved' || submission.status === 'published') {
    return NextResponse.json(
      { error: 'Approved submissions can no longer be withdrawn.' },
      { status: 409 },
    )
  }

  const { data: updated, error: updateError } = await supabase
    .from('community_submissions')
    .update({ status: 'withdrawn', submitted_at: null })
    .eq('id', submissionId)
    .select()
    .maybeSingle()

  if (updateError) {
    return NextResponse.json(
      { error: `Unable to withdraw submission: ${updateError.message}` },
      { status: 500 },
    )
  }

  await recordEvent(submissionId, 'community_submission', 'withdrawn', {}, profile.id)

  return NextResponse.json({ submission: updated })
}
