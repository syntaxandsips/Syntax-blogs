import { NextResponse } from 'next/server'
import { mapListItem, mapUserList } from '@/lib/library/mappers'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import {
  listIdentifierSchema,
  updateListSchema,
  validateWithSchema,
} from '@/lib/library/validation'

const LIST_WITH_ITEMS_COLUMNS = `
  id,
  profile_id,
  title,
  description,
  slug,
  is_public,
  cover_image_url,
  item_count,
  created_at,
  updated_at,
  list_items (
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
  )
`

export async function GET(
  _request: Request,
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

  const { listId } = parsedParams.data

  const { data, error } = await auth.supabase
    .from('user_lists')
    .select(LIST_WITH_ITEMS_COLUMNS)
    .eq('id', listId)
    .maybeSingle()

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to load list.')
  }

  if (!data) {
    return NextResponse.json({ error: 'List not found.' }, { status: 404 })
  }

  const list = mapUserList(data)
  const items = ((data as unknown as { list_items?: Array<Record<string, unknown>> }).list_items ?? []).map((item) =>
    mapListItem(item as Parameters<typeof mapListItem>[0]),
  )

  return NextResponse.json({ list: { ...list, items } })
}

export async function PATCH(
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

  const payload = await request.json()
  const validation = await validateWithSchema(updateListSchema, payload)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 422 },
    )
  }

  const { listId } = parsedParams.data
  const update = validation.data
  const updatePayload: Record<string, unknown> = {}

  if (update.title !== undefined) {
    updatePayload.title = update.title.trim()
  }

  if (update.description !== undefined) {
    updatePayload.description = update.description?.trim() ?? null
  }

  if (update.slug !== undefined) {
    const normalizedSlug = update.slug.trim().toLowerCase()

    const { data: existing, error: existingError } = await auth.supabase
      .from('user_lists')
      .select('id')
      .eq('profile_id', auth.profileId)
      .eq('slug', normalizedSlug)
      .neq('id', listId)
      .maybeSingle()

    if (existingError) {
      return buildLibraryErrorResponse(existingError, 'Unable to verify slug uniqueness.')
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Another list with this slug already exists.' },
        { status: 409 },
      )
    }

    updatePayload.slug = normalizedSlug
  }

  if (update.isPublic !== undefined) {
    updatePayload.is_public = update.isPublic
  }

  if (update.coverImageUrl !== undefined) {
    updatePayload.cover_image_url = update.coverImageUrl ?? null
  }

  const { data, error } = await auth.supabase
    .from('user_lists')
    .update(updatePayload)
    .eq('id', listId)
    .select(LIST_WITH_ITEMS_COLUMNS)
    .maybeSingle()

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to update list.')
  }

  if (!data) {
    return NextResponse.json({ error: 'List not found.' }, { status: 404 })
  }

  const list = mapUserList(data)
  const items = ((data as unknown as { list_items?: Array<Record<string, unknown>> }).list_items ?? []).map((item) =>
    mapListItem(item as Parameters<typeof mapListItem>[0]),
  )

  return NextResponse.json({ list: { ...list, items } })
}

export async function DELETE(
  _request: Request,
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

  const { listId } = parsedParams.data

  const { error } = await auth.supabase.from('user_lists').delete().eq('id', listId)

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to delete list.')
  }

  return NextResponse.json({ success: true })
}
