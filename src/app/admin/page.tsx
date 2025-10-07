import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { createServerComponentClient } from '@/lib/supabase/server-client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/me')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`)
  }

  if (!profile || !profile.is_admin) {
    redirect('/me?error=not_authorized')
  }

  return (
    <AdminDashboard
      profileId={profile.id}
      displayName={profile.display_name ?? user.email ?? 'Admin'}
      isAdmin={profile.is_admin}
    />
  )
}
