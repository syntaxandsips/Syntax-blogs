import { NextResponse } from 'next/server';
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client';
import { fetchFullGamificationProfile, updateGamificationSettings } from '@/lib/gamification/profile-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authClient = createServerComponentClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const serviceClient = createServiceRoleClient();
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

  const profileId = profileRecord.id as string;

  try {
    const fullProfile = await fetchFullGamificationProfile(serviceClient, profileId);

    if (!fullProfile) {
      return NextResponse.json({ error: 'Gamification profile missing.' }, { status: 404 });
    }

    return NextResponse.json(fullProfile);
  } catch (error) {
    console.error('Gamification profile load failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load gamification profile.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const authClient = createServerComponentClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const allowedKeys = new Set(['optedIn', 'showcaseBadges', 'emailNotifications', 'betaTester']);
  const settings: Record<string, boolean> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (!allowedKeys.has(key)) {
      continue;
    }

    if (typeof value === 'boolean') {
      settings[key] = value;
    }
  }

  if (Object.keys(settings).length === 0) {
    return NextResponse.json({ error: 'No valid settings provided.' }, { status: 400 });
  }

  const serviceClient = createServiceRoleClient();
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

  try {
    const updatedProfile = await updateGamificationSettings(serviceClient, profileRecord.id as string, settings);
    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Gamification settings update failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update gamification settings.' },
      { status: 500 },
    );
  }
}
