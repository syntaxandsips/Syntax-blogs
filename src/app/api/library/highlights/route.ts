import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mapHighlight } from '@/lib/library/mappers'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import {
  createHighlightSchema,
  paginationQuerySchema,
  validateWithSchema,
} from '@/lib/library/validation'

const HIGHLIGHT_COLUMNS = `
  id,
  profile_id,
  post_id,
  highlighted_text,
  note,
  color,
  position_start,
  position_end,
  is_public,
  created_at,
  updated_at,
  posts (
    title,
    slug
  )
`

const highlightQuerySchema = paginationQuerySchema.extend({
  postId: z.string().uuid().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
})

export async function GET(request: Request) {
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  const parsedQuery = highlightQuerySchema.safeParse(queryParams)

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsedQuery.error.flatten() },
      { status: 400 },
    )
  }

  const { limit, cursor, postId, color } = parsedQuery.data

  let builder = auth.supabase
    .from('highlights')
    .select(HIGHLIGHT_COLUMNS)
    .eq('profile_id', auth.profileId)
    .order('created_at', { ascending: false })
    .limit(limit ?? 20)

  if (cursor) {
    builder = builder.lt('created_at', cursor)
  }

  if (postId) {
    builder = builder.eq('post_id', postId)
  }

  if (color) {
    builder = builder.eq('color', color)
  }

  const { data, error } = await builder

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to load highlights.')
  }

  const items = (data ?? []).map((record) => mapHighlight(record as Parameters<typeof mapHighlight>[0]))
  const nextCursor = items.length === (limit ?? 20) ? items[items.length - 1]?.createdAt ?? null : null

  return NextResponse.json({ items, nextCursor })
}

export async function POST(request: Request) {
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const raw = await request.json()
  const validation = await validateWithSchema(createHighlightSchema, raw)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 422 },
    )
  }

  const payload = validation.data

  const insertPayload = {
    profile_id: auth.profileId,
    post_id: payload.postId,
    highlighted_text: payload.highlightedText,
    note: payload.note?.trim() ?? null,
    color: payload.color,
    position_start: payload.positionStart,
    position_end: payload.positionEnd,
    is_public: payload.isPublic ?? false,
  }

  const { data, error } = await auth.supabase
    .from('highlights')
    .insert(insertPayload)
    .select(HIGHLIGHT_COLUMNS)
    .maybeSingle()

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to create highlight.')
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Unable to create highlight.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ highlight: mapHighlight(data as Parameters<typeof mapHighlight>[0]) }, { status: 201 })
}
