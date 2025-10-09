import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server-client';
import type { Database } from '@/lib/supabase/types';
import { loadLibraryStats } from '@/lib/library/stats-service';
import { LibraryDashboard } from '@/components/library/LibraryDashboard';

export const dynamic = 'force-dynamic';

export default async function LibraryOverviewPage() {
  const supabase = createServerComponentClient<Database>();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/me');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`);
  }

  if (!profile) {
    redirect('/signup');
  }

  const stats = await loadLibraryStats(profile.id, supabase, '30d');

  return (
    <LibraryDashboard
      initialStats={stats}
      profileName={profile.display_name ?? 'Reader'}
    />
  );
}
