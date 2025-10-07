import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-client'
import type { AdminUserRole, AuthenticatedProfileSummary } from '@/utils/types'

export async function GET() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Unable to load current auth user', authError)
      return NextResponse.json(
        { error: 'Unable to verify authentication.' },
        { status: 500 },
      )
    }

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        `id, display_name, avatar_url, is_admin, created_at, primary_role_id,
         profile_roles(role:roles(id, slug, name, description, priority))`,
      )
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Unable to load profile for authenticated user', profileError)
      return NextResponse.json(
        { error: 'Unable to load profile.' },
        { status: 500 },
      )
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    const roles: AdminUserRole[] =
      profile.profile_roles
        ?.map((entry) => entry.role)
        .filter((role): role is {
          id: string
          slug: string
          name: string
          description: string | null
          priority: number
        } => !!role)
        .map((role) => ({
          id: role.id,
          slug: role.slug,
          name: role.name,
          description: role.description,
          priority: role.priority,
        })) ?? []

    roles.sort((a, b) => a.priority - b.priority)

    const payload: AuthenticatedProfileSummary = {
      userId: user.id,
      email: user.email ?? '',
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url ?? null,
      isAdmin: profile.is_admin,
      createdAt: profile.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
      emailConfirmedAt: user.email_confirmed_at ?? null,
      primaryRoleId: profile.primary_role_id ?? null,
      roles,
    }

    return NextResponse.json({ profile: payload })
  } catch (error) {
    console.error('Unexpected error while resolving authenticated profile', error)
    return NextResponse.json(
      { error: 'Unexpected error while resolving authenticated profile.' },
      { status: 500 },
    )
  }
}
