import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { isFeatureEnabled } from '@/lib/feature-flags/server';
import { createServerComponentClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const rbacEnabled = await isFeatureEnabled('rbac_hardening_v1');
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`id, display_name, is_admin, primary_role:roles!profiles_primary_role_id_fkey(name)`)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`);
  }

  if (!profile || !profile.is_admin) {
    redirect('/admin/login?error=not_authorized');
  }

  const typedProfile = profile as {
    id: string;
    display_name: string | null;
    is_admin: boolean;
    primary_role?: { name?: string | null } | null;
  } | null;

  const primaryRoleLabel = (typedProfile?.primary_role?.name ?? '').trim()
    ? (typedProfile?.primary_role?.name as string)
    : typedProfile?.is_admin
      ? 'Administrator'
      : 'Member';

  return (
    <AdminDashboard
      profileId={profile.id}
      displayName={profile.display_name ?? user.email ?? 'Admin'}
      isAdmin={profile.is_admin}
      primaryRoleLabel={primaryRoleLabel}
      initialRbacEnabled={rbacEnabled}
    />
  );
}
