import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mapBookmark } from '@/lib/library/mappers'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import {
  createBookmarkSchema,
  paginationQuerySchema,
  validateWithSchema,
} from '@/lib/library/validation'

const BOOKMARK_COLUMNS = `
  id,
  profile_id,
  post_id,
  created_at,
  posts (
    title,
    slug,
    excerpt,
    featured_image_url
  )
`

const bookmarkQuerySchema = paginationQuerySchema.extend({
  postId: z.string().uuid().optional(),
})

export async function GET(request: Request) {
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  const parsedQuery = bookmarkQuerySchema.safeParse(queryParams)

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsedQuery.error.flatten() },
      { status: 400 },
    )
  }

  const { limit, cursor, postId } = parsedQuery.data

  let builder = auth.supabase
    .from('bookmarks')
    .select(BOOKMARK_COLUMNS)
    .eq('profile_id', auth.profileId)
    .order('created_at', { ascending: false })
    .limit(limit ?? 20)

  if (cursor) {
    builder = builder.lt('created_at', cursor)
  }

  if (postId) {
    builder = builder.eq('post_id', postId)
  }

  const { data, error } = await builder

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to load bookmarks.')
  }

  const items = (data ?? []).map((record) => mapBookmark(record as Parameters<typeof mapBookmark>[0]))
  const nextCursor = items.length === (limit ?? 20) ? items[items.length - 1]?.createdAt ?? null : null

  return NextResponse.json({ items, nextCursor })
}

export async function POST(request: Request) {
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const raw = await request.json()
  const validation = await validateWithSchema(createBookmarkSchema, raw)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 422 },
    )
  }

  const payload = validation.data

  const { data, error } = await auth.supabase
    .from('bookmarks')
    .insert({
      profile_id: auth.profileId,
      post_id: payload.postId,
    })
    .select(BOOKMARK_COLUMNS)
    .maybeSingle()

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'Bookmark already exists.' },
        { status: 409 },
      )
    }

    return buildLibraryErrorResponse(error, 'Unable to create bookmark.')
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Unable to create bookmark.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ bookmark: mapBookmark(data as Parameters<typeof mapBookmark>[0]) }, { status: 201 })
}
