import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import { rateLimit } from '@/lib/rate-limit'
import { authorApplicationSchema } from '@/lib/validation/community'
import { verifyHCaptcha } from '@/lib/hcaptcha'

const ACTIVE_STATUSES = new Set([
  'submitted',
  'under_review',
  'accepted',
  'needs_more_info',
])

const dedupeStatuses = Array.from(ACTIVE_STATUSES)

const resolveClientIp = (request: NextRequest) =>
  request.headers.get('x-real-ip') ??
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  'unknown'

const getSessionProfile = async () => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name, user_id, email')
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

  if (!profile) {
    return {
      response: NextResponse.json({ error: 'Profile not found' }, { status: 404 }),
    }
  }

  return { profile, supabase }
}

export async function GET() {
  const result = await getSessionProfile()
  if ('response' in result) {
    return result.response
  }

  const { profile, supabase } = result

  const { data, error } = await supabase
    .from('author_applications')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: `Unable to load author application: ${error.message}` },
      { status: 500 },
    )
  }

  if (!data) {
    return NextResponse.json({ application: null })
  }

  return NextResponse.json({ application: data })
}

export async function POST(request: NextRequest) {
  const result = await getSessionProfile()
  if ('response' in result) {
    return result.response
  }

  const { profile, supabase } = result

  const rateKey = `author-apply:${profile.id}:${resolveClientIp(request)}`
  const limitCheck = rateLimit(rateKey, { limit: 6, windowMs: 60_000 })

  if (!limitCheck.success) {
    return NextResponse.json(
      {
        error: 'Too many attempts. Please wait a minute before trying again.',
        reset: limitCheck.reset,
      },
      { status: 429 },
    )
  }

  const raw = await request.json()

  const parseResult = authorApplicationSchema.safeParse(raw)

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      },
      { status: 422 },
    )
  }

  const payload = parseResult.data

  try {
    await verifyHCaptcha(payload.captchaToken)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Captcha verification failed',
      },
      { status: 400 },
    )
  }

  const { data: existingActive, error: existingError } = await supabase
    .from('author_applications')
    .select('id, status')
    .eq('profile_id', profile.id)
    .in('status', dedupeStatuses)

  if (existingError) {
    return NextResponse.json(
      { error: `Unable to validate existing applications: ${existingError.message}` },
      { status: 500 },
    )
  }

  const hasActiveDifferent = (existingActive ?? []).some(
    (entry) => entry.id !== payload.existingApplicationId,
  )

  if (hasActiveDifferent) {
    return NextResponse.json(
      {
        error:
          'You already have an application in review. Our team will reach out via email once a decision is made.',
      },
      { status: 409 },
    )
  }

  const record = {
    profile_id: profile.id,
    status: 'submitted',
    application_payload: {
      focusAreas: payload.focusAreas,
      experienceLevel: payload.experienceLevel,
      currentRole: payload.currentRole,
      communityParticipation: payload.communityParticipation,
      publishedLinks: payload.publishedLinks,
      socialHandles: payload.socialHandles,
      pitch: {
        focus: payload.pitchFocus,
        audience: payload.pitchAudience,
        cadence: payload.pitchCadence,
        availability: payload.availability,
      },
      fullName: payload.fullName,
      email: payload.email,
      pronouns: payload.pronouns ?? null,
    },
    focus_areas: payload.focusAreas,
    experience_level: payload.experienceLevel,
    current_role: payload.currentRole,
    community_participation: payload.communityParticipation,
    published_links: payload.publishedLinks ?? [],
    social_handles: payload.socialHandles ?? {},
    writing_sample_url: payload.writingSampleUrl ?? null,
    pitch: {
      focus: payload.pitchFocus,
      audience: payload.pitchAudience,
      cadence: payload.pitchCadence,
      availability: payload.availability,
    },
    consent: payload.consent,
    editorial_policy_acknowledged: payload.editorialPolicyAcknowledged,
    newsletter_opt_in: payload.newsletterOptIn,
  }

  const mutation = payload.existingApplicationId
    ? supabase
        .from('author_applications')
        .update({
          ...record,
          status: 'submitted',
        })
        .eq('id', payload.existingApplicationId)
        .select()
        .maybeSingle()
    : supabase
        .from('author_applications')
        .insert(record)
        .select()
        .maybeSingle()

  const { data, error } = await mutation

  if (error) {
    return NextResponse.json(
      { error: `Unable to save application: ${error.message}` },
      { status: 500 },
    )
  }

  const serviceClient = createServiceRoleClient()

  await serviceClient
    .from('community_submission_events')
    .insert({
      entity_id: data?.id,
      entity_type: 'author_application',
      event: payload.existingApplicationId ? 'resubmitted' : 'submitted',
      payload: {
        focusAreas: payload.focusAreas,
        pitchCadence: payload.pitchCadence,
      },
      actor_profile_id: profile.id,
    })
    .throwOnError()
    .catch(() => undefined)

  await serviceClient
    .from('community_contributors')
    .upsert(
      {
        profile_id: profile.id,
        status: 'pending',
      },
      { onConflict: 'profile_id' },
    )
    .throwOnError()
    .catch(() => undefined)

  try {
    await serviceClient.functions.invoke('community-author-program-notify', {
      body: {
        type: 'author-application-submitted',
        applicationId: data?.id,
        profileId: profile.id,
        email: payload.email,
        fullName: payload.fullName,
      },
    })
  } catch (error) {
    console.error('Author application notification failed', error)
  }

  return NextResponse.json({
    application: data,
    message: 'Application received! Our editorial team will reach out soon.',
  })
}
