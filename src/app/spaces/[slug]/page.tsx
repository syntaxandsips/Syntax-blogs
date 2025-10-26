import { notFound } from 'next/navigation'
import { isFeatureEnabled } from '@/lib/feature-flags/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { SpaceShell } from '@/components/spaces/SpaceShell'
import {
  normalizeRoleSlug,
  compareRolePriority,
  type CanonicalRoleSlug,
} from '@/lib/rbac/permissions'

interface SpaceRecord {
  id: string
  slug: string
  name: string
  description: string | null
  visibility: Database['public']['Enums']['space_visibility']
  space_rules: Array<{
    id: string
    title: string
    body: string
    kind: string
    position: number
  }>
  space_members: Array<{
    profile_id: string
    status: Database['public']['Enums']['space_membership_status']
    role_slug: string | null
    requested_at: string | null
    profiles: { display_name: string | null } | null
  }>
}

const fetchSpace = async (slug: string): Promise<SpaceRecord | null> => {
  const supabase = createServerClient<Database>()
  const { data, error } = await supabase
    .from('spaces')
    .select(
      `id, slug, name, description, visibility,
       space_rules(id, title, body, kind, position),
       space_members(profile_id, status, role_slug, requested_at, profiles:profile_id(display_name))
      `,
    )
    .eq('slug', slug)
    .maybeSingle<SpaceRecord>()

  if (error) {
    console.error('[spaces:detail] failed to load space', { error: error.message })
    throw new Error('Unable to load space')
  }

  return data ?? null
}

const resolveActorContext = async (spaceId: string): Promise<{
  role: CanonicalRoleSlug
  membership: { status: Database['public']['Enums']['space_membership_status']; role: CanonicalRoleSlug } | null
  isAdmin: boolean
}> => {
  const supabase = createServerClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { role: 'member', membership: null, isAdmin: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, primary_role_id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle<{ id: string; primary_role_id: string | null; is_admin: boolean }>()

  const membershipQuery = await supabase
    .from('space_members')
    .select('status, role_slug')
    .eq('space_id', spaceId)
    .eq('profile_id', profile?.id ?? '')
    .maybeSingle<{ status: Database['public']['Enums']['space_membership_status']; role_slug: string | null }>()

  const membership = membershipQuery.data
    ? {
        status: membershipQuery.data.status,
        role: normalizeRoleSlug(membershipQuery.data.role_slug ?? 'member'),
      }
    : null

  if (profile?.is_admin) {
    return { role: 'admin', membership, isAdmin: true }
  }

  let highest: CanonicalRoleSlug = 'member'
  if (profile?.primary_role_id) {
    const serviceClient = createServiceRoleClient<Database>()
    const { data: roleData } = await serviceClient
      .from('roles')
      .select('slug')
      .eq('id', profile.primary_role_id)
      .maybeSingle<{ slug: string | null }>()
    highest = normalizeRoleSlug(roleData?.slug)
  }

  return { role: highest, membership, isAdmin: false }
}

const canModerateSpace = (
  membershipRole: string | null,
  actorRole: CanonicalRoleSlug,
  isAdmin: boolean,
): boolean => {
  if (isAdmin) {
    return true
  }

  const normalizedMembership: CanonicalRoleSlug = membershipRole
    ? normalizeRoleSlug(membershipRole)
    : 'member'
  return (
    compareRolePriority(normalizedMembership, 'organizer') >= 0 ||
    compareRolePriority(normalizedMembership, 'moderator') >= 0 ||
    compareRolePriority(actorRole, 'organizer') >= 0
  )
}

const SpaceDetailPage = async ({ params }: { params: { slug: string } }) => {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    notFound()
  }

  const space = await fetchSpace(params.slug)
  if (!space) {
    notFound()
  }

  const actor = await resolveActorContext(space.id)

  const members = (space.space_members ?? []).map((member) => ({
    profileId: member.profile_id,
    displayName: member.profiles?.display_name ?? 'Anonymous member',
    status: member.status,
    role: member.role_slug,
    requestedAt: member.requested_at,
  }))

  const membershipStatus = actor.membership?.status ?? null
  const membershipRole = actor.membership?.role ?? null

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-10">
      <SpaceShell
        spaceId={space.id}
        slug={space.slug}
        name={space.name}
        description={space.description}
        visibility={space.visibility}
        membershipStatus={membershipStatus}
        membershipRole={membershipRole}
        rules={space.space_rules?.map((rule) => ({
          id: rule.id,
          title: rule.title,
          body: rule.body,
          kind: rule.kind,
          position: rule.position,
        })) ?? []}
        members={members}
        canModerate={canModerateSpace(membershipRole, actor.role, actor.isAdmin)}
      />
    </div>
  )
}

export default SpaceDetailPage
