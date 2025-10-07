import { createServiceRoleClient } from '@/lib/supabase/server-client'
import type {
  AdminRole,
  AdminUserRole,
  AdminUserSummary,
} from '@/utils/types'

export interface ProfileRecord {
  id: string
  user_id: string
  display_name: string
  is_admin: boolean
  created_at: string
  primary_role_id: string | null
  profile_roles: Array<{
    role: {
      id: string
      slug: string
      name: string
      description: string | null
      priority: number
    } | null
  }> | null
}

export interface RoleRecord {
  id: string
  slug: string
  name: string
  description: string | null
  priority: number
}

export const fetchRoles = async (
  serviceClient: ReturnType<typeof createServiceRoleClient>,
): Promise<RoleRecord[]> => {
  const { data, error } = await serviceClient
    .from('roles')
    .select('id, slug, name, description, priority')
    .order('priority', { ascending: true })

  if (error) {
    throw new Error(`Unable to load roles: ${error.message}`)
  }

  return (data ?? []) as RoleRecord[]
}

export const ensureRoleAssignments = async (
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  profileId: string,
  allRoles: RoleRecord[],
  requestedSlugs: string[],
  isAdmin: boolean,
): Promise<AdminUserRole[]> => {
  const roleMap = new Map<string, RoleRecord>(
    allRoles.map((role) => [role.slug, role]),
  )

  const finalSlugs = new Set<string>(requestedSlugs)
  finalSlugs.add('member')

  if (isAdmin) {
    finalSlugs.add('admin')
  } else {
    finalSlugs.delete('admin')
  }

  const resolvedRoles: RoleRecord[] = []
  for (const slug of finalSlugs) {
    const role = roleMap.get(slug)
    if (!role) {
      throw new Error(`Unknown role slug: ${slug}`)
    }
    resolvedRoles.push(role)
  }

  const finalRoleIds = new Set(resolvedRoles.map((role) => role.id))

  const { data: existingRoleRows, error: existingRoleError } = await serviceClient
    .from('profile_roles')
    .select('role_id')
    .eq('profile_id', profileId)

  if (existingRoleError) {
    throw new Error(
      `Unable to load current role assignments: ${existingRoleError.message}`,
    )
  }

  const existingRoleIds = new Set<string>(
    (existingRoleRows ?? []).map((row) => row.role_id as string),
  )

  const rolesToInsert = [...finalRoleIds].filter((id) => !existingRoleIds.has(id))
  const rolesToRemove = [...existingRoleIds].filter((id) => !finalRoleIds.has(id))

  if (rolesToInsert.length > 0) {
    const { error: insertError } = await serviceClient
      .from('profile_roles')
      .insert(
        rolesToInsert.map((roleId) => ({
          profile_id: profileId,
          role_id: roleId,
        })),
      )

    if (insertError) {
      throw new Error(`Unable to assign roles: ${insertError.message}`)
    }
  }

  if (rolesToRemove.length > 0) {
    const { error: deleteError } = await serviceClient
      .from('profile_roles')
      .delete()
      .eq('profile_id', profileId)
      .in('role_id', rolesToRemove)

    if (deleteError) {
      throw new Error(`Unable to remove outdated roles: ${deleteError.message}`)
    }
  }

  const sortedRoles = [...resolvedRoles].sort((a, b) => a.priority - b.priority)
  const primaryRoleId = sortedRoles[0]?.id ?? null

  const { error: profileUpdateError } = await serviceClient
    .from('profiles')
    .update({
      is_admin: isAdmin,
      primary_role_id: primaryRoleId,
    })
    .eq('id', profileId)

  if (profileUpdateError) {
    throw new Error(
      `Unable to update profile role metadata: ${profileUpdateError.message}`,
    )
  }

  return sortedRoles.map((role) => ({
    id: role.id,
    slug: role.slug,
    name: role.name,
    description: role.description,
    priority: role.priority,
  }))
}

export const buildUserSummary = async (
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  profile: ProfileRecord,
  emailMap?: Map<string, string>,
): Promise<AdminUserSummary> => {
  let email = ''

  if (emailMap?.has(profile.user_id)) {
    email = emailMap.get(profile.user_id) ?? ''
  } else {
    const { data, error } = await serviceClient.auth.admin.getUserById(
      profile.user_id,
    )
    if (error) {
      throw new Error(`Unable to load auth user: ${error.message}`)
    }
    email = data.user?.email ?? ''
  }

  const roles: AdminUserRole[] =
    profile.profile_roles
      ?.map((entry) => entry.role)
      .filter((role): role is RoleRecord => !!role)
      .map((role) => ({
        id: role.id,
        slug: role.slug,
        name: role.name,
        description: role.description,
        priority: role.priority,
      })) ?? []

  roles.sort((a, b) => a.priority - b.priority)

  return {
    profileId: profile.id,
    userId: profile.user_id,
    email,
    displayName: profile.display_name,
    isAdmin: profile.is_admin,
    createdAt: profile.created_at,
    primaryRoleId: profile.primary_role_id ?? null,
    roles,
  }
}

export const fetchProfileById = async (
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  profileId: string,
): Promise<ProfileRecord> => {
  const { data, error } = await serviceClient
    .from('profiles')
    .select(
      `id, user_id, display_name, is_admin, created_at, primary_role_id,
       profile_roles(role:roles(id, slug, name, description, priority))`,
    )
    .eq('id', profileId)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`)
  }

  if (!data) {
    throw new Error('Profile not found.')
  }

  return data as unknown as ProfileRecord
}

export const loadAllUserSummaries = async (
  serviceClient: ReturnType<typeof createServiceRoleClient>,
): Promise<AdminUserSummary[]> => {
  const { data: profiles, error: profilesError } = await serviceClient
    .from('profiles')
    .select(
      `id, user_id, display_name, is_admin, created_at, primary_role_id,
       profile_roles(role:roles(id, slug, name, description, priority))`,
    )
    .order('created_at', { ascending: false })

  if (profilesError) {
    throw new Error(`Unable to load profiles: ${profilesError.message}`)
  }

  const profileRecords = (profiles ?? []) as unknown as ProfileRecord[]

  const emailMap = new Map<string, string>()
  let page = 1

  while (true) {
    const { data: pageData, error: pageError } = await serviceClient.auth.admin.listUsers({
      page,
      perPage: 1000,
    })

    if (pageError) {
      throw new Error(`Unable to load user directory: ${pageError.message}`)
    }

    for (const user of pageData.users ?? []) {
      if (user.id) {
        emailMap.set(user.id, user.email ?? '')
      }
    }

    if (!pageData.nextPage) {
      break
    }

    page = pageData.nextPage
  }

  return Promise.all(
    profileRecords.map((profile) => buildUserSummary(serviceClient, profile, emailMap)),
  )
}

export type { AdminRole, AdminUserRole, AdminUserSummary }
