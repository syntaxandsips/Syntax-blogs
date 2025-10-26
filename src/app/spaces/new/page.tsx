import { notFound } from 'next/navigation'
import { isFeatureEnabled } from '@/lib/feature-flags/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { normalizeRoleSlug } from '@/lib/rbac/permissions'
import { CreateSpaceForm } from '@/components/spaces/CreateSpaceForm'

const resolveRole = async () => {
  const supabase = createServerClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 'member' as const
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('primary_role_id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle<{ primary_role_id: string | null; is_admin: boolean }>()

  if (profile?.is_admin) {
    return 'admin' as const
  }

  if (!profile?.primary_role_id) {
    return 'member' as const
  }

  const serviceClient = createServiceRoleClient<Database>()
  const { data: role } = await serviceClient
    .from('roles')
    .select('slug')
    .eq('id', profile.primary_role_id)
    .maybeSingle<{ slug: string | null }>()

  return normalizeRoleSlug(role?.slug) as ReturnType<typeof normalizeRoleSlug>
}

const allowedRoles = new Set(['organizer', 'moderator', 'admin'])

const CreateSpacePage = async () => {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    notFound()
  }

  const role = await resolveRole()
  if (!allowedRoles.has(role)) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-black uppercase text-black">Create a new space</h1>
        <p className="text-sm text-black/70">
          Launch a dedicated community with curated programming, templates, and moderation tools. Only pilot organizers can
          create spaces during the staff rollout.
        </p>
      </header>
      <CreateSpaceForm defaultVisibility="private" />
    </div>
  )
}

export default CreateSpacePage
