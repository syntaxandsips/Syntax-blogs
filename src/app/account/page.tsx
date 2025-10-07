import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server-client';
import { UserAccountPanel } from '@/components/auth/UserAccountPanel';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect_to=/account');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('display_name, is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`);
  }

  return (
    <UserAccountPanel
      email={user.email ?? ''}
      displayName={profile?.display_name ?? user.email ?? 'Friend'}
      isAdmin={Boolean(profile?.is_admin)}
    />
  );
}
