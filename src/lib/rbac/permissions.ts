import type { AdminUserRole } from '@/utils/types'

export const canonicalRoleOrder = [
  'member',
  'contributor',
  'organizer',
  'moderator',
  'admin',
] as const

export type CanonicalRoleSlug = (typeof canonicalRoleOrder)[number]

const canonicalRoleWeights: Record<CanonicalRoleSlug, number> = {
  member: 0,
  contributor: 1,
  organizer: 2,
  moderator: 3,
  admin: 4,
}

const legacyRoleMappings: Record<string, CanonicalRoleSlug> = {
  member: 'member',
  contributor: 'contributor',
  organizer: 'organizer',
  moderator: 'moderator',
  admin: 'admin',
  author: 'contributor',
  editor: 'organizer',
}

export const normalizeRoleSlug = (value: string | null | undefined): CanonicalRoleSlug => {
  if (!value) {
    return 'member'
  }

  const normalized = value.trim().toLowerCase()
  return legacyRoleMappings[normalized] ?? 'member'
}

export const compareRolePriority = (
  left: CanonicalRoleSlug,
  right: CanonicalRoleSlug,
): number => canonicalRoleWeights[left] - canonicalRoleWeights[right]

export const getHighestRoleSlug = (
  roles: Array<Pick<AdminUserRole, 'slug'>>,
): CanonicalRoleSlug => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return 'member'
  }

  return roles
    .map((role) => normalizeRoleSlug(role.slug))
    .reduce<CanonicalRoleSlug>((highest, candidate) => {
      return canonicalRoleWeights[candidate] > canonicalRoleWeights[highest]
        ? candidate
        : highest
    }, 'member')
}

export const hasRoleAtLeast = (
  roles: Array<Pick<AdminUserRole, 'slug'>>,
  required: CanonicalRoleSlug,
): boolean => {
  const highest = getHighestRoleSlug(roles)
  return canonicalRoleWeights[highest] >= canonicalRoleWeights[required]
}

export interface RoleBadgeDescriptor {
  slug: CanonicalRoleSlug
  label: string
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'critical'
}

const roleBadgeBySlug: Record<CanonicalRoleSlug, RoleBadgeDescriptor> = {
  member: { slug: 'member', label: 'Member', tone: 'neutral' },
  contributor: { slug: 'contributor', label: 'Contributor', tone: 'info' },
  organizer: { slug: 'organizer', label: 'Organizer', tone: 'success' },
  moderator: { slug: 'moderator', label: 'Moderator', tone: 'warning' },
  admin: { slug: 'admin', label: 'Admin', tone: 'critical' },
}

export const getRoleBadge = (slug: string | null | undefined): RoleBadgeDescriptor =>
  roleBadgeBySlug[normalizeRoleSlug(slug)]

export const sortRolesAscending = (roles: AdminUserRole[]): AdminUserRole[] => {
  return [...roles].sort((a, b) =>
    compareRolePriority(normalizeRoleSlug(a.slug), normalizeRoleSlug(b.slug)),
  )
}

export const sortRolesDescending = (roles: AdminUserRole[]): AdminUserRole[] => {
  return [...roles].sort(
    (a, b) =>
      compareRolePriority(normalizeRoleSlug(b.slug), normalizeRoleSlug(a.slug)),
  )
}
