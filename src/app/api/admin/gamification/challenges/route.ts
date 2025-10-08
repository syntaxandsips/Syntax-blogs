import { NextResponse } from 'next/server';
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';

const ensureAdmin = async () => {
  const authClient = createServerComponentClient();
  const serviceClient = createServiceRoleClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    throw Object.assign(new Error('Authentication required.'), { status: 401 });
  }

  const { data: profile, error } = await serviceClient
    .from('profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw Object.assign(new Error(error.message), { status: 500 });
  }

  if (!profile || !profile.is_admin) {
    throw Object.assign(new Error('Admin access required.'), { status: 403 });
  }

  return { serviceClient, profileId: profile.id as string };
};

export async function GET() {
  try {
    const { serviceClient } = await ensureAdmin();

    const { data, error } = await serviceClient
      .from('gamification_challenges')
      .select('id, slug, title, cadence, requirements, reward_points, reward_badge_id, starts_at, ends_at, created_at, updated_at, is_active')
      .order('starts_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ challenges: data ?? [] });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load challenges.' },
      { status },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { serviceClient, profileId } = await ensureAdmin();
    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const challenge = {
      slug: typeof payload.slug === 'string' ? payload.slug : null,
      title: typeof payload.title === 'string' ? payload.title : null,
      cadence: typeof payload.cadence === 'string' ? payload.cadence : 'weekly',
      requirements: payload.requirements,
      reward_points: typeof payload.reward_points === 'number' ? payload.reward_points : 0,
      reward_badge_id: typeof payload.reward_badge_id === 'string' ? payload.reward_badge_id : null,
      starts_at: typeof payload.starts_at === 'string' ? payload.starts_at : new Date().toISOString(),
      ends_at: typeof payload.ends_at === 'string' ? payload.ends_at : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
    };

    if (!challenge.slug || !challenge.title || typeof challenge.requirements !== 'object') {
      return NextResponse.json({ error: 'Invalid challenge payload.' }, { status: 400 });
    }

    const { data, error } = await serviceClient
      .from('gamification_challenges')
      .insert(challenge)
      .select('id, slug, title, cadence, requirements, reward_points, reward_badge_id, starts_at, ends_at, created_at, updated_at, is_active')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await serviceClient.from('gamification_audit').insert({
      profile_id: profileId,
      action: 'challenge.create',
      delta: null,
      reason: challenge.slug,
      performed_by: profileId,
    });

    return NextResponse.json({ challenge: data }, { status: 201 });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create challenge.' },
      { status },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { serviceClient, profileId } = await ensureAdmin();
    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const id = typeof payload.id === 'string' ? payload.id : null;

    if (!id) {
      return NextResponse.json({ error: 'Challenge id required.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(payload)) {
      if (
        ['slug', 'title', 'cadence', 'requirements', 'reward_points', 'reward_badge_id', 'starts_at', 'ends_at', 'is_active'].includes(
          key,
        )
      ) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided.' }, { status: 400 });
    }

    const { data, error } = await serviceClient
      .from('gamification_challenges')
      .update(updates)
      .eq('id', id)
      .select('id, slug, title, cadence, requirements, reward_points, reward_badge_id, starts_at, ends_at, created_at, updated_at, is_active')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await serviceClient.from('gamification_audit').insert({
      profile_id: profileId,
      action: 'challenge.update',
      delta: null,
      reason: id,
      performed_by: profileId,
    });

    return NextResponse.json({ challenge: data });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update challenge.' },
      { status },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { serviceClient, profileId } = await ensureAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Challenge id required.' }, { status: 400 });
    }

    const { error } = await serviceClient.from('gamification_challenges').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await serviceClient.from('gamification_audit').insert({
      profile_id: profileId,
      action: 'challenge.delete',
      delta: null,
      reason: id,
      performed_by: profileId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete challenge.' },
      { status },
    );
  }
}
