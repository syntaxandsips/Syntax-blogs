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

  return { serviceClient };
};

export async function GET() {
  try {
    const { serviceClient } = await ensureAdmin();

    const [{ data: profileMetrics, error: profileError }, { data: actionMetrics, error: actionError }] = await Promise.all([
      serviceClient
        .from('gamification_profiles')
        .select('level, xp_total, current_streak, longest_streak, created_at'),
      serviceClient
        .from('gamification_actions')
        .select('action_type, points, xp, awarded_at'),
    ]);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (actionError) {
      return NextResponse.json({ error: actionError.message }, { status: 500 });
    }

    const totalProfiles = profileMetrics?.length ?? 0;
    const xpTotals = (profileMetrics ?? []).map((row) => Number(row.xp_total ?? 0));
    const averageXp = xpTotals.length ? xpTotals.reduce((sum, xp) => sum + xp, 0) / xpTotals.length : 0;
    const levelDistribution = new Map<number, number>();

    for (const row of profileMetrics ?? []) {
      const level = Number(row.level ?? 1);
      levelDistribution.set(level, (levelDistribution.get(level) ?? 0) + 1);
    }

    const streakLeaders = (profileMetrics ?? [])
      .sort((a, b) => Number(b.current_streak ?? 0) - Number(a.current_streak ?? 0))
      .slice(0, 10)
      .map((row) => ({
        level: Number(row.level ?? 1),
        currentStreak: Number(row.current_streak ?? 0),
        longestStreak: Number(row.longest_streak ?? 0),
        joinedAt: row.created_at as string,
      }));

    const actionsByType = new Map<string, { count: number; totalPoints: number; totalXp: number }>();

    for (const row of actionMetrics ?? []) {
      const type = (row.action_type as string) ?? 'unknown';
      const entry = actionsByType.get(type) ?? { count: 0, totalPoints: 0, totalXp: 0 };
      entry.count += 1;
      entry.totalPoints += Number(row.points ?? 0);
      entry.totalXp += Number(row.xp ?? 0);
      actionsByType.set(type, entry);
    }

    const actions = Array.from(actionsByType.entries()).map(([actionType, value]) => ({
      actionType,
      count: value.count,
      totalPoints: value.totalPoints,
      totalXp: value.totalXp,
    }));

    const weeklyActions = (actionMetrics ?? []).filter((row) => {
      const awardedAt = row.awarded_at ? Date.parse(row.awarded_at as string) : NaN;
      if (Number.isNaN(awardedAt)) {
        return false;
      }

      const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
      return awardedAt >= sevenDaysAgo;
    }).length;

    return NextResponse.json({
      totals: {
        totalProfiles,
        averageXp,
        weeklyActions,
      },
      levelDistribution: Array.from(levelDistribution.entries()).map(([level, count]) => ({ level, count })),
      streakLeaders,
      actions,
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load gamification analytics.' },
      { status },
    );
  }
}
