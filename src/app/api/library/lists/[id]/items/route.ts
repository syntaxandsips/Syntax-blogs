import { NextResponse } from 'next/server'
import { mapListItem } from '@/lib/library/mappers'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import {
  createListItemSchema,
  listIdentifierSchema,
  paginationQuerySchema,
  validateWithSchema,
} from '@/lib/library/validation'

const ITEM_COLUMNS = `
  id,
  list_id,
  post_id,
  note,
  position,
  added_at,
  posts (
    id,
    title,
    slug,
    excerpt,
    featured_image_url
  )
`

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const parsedParams = listIdentifierSchema.safeParse({ listId: id })
  if (!parsedParams.success) {
    return NextResponse.json(
      { error: 'Invalid list identifier', details: parsedParams.error.flatten() },
      { status: 400 },
    )
  }

  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  const parsedQuery = paginationQuerySchema.safeParse(queryParams)

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsedQuery.error.flatten() },
      { status: 400 },
    )
  }

  const { listId } = parsedParams.data
  const { limit, cursor } = parsedQuery.data

  let builder = auth.supabase
    .from('list_items')
    .select(ITEM_COLUMNS)
    .eq('list_id', listId)
    .order('position', { ascending: true })
    .limit(limit ?? 20)

  if (cursor) {
    builder = builder.gt('position', Number.parseInt(cursor, 10))
  }

  const { data, error } = await builder

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to load list items.')
  }

  const items = (data ?? []).map((record) => mapListItem(record as Parameters<typeof mapListItem>[0]))
  const nextCursor =
    items.length === (limit ?? 20) ? String(items[items.length - 1]?.position ?? '') : null

  return NextResponse.json({ items, nextCursor })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const parsedParams = listIdentifierSchema.safeParse({ listId: id })
  if (!parsedParams.success) {
    return NextResponse.json(
      { error: 'Invalid list identifier', details: parsedParams.error.flatten() },
      { status: 400 },
    )
  }

  const body = await request.json()
  const validation = await validateWithSchema(createListItemSchema, body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 422 },
    )
  }

  const { listId } = parsedParams.data
  const payload = validation.data

  let position = payload.position ?? 0
  if (payload.position === undefined) {
    const { data: lastItem, error: lastError } = await auth.supabase
      .from('list_items')
      .select('position')
      .eq('list_id', listId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastError) {
      return buildLibraryErrorResponse(lastError, 'Unable to resolve list position.')
    }

    position = lastItem ? (lastItem.position as number) + 1 : 0
  }

  const insertPayload = {
    list_id: listId,
    post_id: payload.postId,
    note: payload.note?.trim() ?? null,
    position,
  }

  const { data, error } = await auth.supabase
    .from('list_items')
    .insert(insertPayload)
    .select(ITEM_COLUMNS)
    .maybeSingle()

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'This post is already saved to the list.' },
        { status: 409 },
      )
    }

    return buildLibraryErrorResponse(error, 'Unable to add post to list.')
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Unable to add item to list.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ item: mapListItem(data as Parameters<typeof mapListItem>[0]) }, { status: 201 })
}
