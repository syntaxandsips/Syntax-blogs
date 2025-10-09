import { NextResponse } from 'next/server'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import { savedListIdentifierSchema } from '@/lib/library/validation'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const parsed = savedListIdentifierSchema.safeParse({ savedListId: id })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid saved list identifier', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { savedListId } = parsed.data

  const { error } = await auth.supabase
    .from('saved_lists')
    .delete()
    .eq('id', savedListId)
    .eq('profile_id', auth.profileId)

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to remove saved list.')
  }

  return NextResponse.json({ success: true })
}
