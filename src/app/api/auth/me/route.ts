import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-client'
import type {
  AdminUserRole,
  AuthenticatedProfileSummary,
  ProfileOnboardingJourney,
} from '@/utils/types'

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

    const rawRoles = Array.isArray(profile.profile_roles) ? profile.profile_roles : []
    const roles: AdminUserRole[] = []

    for (const entry of rawRoles) {
      const role = entry?.role

      if (!role || typeof role !== 'object') {
        continue
      }

      const idValue = (role as { id?: unknown }).id
      const slugValue = (role as { slug?: unknown }).slug
      const nameValue = (role as { name?: unknown }).name
      const descriptionValue = (role as { description?: unknown }).description
      const priorityValue = (role as { priority?: unknown }).priority

      if (typeof idValue !== 'string' || typeof slugValue !== 'string' || typeof nameValue !== 'string') {
        continue
      }

      const description = typeof descriptionValue === 'string' ? descriptionValue : null
      const priority = typeof priorityValue === 'number' ? priorityValue : Number(priorityValue ?? 0)

      roles.push({
        id: idValue,
        slug: slugValue,
        name: nameValue,
        description,
        priority,
      })
    }

    roles.sort((a, b) => a.priority - b.priority)

    const { data: onboardingRecord, error: onboardingError } = await supabase
      .from('profile_onboarding_journeys')
      .select('status, current_step, completed_at, updated_at, version, responses')
      .eq('profile_id', profile.id)
      .maybeSingle()

    if (onboardingError) {
      console.error('Unable to load onboarding journey for authenticated user', onboardingError)
    }

    const onboarding: ProfileOnboardingJourney | null = onboardingRecord
      ? {
          status: onboardingRecord.status ?? 'pending',
          currentStep: onboardingRecord.current_step ?? null,
          completedAt: onboardingRecord.completed_at ?? null,
          updatedAt: onboardingRecord.updated_at ?? null,
          version: onboardingRecord.version ?? null,
          responses: (onboardingRecord.responses as ProfileOnboardingJourney['responses']) ?? null,
        }
      : null

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
      onboarding,
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
