import { NextResponse } from 'next/server'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import { readingHistoryIdentifierSchema } from '@/lib/library/validation'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const parsed = readingHistoryIdentifierSchema.safeParse({ historyId: id })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid history identifier', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { historyId } = parsed.data

  const { error } = await auth.supabase
    .from('reading_history')
    .delete()
    .eq('id', historyId)
    .eq('profile_id', auth.profileId)

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to delete history entry.')
  }

  return NextResponse.json({ success: true })
}
