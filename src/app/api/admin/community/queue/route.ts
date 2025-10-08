import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import {
  authorApplicationReviewSchema,
  submissionTransitionSchema,
} from '@/lib/validation/community'
import { ensureAdminAccess, recordEvent } from '@/app/api/community/submissions/_shared'

const ACTIVE_APPLICATION_STATUSES = ['submitted', 'under_review', 'needs_more_info']
const ACTIVE_SUBMISSION_STATUSES = ['submitted', 'in_review', 'needs_revision']

export async function GET() {
  const adminResult = await ensureAdminAccess()
  if ('response' in adminResult) {
    return adminResult.response
  }

  const serviceClient = createServiceRoleClient()

  const [applicationsResult, submissionsResult] = await Promise.all([
    serviceClient
      .from('author_applications')
      .select('id, profile_id, status, submitted_at, reviewed_at, review_notes, application_payload')
      .in('status', ACTIVE_APPLICATION_STATUSES)
      .order('submitted_at', { ascending: true })
      .throwOnError(),
    serviceClient
      .from('community_submissions')
      .select('id, profile_id, status, title, summary, slug, submitted_at, reviewed_at, feedback')
      .in('status', ACTIVE_SUBMISSION_STATUSES)
      .order('submitted_at', { ascending: true })
      .throwOnError(),
  ])

  return NextResponse.json({
    applications: applicationsResult.data ?? [],
    submissions: submissionsResult.data ?? [],
  })
}

export async function POST(request: NextRequest) {
  const adminResult = await ensureAdminAccess()
  if ('response' in adminResult) {
    return adminResult.response
  }

  const { profile } = adminResult
  const body = (await request.json()) as Record<string, unknown>
  const entityType = body?.entityType

  const serviceClient = createServiceRoleClient()

  const buildProxyHeaders = () => {
    const headers = new Headers({ 'Content-Type': 'application/json' })
    const cookie = request.headers.get('cookie')
    const authorization = request.headers.get('authorization')

    if (cookie) {
      headers.set('cookie', cookie)
    }

    if (authorization) {
      headers.set('authorization', authorization)
    }

    return headers
  }

  if (entityType === 'application') {
    const parsed = authorApplicationReviewSchema.safeParse({
      applicationId: body?.applicationId,
      action: body?.action,
      notes: body?.notes,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 422 },
      )
    }

    const decision = parsed.data

    const statusMap: Record<typeof decision.action, string> = {
      approve: 'accepted',
      decline: 'rejected',
      needs_more_info: 'needs_more_info',
    }

    const { data, error } = await serviceClient
      .from('author_applications')
      .update({
        status: statusMap[decision.action],
        reviewed_at: new Date().toISOString(),
        review_notes: decision.notes ?? null,
        reviewed_by: profile.id,
      })
      .eq('id', decision.applicationId)
      .select()
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: `Unable to update application: ${error.message}` },
        { status: 500 },
      )
    }

    await recordEvent(
      decision.applicationId,
      'author_application',
      decision.action,
      { notes: decision.notes },
      profile.id,
    )

    if (decision.action === 'approve') {
      try {
        await serviceClient
          .from('community_contributors')
          .upsert({
            profile_id: data?.profile_id,
            status: 'approved',
            approved_at: new Date().toISOString(),
          })
          .throwOnError()
      } catch (error) {
        console.error('Unable to upsert community contributor record', error)
      }
    }

    try {
      await serviceClient.functions.invoke('community-author-program-notify', {
        body: {
          type: 'author-application-decision',
          applicationId: decision.applicationId,
          profileId: data?.profile_id,
          action: decision.action,
          notes: decision.notes,
        },
      })
    } catch (error) {
      console.error('Author application decision notification failed', error)
    }

    return NextResponse.json({ application: data })
  }

  if (entityType === 'submission') {
    const parsed = submissionTransitionSchema.safeParse({
      submissionId: body?.submissionId,
      action: body?.action,
      notes: body?.notes,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 422 },
      )
    }

    const transition = parsed.data

    let response: Response

    switch (transition.action) {
      case 'feedback': {
        response = await fetch(
          `${request.nextUrl.origin}/api/community/submissions/${transition.submissionId}/feedback`,
          {
            method: 'POST',
            headers: buildProxyHeaders(),
            body: JSON.stringify({ notes: transition.notes }),
          },
        )
        break
      }
      case 'approve': {
        response = await fetch(
          `${request.nextUrl.origin}/api/community/submissions/${transition.submissionId}/approve`,
          {
            method: 'POST',
            headers: buildProxyHeaders(),
            body: JSON.stringify({ notes: transition.notes }),
          },
        )
        break
      }
      case 'decline': {
        response = await fetch(
          `${request.nextUrl.origin}/api/community/submissions/${transition.submissionId}/decline`,
          {
            method: 'POST',
            headers: buildProxyHeaders(),
            body: JSON.stringify({ notes: transition.notes }),
          },
        )
        break
      }
      default: {
        return NextResponse.json({ error: 'Unsupported submission action.' }, { status: 400 })
      }
    }

    if (!response.ok) {
      const errorPayload = await response.json()
      return NextResponse.json(errorPayload, { status: response.status })
    }

    const payload = await response.json()
    return NextResponse.json(payload)
  }

  return NextResponse.json({ error: 'Unsupported entity type.' }, { status: 400 })
}
