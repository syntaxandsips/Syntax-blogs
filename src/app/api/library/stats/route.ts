import { NextResponse } from 'next/server'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import { statsQuerySchema } from '@/lib/library/validation'
import { loadLibraryStats } from '@/lib/library/stats-service'

export async function GET(request: Request) {
  const auth = await getLibraryRequestContext()
  if ('response' in auth) {
    return auth.response
  }

  const url = new URL(request.url)
  const parsedQuery = statsQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()))

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsedQuery.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const payload = await loadLibraryStats(auth.profileId, auth.supabase, parsedQuery.data.range)
    return NextResponse.json(payload)
  } catch (error) {
    return buildLibraryErrorResponse(error, 'Unable to load library stats.')
  }
}
