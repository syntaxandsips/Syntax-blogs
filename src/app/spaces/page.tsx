import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isFeatureEnabled } from '@/lib/feature-flags/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { normalizeRoleSlug } from '@/lib/rbac/permissions'

const fetchSpaces = async () => {
  const supabase = createServerClient<Database>()
  const { data, error } = await supabase
    .from('spaces')
    .select('id, slug, name, description, visibility')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[spaces:list] failed to load', { error: error.message })
    throw new Error('Unable to load spaces')
  }

  return data ?? []
}

const resolveHighestRole = async () => {
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

const canCreateSpace = (role: string) => {
  return ['organizer', 'moderator', 'admin'].includes(role)
}

const SpacesPage = async () => {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    notFound()
  }

  const [spaces, highestRole] = await Promise.all([fetchSpaces(), resolveHighestRole()])

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-10">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-black uppercase text-black">Spaces</h1>
          <p className="mt-2 max-w-2xl text-base text-black/70">
            Discover curated communities with shared rituals, moderated programs, and bespoke content templates. Spaces roll out
            gradually to ensure healthy collaboration.
          </p>
        </div>
        {canCreateSpace(highestRole) ? (
          <Link
            href="/spaces/new"
            className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#118AB2] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition hover:-translate-y-[1px]"
          >
            Create a space
          </Link>
        ) : null}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {spaces.length === 0 ? (
          <p className="rounded-3xl border-4 border-dashed border-black px-6 py-8 text-center text-sm text-black/60">
            No spaces have launched yet. Check back soon as we onboard the first pilot communities.
          </p>
        ) : (
          spaces.map((space) => (
            <Link
              key={space.id}
              href={`/spaces/${space.slug}`}
              className="group rounded-3xl border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] transition hover:-translate-y-[2px]"
            >
              <h2 className="text-2xl font-black uppercase text-black">{space.name}</h2>
              <p className="mt-2 text-sm text-black/70">{space.description ?? 'No description yet.'}</p>
              <span className="mt-4 inline-flex rounded-full border-2 border-black bg-[#FFD166] px-3 py-1 text-xs font-bold uppercase text-black">
                {space.visibility} visibility
              </span>
            </Link>
          ))
        )}
      </section>
    </div>
  )
}

export default SpacesPage
