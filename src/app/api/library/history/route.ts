import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mapReadingHistory } from '@/lib/library/mappers'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import {
  paginationQuerySchema,
  recordReadingSchema,
  validateWithSchema,
} from '@/lib/library/validation'

const HISTORY_COLUMNS = `
  id,
  profile_id,
  post_id,
  read_at,
  read_duration_seconds,
  scroll_percentage,
  completed,
  last_position,
  created_at,
  updated_at,
  posts (
    title,
    slug,
    excerpt,
    featured_image_url
  )
`

const historyQuerySchema = paginationQuerySchema.extend({
  postId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  completed: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
})

export async function GET(request: Request) {
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  const parsedQuery = historyQuerySchema.safeParse(queryParams)

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsedQuery.error.flatten() },
      { status: 400 },
    )
  }

  const { limit, cursor, postId, from, to, completed } = parsedQuery.data

  let builder = auth.supabase
    .from('reading_history')
    .select(HISTORY_COLUMNS)
    .eq('profile_id', auth.profileId)
    .order('read_at', { ascending: false })
    .limit(limit ?? 20)

  if (cursor) {
    builder = builder.lt('read_at', cursor)
  }

  if (postId) {
    builder = builder.eq('post_id', postId)
  }

  if (typeof completed === 'boolean') {
    builder = builder.eq('completed', completed)
  }

  if (from) {
    builder = builder.gte('read_at', from)
  }

  if (to) {
    builder = builder.lte('read_at', to)
  }

  const { data, error } = await builder

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to load reading history.')
  }

  const items = (data ?? []).map((record) => mapReadingHistory(record as Parameters<typeof mapReadingHistory>[0]))
  const nextCursor = items.length === (limit ?? 20) ? items[items.length - 1]?.readAt ?? null : null

  return NextResponse.json({ items, nextCursor })
}

export async function POST(request: Request) {
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const raw = await request.json()
  const validation = await validateWithSchema(recordReadingSchema, raw)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 422 },
    )
  }

  const payload = validation.data
  const commonFields = {
    read_duration_seconds: payload.readDurationSeconds ?? null,
    scroll_percentage: payload.scrollPercentage ?? null,
    completed: payload.completed ?? false,
    last_position: payload.lastPosition ?? 0,
  }

  if (payload.historyId) {
    const { data, error } = await auth.supabase
      .from('reading_history')
      .update({
        ...commonFields,
        read_at: payload.readAt ?? new Date().toISOString(),
      })
      .eq('id', payload.historyId)
      .eq('profile_id', auth.profileId)
      .select(HISTORY_COLUMNS)
      .maybeSingle()

    if (error) {
      return buildLibraryErrorResponse(error, 'Unable to update reading history entry.')
    }

    if (!data) {
      return NextResponse.json({ error: 'Reading history entry not found.' }, { status: 404 })
    }

    return NextResponse.json({ history: mapReadingHistory(data as Parameters<typeof mapReadingHistory>[0]) })
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from('reading_history')
    .select('id, completed')
    .eq('profile_id', auth.profileId)
    .eq('post_id', payload.postId)
    .order('read_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingError) {
    return buildLibraryErrorResponse(existingError, 'Unable to record reading history.')
  }

  if (existing && !existing.completed) {
    const { data, error } = await auth.supabase
      .from('reading_history')
      .update({
        ...commonFields,
        read_at: payload.readAt ?? new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select(HISTORY_COLUMNS)
      .maybeSingle()

    if (error) {
      return buildLibraryErrorResponse(error, 'Unable to update reading history entry.')
    }

    if (!data) {
      return NextResponse.json({ error: 'Reading history entry not found.' }, { status: 404 })
    }

    return NextResponse.json({ history: mapReadingHistory(data as Parameters<typeof mapReadingHistory>[0]) })
  }

  const { data, error } = await auth.supabase
    .from('reading_history')
    .insert({
      profile_id: auth.profileId,
      post_id: payload.postId,
      read_at: payload.readAt ?? new Date().toISOString(),
      ...commonFields,
    })
    .select(HISTORY_COLUMNS)
    .maybeSingle()

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to record reading history.')
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Unable to record reading history.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ history: mapReadingHistory(data as Parameters<typeof mapReadingHistory>[0]) }, { status: 201 })
}
