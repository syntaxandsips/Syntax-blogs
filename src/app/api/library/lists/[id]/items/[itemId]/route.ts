import { NextResponse } from 'next/server'
import { mapListItem } from '@/lib/library/mappers'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import {
  listIdentifierSchema,
  listItemIdentifierSchema,
  updateListItemSchema,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const parsedList = listIdentifierSchema.safeParse({ listId: id })
  if (!parsedList.success) {
    return NextResponse.json(
      { error: 'Invalid identifiers', details: parsedList.error.flatten() },
      { status: 400 },
    )
  }

  const parsedItem = listItemIdentifierSchema.safeParse({
    listId: id,
    itemId,
  })

  if (!parsedItem.success) {
    return NextResponse.json(
      { error: 'Invalid identifiers', details: parsedItem.error.flatten() },
      { status: 400 },
    )
  }

  const body = await request.json()
  const validation = await validateWithSchema(updateListItemSchema, body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 422 },
    )
  }

  const update = validation.data
  const updatePayload: Record<string, unknown> = {}

  if (update.note !== undefined) {
    updatePayload.note = update.note?.trim() ?? null
  }

  if (update.position !== undefined) {
    updatePayload.position = update.position
  }

  const { data, error } = await auth.supabase
    .from('list_items')
    .update(updatePayload)
    .eq('id', parsedItem.data.itemId)
    .eq('list_id', parsedList.data.listId)
    .select(ITEM_COLUMNS)
    .maybeSingle()

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to update list item.')
  }

  if (!data) {
    return NextResponse.json({ error: 'List item not found.' }, { status: 404 })
  }

  return NextResponse.json({ item: mapListItem(data as Parameters<typeof mapListItem>[0]) })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const parsedItem = listItemIdentifierSchema.safeParse({
    listId: id,
    itemId,
  })

  if (!parsedItem.success) {
    return NextResponse.json(
      { error: 'Invalid identifiers', details: parsedItem.error.flatten() },
      { status: 400 },
    )
  }

  const { error } = await auth.supabase
    .from('list_items')
    .delete()
    .eq('id', parsedItem.data.itemId)
    .eq('list_id', parsedItem.data.listId)

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to remove list item.')
  }

  return NextResponse.json({ success: true })
}
