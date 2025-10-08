import { NextResponse } from 'next/server'
import {
  createServerComponentClient,
  createServiceRoleClient,
} from '@/lib/supabase/server-client'
import type { UpdateAdminUserPayload } from '@/utils/types'
import {
  fetchRoles,
  fetchProfileById,
  ensureRoleAssignments,
  buildUserSummary,
} from '../shared'

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const { id: profileId } = await params
  if (!profileId) {
    return NextResponse.json({ error: 'Profile id is required.' }, { status: 400 })
  }

  const body = (await request.json()) as Partial<UpdateAdminUserPayload>

  const displayName = sanitizeDisplayName(body?.displayName)
  const requestedRoles = sanitizeRoleSlugs(body?.roleSlugs)
  const isAdmin = Boolean(body?.isAdmin) || requestedRoles.includes('admin')
  const newPassword = sanitizePassword(body?.newPassword)

  if (!displayName) {
    return NextResponse.json({ error: 'Display name is required.' }, { status: 400 })
  }

  const serviceClient = createServiceRoleClient()

  try {
    const profileRecord = await fetchProfileById(serviceClient, profileId)

    const roles = await fetchRoles(serviceClient)

    const { error: profileUpdateError } = await serviceClient
      .from('profiles')
      .update({ display_name: displayName, is_admin: isAdmin })
      .eq('id', profileId)

    if (profileUpdateError) {
      throw new Error(`Unable to update profile: ${profileUpdateError.message}`)
    }

    await ensureRoleAssignments(serviceClient, profileId, roles, requestedRoles, isAdmin)

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long.' },
          { status: 400 },
        )
      }

      const { error: passwordError } = await serviceClient.auth.admin.updateUserById(
        profileRecord.user_id,
        { password: newPassword },
      )

      if (passwordError) {
        throw new Error(`Unable to update password: ${passwordError.message}`)
      }
    }

    const refreshedProfile = await fetchProfileById(serviceClient, profileId)
    const summary = await buildUserSummary(serviceClient, refreshedProfile)

    return NextResponse.json({ user: summary })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update user.'
    let status = 500
    if (error instanceof Error) {
      if (message.startsWith('Unknown role slug')) {
        status = 400
      } else if (message.includes('Profile not found')) {
        status = 404
      }
    }
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const { id: currentProfileId } = result.profile

  const { id: profileId } = await params
  if (!profileId) {
    return NextResponse.json({ error: 'Profile id is required.' }, { status: 400 })
  }

  if (profileId === currentProfileId) {
    return NextResponse.json(
      { error: 'You cannot delete your own account.' },
      { status: 400 },
    )
  }

  const serviceClient = createServiceRoleClient()

  try {
    const profileRecord = await fetchProfileById(serviceClient, profileId)

    const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(
      profileRecord.user_id,
    )

    if (authDeleteError) {
      throw new Error(`Unable to delete auth user: ${authDeleteError.message}`)
    }

    const { error: profileDeleteError } = await serviceClient
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (profileDeleteError) {
      throw new Error(`Unable to delete profile: ${profileDeleteError.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete user.'
    let status = 500
    if (error instanceof Error && message.includes('Profile not found')) {
      status = 404
    }
    return NextResponse.json({ error: message }, { status })
  }
}
