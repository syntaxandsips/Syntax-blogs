import { NextResponse } from 'next/server'
import { mapHighlight } from '@/lib/library/mappers'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import {
  highlightIdentifierSchema,
  updateHighlightSchema,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const parsedParams = highlightIdentifierSchema.safeParse({ highlightId: id })

  if (!parsedParams.success) {
    return NextResponse.json(
      { error: 'Invalid highlight identifier', details: parsedParams.error.flatten() },
      { status: 400 },
    )
  }

  const raw = await request.json()
  const validation = await validateWithSchema(updateHighlightSchema, raw)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 422 },
    )
  }

  const update = validation.data
  const updatePayload: Record<string, unknown> = {}

  if (update.postId) {
    updatePayload.post_id = update.postId
  }

  if (update.highlightedText !== undefined) {
    updatePayload.highlighted_text = update.highlightedText
  }

  if (update.note !== undefined) {
    updatePayload.note = update.note?.trim() ?? null
  }

  if (update.color !== undefined) {
    updatePayload.color = update.color
  }

  if (update.positionStart !== undefined) {
    updatePayload.position_start = update.positionStart
  }

  if (update.positionEnd !== undefined) {
    updatePayload.position_end = update.positionEnd
  }

  if (update.isPublic !== undefined) {
    updatePayload.is_public = update.isPublic
  }

  const { data, error } = await auth.supabase
    .from('highlights')
    .update(updatePayload)
    .eq('id', parsedParams.data.highlightId)
    .eq('profile_id', auth.profileId)
    .select(HIGHLIGHT_COLUMNS)
    .maybeSingle()

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to update highlight.')
  }

  if (!data) {
    return NextResponse.json({ error: 'Highlight not found.' }, { status: 404 })
  }

  return NextResponse.json({ highlight: mapHighlight(data as Parameters<typeof mapHighlight>[0]) })
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

  const parsedParams = highlightIdentifierSchema.safeParse({ highlightId: id })

  if (!parsedParams.success) {
    return NextResponse.json(
      { error: 'Invalid highlight identifier', details: parsedParams.error.flatten() },
      { status: 400 },
    )
  }

  const { error } = await auth.supabase
    .from('highlights')
    .delete()
    .eq('id', parsedParams.data.highlightId)
    .eq('profile_id', auth.profileId)

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to delete highlight.')
  }

  return NextResponse.json({ success: true })
}
