import { NextResponse } from 'next/server';
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client';
import { recordGamificationAction } from '@/lib/gamification/points-engine';

export const dynamic = 'force-dynamic';

interface Payload {
  actionType?: unknown;
  profileId?: unknown;
  metadata?: unknown;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Payload;
  const actionType = typeof body.actionType === 'string' ? body.actionType : '';
  const explicitProfileId = typeof body.profileId === 'string' ? body.profileId : null;
  const metadata = (body.metadata as Record<string, unknown>) ?? null;

  if (!actionType) {
    return NextResponse.json({ error: 'actionType is required.' }, { status: 400 });
  }

  const authClient = createServerComponentClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const serviceClient = createServiceRoleClient();
  let profileId = explicitProfileId;

  if (!profileId) {
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { data: profileRecord, error: profileError } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profileRecord) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    profileId = profileRecord.id as string;
  } else if (user) {
    const { data: profileRecord, error: profileError } = await serviceClient
      .from('profiles')
      .select('id, user_id')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profileRecord) {
      return NextResponse.json({ error: 'Target profile not found.' }, { status: 404 });
    }

    if (profileRecord.user_id && profileRecord.user_id !== user.id) {
      return NextResponse.json({ error: 'You cannot award actions for another profile.' }, { status: 403 });
    }
  }

  if (!profileId) {
    return NextResponse.json({ error: 'Unable to resolve profile.' }, { status: 400 });
  }

  try {
    const result = await recordGamificationAction({
      supabase: serviceClient,
      profileId,
      actionType,
      metadata,
    });

    return NextResponse.json({
      action: result.action,
      profile: result.profile,
      levelUp: result.levelUp,
      newlyAwardedBadges: result.newlyAwardedBadges,
      challengeUpdates: result.challengeUpdates,
    });
  } catch (error) {
    console.error('Gamification action error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to process gamification action.' },
      { status: 500 },
    );
  }
}
