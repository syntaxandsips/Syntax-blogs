import { NextResponse } from 'next/server'
import { fetchLeaderboard } from '@/lib/gamification/profile-service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const scope = (url.searchParams.get('scope') ?? 'global') as 'global' | 'seasonal' | 'category'
  const category = url.searchParams.get('category') ?? undefined
  const limit = Number(url.searchParams.get('limit') ?? 10)

  try {
    const payload = await fetchLeaderboard({ scope, category, limit })
    return NextResponse.json(payload)
  } catch (error) {
    console.error('Failed to load leaderboard', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load leaderboard.' },
      { status: 500 },
    )
  }
}
