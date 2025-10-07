import { NextResponse } from 'next/server'
import {
  createServerComponentClient,
  createServiceRoleClient,
} from '@/lib/supabase/server-client'
import type { AdminRole, CreateAdminUserPayload } from '@/utils/types'
import {
  fetchRoles,
  ensureRoleAssignments,
  buildUserSummary,
  fetchProfileById,
  loadAllUserSummaries,
} from './shared'

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
