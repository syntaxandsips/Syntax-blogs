import { NextRequest, NextResponse } from 'next/server'
import { communitySubmissionSchema } from '@/lib/validation/community'
import { sanitizeMarkdown } from '@/lib/sanitize-markdown'
import { rateLimit } from '@/lib/rate-limit'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import {
  calculateReadingTime,
  ensureContributorAccess,
  ensureUniqueSlug,
  recordEvent,
  resolveIp,
} from './_shared'

export async function GET() {
  const result = await ensureContributorAccess()
  if ('response' in result) {
    return result.response
  }

  const { profile, supabase } = result

  const { data, error } = await supabase
    .from('community_submissions')
    .select('*')
    .eq('profile_id', profile.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: `Unable to load submissions: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ submissions: data ?? [] })
}

export async function POST(request: NextRequest) {
  const result = await ensureContributorAccess()
  if ('response' in result) {
    return result.response
  }

  const { profile, supabase } = result

  const rateKey = `community-submission:${profile.id}:${resolveIp(request)}`
  const rateCheck = rateLimit(rateKey, { limit: 12, windowMs: 60_000 })

  if (!rateCheck.success) {
    return NextResponse.json(
      {
        error: 'Too many saves in a short window. Please slow down and try again shortly.',
        reset: rateCheck.reset,
      },
      { status: 429 },
    )
  }

  const raw = await request.json()
  const parsed = communitySubmissionSchema.safeParse(raw)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten(),
      },
      { status: 422 },
    )
  }

  const submission = parsed.data
  const sanitizedContent = sanitizeMarkdown(submission.content)
  const readingTime = calculateReadingTime(sanitizedContent)

  const slug = await ensureUniqueSlug(submission.title, submission.slug, submission.id)

  if (!slug) {
    return NextResponse.json(
      { error: 'Unable to generate a slug for this submission.' },
      { status: 400 },
    )
  }

  const now = new Date().toISOString()
  const status = submission.intent === 'submit' ? 'submitted' : 'draft'

  if (
    submission.intent === 'submit' &&
    (!submission.checklist.toneReviewed ||
      !submission.checklist.accessibilityChecked ||
      !submission.checklist.linksVerified ||
      !submission.checklist.assetsIncluded)
  ) {
    return NextResponse.json(
      {
        error:
          'Please complete the editorial checklist before submitting for review. Ensure tone, accessibility, links, and assets are ready.',
      },
      { status: 409 },
    )
  }

  const record = {
    profile_id: profile.id,
    title: submission.title,
    summary: submission.summary,
    slug,
    categories: submission.categories,
    tags: submission.tags,
    content: sanitizedContent,
    editorial_checklist: submission.checklist,
    metadata: submission.metadata,
    notes: {
      toEditors: submission.notesToEditors,
      coAuthorIds: submission.coAuthorIds,
    },
    attachments: submission.attachments,
    reading_time: readingTime,
    status,
    submitted_at: submission.intent === 'submit' ? now : null,
    last_autosaved_at: submission.intent === 'autosave' ? now : null,
    updated_at: now,
  }

  const mutation = submission.id
    ? supabase
        .from('community_submissions')
        .update(record)
        .eq('id', submission.id)
        .select()
        .maybeSingle()
    : supabase
        .from('community_submissions')
        .insert(record)
        .select()
        .maybeSingle()

  const { data, error } = await mutation

  if (error) {
    return NextResponse.json(
      { error: `Unable to save submission: ${error.message}` },
      { status: 500 },
    )
  }

  const eventType =
    submission.intent === 'autosave'
      ? 'autosaved'
      : submission.intent === 'submit'
        ? 'submitted'
        : 'saved'

  await recordEvent(data?.id, 'community_submission', eventType, {
    title: submission.title,
    slug,
    status,
  }, profile.id)

  if (submission.intent === 'submit') {
    try {
      const serviceClient = createServiceRoleClient()
      await serviceClient.functions.invoke('community-author-program-notify', {
        body: {
          type: 'community-submission-submitted',
          submissionId: data?.id,
          profileId: profile.id,
          title: submission.title,
          slug,
        },
      })
    } catch (error) {
      console.error('Community submission notification failed', error)
    }
  }

  return NextResponse.json({ submission: data, message: 'Submission saved successfully.' })
}
