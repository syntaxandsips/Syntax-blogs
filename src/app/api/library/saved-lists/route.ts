import { NextResponse } from 'next/server'
import { mapSavedList } from '@/lib/library/mappers'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import {
  paginationQuerySchema,
  saveListSchema,
  validateWithSchema,
} from '@/lib/library/validation'

const SAVED_LIST_COLUMNS = `
  id,
  profile_id,
  list_id,
  saved_at,
  user_lists (
    title,
    description,
    item_count,
    profiles (
      display_name
    )
  )
`

export async function GET(request: Request) {
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
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

  const { limit, cursor } = parsedQuery.data

  let builder = auth.supabase
    .from('saved_lists')
    .select(SAVED_LIST_COLUMNS)
    .eq('profile_id', auth.profileId)
    .order('saved_at', { ascending: false })
    .limit(limit ?? 20)

  if (cursor) {
    builder = builder.lt('saved_at', cursor)
  }

  const { data, error } = await builder

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to load saved lists.')
  }

  const items = (data ?? []).map((record) => mapSavedList(record as Parameters<typeof mapSavedList>[0]))
  const nextCursor = items.length === (limit ?? 20) ? items[items.length - 1]?.savedAt ?? null : null

  return NextResponse.json({ items, nextCursor })
}

export async function POST(request: Request) {
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const body = await request.json()
  const validation = await validateWithSchema(saveListSchema, body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 422 },
    )
  }

  const { listId } = validation.data

  const { data, error } = await auth.supabase
    .from('saved_lists')
    .insert({
      profile_id: auth.profileId,
      list_id: listId,
    })
    .select(SAVED_LIST_COLUMNS)
    .maybeSingle()

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'List already saved.' },
        { status: 409 },
      )
    }

    return buildLibraryErrorResponse(error, 'Unable to save list.')
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Unable to save list.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ savedList: mapSavedList(data as Parameters<typeof mapSavedList>[0]) }, { status: 201 })
}
