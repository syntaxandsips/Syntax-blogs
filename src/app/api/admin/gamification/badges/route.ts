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
      .from('gamification_badges')
      .select('id, slug, name, description, category, rarity, requirements, is_time_limited, available_from, available_to, created_at, updated_at');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: ownershipRows, error: countsError } = await serviceClient
      .from('profile_badges')
      .select('badge_id');

    if (countsError) {
      return NextResponse.json({ error: countsError.message }, { status: 500 });
    }

    const ownershipCounts = new Map<string, number>();

    for (const entry of ownershipRows ?? []) {
      const id = entry.badge_id as string;
      ownershipCounts.set(id, (ownershipCounts.get(id) ?? 0) + 1);
    }

    const badges = (data ?? []).map((row) => ({
      ...row,
      ownershipCount: ownershipCounts.get(row.id as string) ?? 0,
    }));

    return NextResponse.json({ badges });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load badges.' },
      { status },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { serviceClient, profileId } = await ensureAdmin();
    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const badge = {
      slug: typeof payload.slug === 'string' ? payload.slug : null,
      name: typeof payload.name === 'string' ? payload.name : null,
      description: typeof payload.description === 'string' ? payload.description : null,
      category: typeof payload.category === 'string' ? payload.category : null,
      rarity: typeof payload.rarity === 'string' ? payload.rarity : 'common',
      requirements: payload.requirements,
      is_time_limited: Boolean(payload.is_time_limited),
      available_from: typeof payload.available_from === 'string' ? payload.available_from : null,
      available_to: typeof payload.available_to === 'string' ? payload.available_to : null,
    };

    if (!badge.slug || !badge.name || !badge.category || typeof badge.requirements !== 'object') {
      return NextResponse.json({ error: 'Invalid badge payload.' }, { status: 400 });
    }

    const { data, error } = await serviceClient
      .from('gamification_badges')
      .insert(badge)
      .select('id, slug, name, description, category, rarity, requirements, is_time_limited, available_from, available_to, created_at, updated_at')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await serviceClient.from('gamification_audit').insert({
      profile_id: profileId,
      action: 'badge.create',
      delta: null,
      reason: badge.slug,
      performed_by: profileId,
    });

    return NextResponse.json({ badge: data }, { status: 201 });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create badge.' },
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
      return NextResponse.json({ error: 'Badge id required.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(payload)) {
      if (['name', 'description', 'category', 'rarity', 'requirements', 'is_time_limited', 'available_from', 'available_to', 'slug'].includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided.' }, { status: 400 });
    }

    const { data, error } = await serviceClient
      .from('gamification_badges')
      .update(updates)
      .eq('id', id)
      .select('id, slug, name, description, category, rarity, requirements, is_time_limited, available_from, available_to, created_at, updated_at')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await serviceClient.from('gamification_audit').insert({
      profile_id: profileId,
      action: 'badge.update',
      delta: null,
      reason: id,
      performed_by: profileId,
    });

    return NextResponse.json({ badge: data });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update badge.' },
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
      return NextResponse.json({ error: 'Badge id required.' }, { status: 400 });
    }

    const { error } = await serviceClient.from('gamification_badges').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await serviceClient.from('gamification_audit').insert({
      profile_id: profileId,
      action: 'badge.delete',
      delta: null,
      reason: id,
      performed_by: profileId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete badge.' },
      { status },
    );
  }
}
