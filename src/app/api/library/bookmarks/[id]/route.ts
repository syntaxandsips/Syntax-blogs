import { NextResponse } from 'next/server'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import { bookmarkIdentifierSchema } from '@/lib/library/validation'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const parsed = bookmarkIdentifierSchema.safeParse({ bookmarkId: id })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid bookmark identifier', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { bookmarkId } = parsed.data

  const { error } = await auth.supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('profile_id', auth.profileId)

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to delete bookmark.')
  }

  return NextResponse.json({ success: true })
}
