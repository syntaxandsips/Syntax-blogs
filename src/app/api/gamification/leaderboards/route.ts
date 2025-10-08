import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server-client';
import { fetchLeaderboard } from '@/lib/gamification/profile-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scopeParam = searchParams.get('scope');
  const limitParam = searchParams.get('limit');
  const scope = scopeParam === null ? undefined : scopeParam;
  const limit = limitParam ? Math.min(50, Math.max(1, Number(limitParam))) : undefined;

  const serviceClient = createServiceRoleClient();

  try {
    const entries = await fetchLeaderboard(serviceClient, {
      scope: scope as 'global' | 'weekly' | 'monthly' | 'seasonal' | undefined,
      limit,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Leaderboard fetch failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load leaderboard.' },
      { status: 500 },
    );
  }
}
