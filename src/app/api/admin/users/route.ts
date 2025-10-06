import { NextResponse } from 'next/server'
import {
  createServerComponentClient,
  createServiceRoleClient,
} from '@/lib/supabase/server-client'
import type {
  AdminRole,
  AdminUserRole,
  AdminUserSummary,
  CreateAdminUserPayload,
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

const getAdminProfile = async (): Promise<
  | { response: NextResponse }
  | { profile: { id: string } }
> => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return {
      response: NextResponse.json(
        { error: `Unable to load profile: ${error.message}` },
        { status: 500 },
      ),
    }
  }

  if (!profile || !profile.is_admin) {
    return {
      response: NextResponse.json(
        { error: 'Forbidden: admin access required.' },
        { status: 403 },
      ),
    }
  }

  return { profile: { id: profile.id } }
}

const sanitizeEmail = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return trimmed.toLowerCase()
}

const sanitizeDisplayName = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const sanitizePassword = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const sanitizeRoleSlugs = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const slugs = new Set<string>()
  for (const entry of value) {
    if (typeof entry === 'string' && entry.trim().length > 0) {
      slugs.add(entry.trim())
    }
  }
  return Array.from(slugs)
}

export const fetchRoles = async (
  serviceClient: ReturnType<typeof createServiceRoleClient>,
) => {
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
    throw new Error(`Unable to load current role assignments: ${existingRoleError.message}`)
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
    throw new Error(`Unable to update profile role metadata: ${profileUpdateError.message}`)
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
    const { data, error } = await serviceClient.auth.admin.getUserById(profile.user_id)
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

  return data as ProfileRecord
}

const loadAllUserSummaries = async (
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

  const profileRecords = (profiles ?? []) as ProfileRecord[]

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

export async function GET() {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  try {
    const serviceClient = createServiceRoleClient()
    const [roles, users] = await Promise.all([
      fetchRoles(serviceClient),
      loadAllUserSummaries(serviceClient),
    ])

    const formattedRoles: AdminRole[] = roles.map((role) => ({
      id: role.id,
      slug: role.slug,
      name: role.name,
      description: role.description,
      priority: role.priority,
    }))

    return NextResponse.json({ users, roles: formattedRoles })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load users.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const body = (await request.json()) as Partial<CreateAdminUserPayload>

  const email = sanitizeEmail(body?.email)
  const password = sanitizePassword(body?.password)
  const displayName = sanitizeDisplayName(body?.displayName)
  const isAdmin = Boolean(body?.isAdmin)
  const requestedRoles = sanitizeRoleSlugs(body?.roleSlugs)

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters long.' },
      { status: 400 },
    )
  }

  if (!displayName) {
    return NextResponse.json({ error: 'Display name is required.' }, { status: 400 })
  }

  const serviceClient = createServiceRoleClient()

  try {
    const roles = await fetchRoles(serviceClient)

    const { data: authResult, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      throw new Error(`Unable to create user: ${authError.message}`)
    }

    const authUser = authResult.user
    if (!authUser) {
      throw new Error('Unable to create user: missing auth record.')
    }

    const { data: profileData, error: profileError } = await serviceClient
      .from('profiles')
      .insert({
        user_id: authUser.id,
        display_name: displayName,
        is_admin: isAdmin,
      })
      .select(
        `id, user_id, display_name, is_admin, created_at, primary_role_id,
         profile_roles(role:roles(id, slug, name, description, priority))`,
      )
      .single()

    if (profileError || !profileData) {
      throw new Error(
        `Unable to provision profile: ${profileError?.message ?? 'missing record.'}`,
      )
    }

    await ensureRoleAssignments(serviceClient, profileData.id, roles, requestedRoles, isAdmin)

    const refreshedProfile = await fetchProfileById(serviceClient, profileData.id)
    const summary = await buildUserSummary(serviceClient, refreshedProfile)

    return NextResponse.json({ user: summary })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create user.'
    const status =
      error instanceof Error && message.startsWith('Unknown role slug') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
