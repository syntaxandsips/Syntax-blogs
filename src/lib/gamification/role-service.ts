import type { SupabaseClient } from './types'

const LEVEL_ROLE_THRESHOLDS: Array<{ level: number; roleSlug: string }> = [
  { level: 2, roleSlug: 'community-member' },
  { level: 3, roleSlug: 'trusted-voice' },
  { level: 4, roleSlug: 'community-moderator' },
  { level: 5, roleSlug: 'syntax-sage' },
]

const BADGE_ROLE_MAPPINGS: Array<{ badgeSlug: string; roleSlug: string }> = [
  { badgeSlug: 'community-barista', roleSlug: 'community-moderator' },
  { badgeSlug: 'seasonal-taster', roleSlug: 'event-host' },
]

const fetchRoleIds = async (supabase: SupabaseClient, slugs: string[]) => {
  if (!slugs.length) return new Map<string, string>()

  const { data, error } = await supabase
    .from('roles')
    .select('id, slug')
    .in('slug', slugs)

  if (error) {
    console.error('Unable to fetch role ids for gamification', error)
    return new Map<string, string>()
  }

  const map = new Map<string, string>()
  for (const role of data ?? []) {
    if (role && typeof role.slug === 'string' && typeof role.id === 'string') {
      map.set(role.slug, role.id)
    }
  }
  return map
}

const fetchOwnedBadges = async (supabase: SupabaseClient, profileId: string) => {
  const { data, error } = await supabase
    .from('profile_badges')
    .select('badges:badge_id (slug)')
    .eq('profile_id', profileId)

  if (error) {
    console.error('Unable to fetch owned badges for role mapping', error)
    return new Set<string>()
  }

  const slugs = new Set<string>()
  for (const entry of data ?? []) {
    const slug = Array.isArray(entry.badges) ? entry.badges[0]?.slug : (entry as any)?.badges?.slug
    if (typeof slug === 'string') {
      slugs.add(slug)
    }
  }
  return slugs
}

export const syncRolesForProfile = async (
  profile: { profileId: string; level: number },
  supabase: SupabaseClient,
) => {
  const eligibleRoleSlugs = new Set<string>()

  for (const mapping of LEVEL_ROLE_THRESHOLDS) {
    if (profile.level >= mapping.level) {
      eligibleRoleSlugs.add(mapping.roleSlug)
    }
  }

  const ownedBadges = await fetchOwnedBadges(supabase, profile.profileId)

  for (const mapping of BADGE_ROLE_MAPPINGS) {
    if (ownedBadges.has(mapping.badgeSlug)) {
      eligibleRoleSlugs.add(mapping.roleSlug)
    }
  }

  if (!eligibleRoleSlugs.size) {
    return
  }

  const roleIdMap = await fetchRoleIds(supabase, Array.from(eligibleRoleSlugs))

  const { data: existingRoles, error: profileRolesError } = await supabase
    .from('profile_roles')
    .select('id, role_id, roles:role_id (slug)')
    .eq('profile_id', profile.profileId)

  if (profileRolesError) {
    console.error('Unable to fetch existing profile roles', profileRolesError)
    return
  }

  const ownedRoleSlugs = new Set<string>()
  const roleIdBySlug = new Map<string, string>()

  for (const entry of existingRoles ?? []) {
    const slug = Array.isArray(entry.roles) ? entry.roles[0]?.slug : (entry as any)?.roles?.slug
    if (typeof slug === 'string') {
      ownedRoleSlugs.add(slug)
      if (typeof entry.role_id === 'string') {
        roleIdBySlug.set(slug, entry.role_id)
      }
    }
  }

  const rolesToAssign: Array<{ profile_id: string; role_id: string }> = []

  for (const slug of eligibleRoleSlugs) {
    if (ownedRoleSlugs.has(slug)) {
      continue
    }
    const roleId = roleIdMap.get(slug)
    if (roleId) {
      rolesToAssign.push({ profile_id: profile.profileId, role_id: roleId })
    }
  }

  if (rolesToAssign.length) {
    const { error: insertError } = await supabase.from('profile_roles').insert(rolesToAssign)
    if (insertError) {
      console.error('Unable to assign gamification roles', insertError)
    }
  }

  for (const ownedSlug of ownedRoleSlugs) {
    if (!eligibleRoleSlugs.has(ownedSlug)) {
      const roleId = roleIdBySlug.get(ownedSlug)
      if (!roleId) continue
      const { error: deleteError } = await supabase
        .from('profile_roles')
        .delete()
        .eq('profile_id', profile.profileId)
        .eq('role_id', roleId)
      if (deleteError) {
        console.error('Unable to remove outdated gamification role', deleteError)
      }
    }
  }
}
