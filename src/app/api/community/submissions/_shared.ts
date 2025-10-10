import { NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import { recordAuthzDeny } from '@/lib/observability/metrics'
import { generateSlug } from '@/lib/utils'

const responseForError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status })

export const resolveIp = (request: Request) =>
  request.headers.get('x-real-ip') ??
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  'unknown'

export const ensureContributorAccess = async () => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { response: responseForError('Unauthorized', 401) }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name, user_id, email')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return { response: responseForError(`Unable to load profile: ${error.message}`, 500) }
  }

  if (!profile) {
    return { response: responseForError('Profile not found', 404) }
  }

  const { data: contributorRecord, error: contributorError } = await supabase
    .from('community_contributors')
    .select('status')
    .eq('profile_id', profile.id)
    .maybeSingle()

  if (contributorError) {
    return {
      response: responseForError(
        `Unable to verify contributor status: ${contributorError.message}`,
        500,
      ),
    }
  }

  if (!contributorRecord || contributorRecord.status !== 'approved') {
    return {
      response: responseForError(
        'Contributor access required. Your application may still be under review.',
        403,
      ),
    }
  }

  return { profile, supabase }
}

export const ensureAdminAccess = async () => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { response: responseForError('Unauthorized', 401) }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return { response: responseForError(`Unable to load profile: ${error.message}`, 500) }
  }

  if (!profile) {
    return { response: responseForError('Profile not found', 404) }
  }

  if (!profile.is_admin) {
    const { data: hasRole, error: roleError } = await supabase.rpc('user_has_any_role', {
      role_slugs: ['admin', 'moderator', 'organizer'],
    })

    if (roleError) {
      return {
        response: responseForError(`Unable to verify privileges: ${roleError.message}`, 500),
      }
    }

    if (!hasRole) {
      recordAuthzDeny('community_submissions_admin_access', { stage: 'role_check' })
      return { response: responseForError('Forbidden', 403) }
    }
  }

  return { profile, supabase }
}

export const calculateReadingTime = (content: string) => {
  const words = content
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
  const wordsPerMinute = 200
  return Math.max(1, Math.ceil(words.length / wordsPerMinute))
}

export const ensureUniqueSlug = async (
  baseTitle: string,
  requestedSlug: string | undefined,
  existingId?: string,
) => {
  const slugBase = requestedSlug && requestedSlug.length > 0 ? requestedSlug : generateSlug(baseTitle)
  if (!slugBase) {
    return null
  }

  const serviceClient = createServiceRoleClient()
  const slugCandidates = [slugBase]
  for (let index = 1; index < 8; index += 1) {
    slugCandidates.push(`${slugBase}-${index}`)
  }

  const { data: submissionSlugs } = await serviceClient
    .from('community_submissions')
    .select('id, slug')
    .in('slug', slugCandidates)
    .throwOnError()

  const { data: postSlugs } = await serviceClient
    .from('posts')
    .select('slug')
    .in('slug', slugCandidates)
    .throwOnError()

  const taken = new Set<string>(
    [...(submissionSlugs ?? [])
      .filter((record) => record.slug && record.id !== existingId)
      .map((record) => record.slug as string), ...(postSlugs ?? []).map((record) => record.slug as string)],
  )

  const available = slugCandidates.find((candidate) => !taken.has(candidate))
  return available ?? `${slugBase}-${Date.now()}`
}

export const recordEvent = async (
  entityId: string | null | undefined,
  entityType: string,
  event: string,
  payload: Record<string, unknown>,
  actorProfileId: string,
) => {
  if (!entityId) return

  const serviceClient = createServiceRoleClient()

  try {
    await serviceClient
      .from('community_submission_events')
      .insert({
        entity_id: entityId,
        entity_type: entityType,
        event,
        payload,
        actor_profile_id: actorProfileId,
      })
      .throwOnError()
  } catch (error) {
    console.error('Unable to record community submission event', error)
  }
}
