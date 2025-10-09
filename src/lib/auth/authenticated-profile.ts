import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type {
  AdminUserRole,
  AuthenticatedProfileSummary,
  OnboardingAccountability,
  OnboardingCommunication,
  OnboardingContribution,
  OnboardingExperienceLevel,
  OnboardingGoal,
  OnboardingLearningFormat,
  OnboardingPersona,
  OnboardingSupportPreference,
  ProfileOnboardingJourney,
  ProfileOnboardingResponses,
} from '@/utils/types'

const toNullableString = <T extends string>(value: unknown): T | null =>
  typeof value === 'string' ? (value as T) : null

const toStringArray = <T extends string>(value: unknown): T[] =>
  Array.isArray(value) ? value.filter((entry): entry is T => typeof entry === 'string') : []

const parseOnboardingResponses = (payload: unknown): ProfileOnboardingResponses | null => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const source = payload as Record<string, unknown>

  return {
    persona: toNullableString<OnboardingPersona>(source.persona),
    experienceLevel: toNullableString<OnboardingExperienceLevel>(source.experienceLevel),
    motivations: toStringArray<OnboardingGoal>(source.motivations),
    focusAreas: toStringArray<OnboardingContribution>(source.focusAreas),
    preferredLearningFormats: toStringArray<OnboardingLearningFormat>(source.preferredLearningFormats),
    supportPreferences: toStringArray<OnboardingSupportPreference>(source.supportPreferences),
    accountabilityStyle: toNullableString<OnboardingAccountability>(source.accountabilityStyle),
    communicationPreferences: toStringArray<OnboardingCommunication>(source.communicationPreferences),
  }
}

export class AuthenticatedProfileResolutionError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthenticatedProfileResolutionError'
    this.status = status
  }
}

const buildRoles = (raw: unknown): AdminUserRole[] => {
  if (!Array.isArray(raw)) {
    return []
  }

  const roles: AdminUserRole[] = []

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') {
      continue
    }

    const role = (entry as { role?: unknown }).role

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

  return roles
}

const buildOnboardingJourney = (
  record: unknown,
): ProfileOnboardingJourney | null => {
  if (!record || typeof record !== 'object') {
    return null
  }

  const typedRecord = record as {
    status?: unknown
    current_step?: unknown
    completed_at?: unknown
    updated_at?: unknown
    version?: unknown
    responses?: unknown
  }

  return {
    status: typeof typedRecord.status === 'string' ? (typedRecord.status as ProfileOnboardingJourney['status']) : 'pending',
    currentStep: typeof typedRecord.current_step === 'string' ? typedRecord.current_step : null,
    completedAt: typeof typedRecord.completed_at === 'string' ? typedRecord.completed_at : null,
    updatedAt: typeof typedRecord.updated_at === 'string' ? typedRecord.updated_at : null,
    version: typeof typedRecord.version === 'string' ? typedRecord.version : null,
    responses: parseOnboardingResponses(typedRecord.responses),
  }
}

export const resolveAuthenticatedProfile = async (
  supabase: SupabaseClient<Database>,
): Promise<AuthenticatedProfileSummary> => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw new AuthenticatedProfileResolutionError('Unable to verify authentication.', 500)
  }

  if (!user) {
    throw new AuthenticatedProfileResolutionError('Not authenticated.', 401)
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
    throw new AuthenticatedProfileResolutionError('Unable to load profile.', 500)
  }

  if (!profile) {
    throw new AuthenticatedProfileResolutionError('Profile not found.', 404)
  }

  const roles = buildRoles((profile as { profile_roles?: unknown }).profile_roles)

  const { data: onboardingRecord, error: onboardingError } = await supabase
    .from('profile_onboarding_journeys')
    .select('status, current_step, completed_at, updated_at, version, responses')
    .eq('profile_id', (profile as { id: string }).id)
    .maybeSingle()

  if (onboardingError) {
    console.error('Unable to load onboarding journey for authenticated user', onboardingError)
  }

  const onboarding = buildOnboardingJourney(onboardingRecord)

  const preferredDisplayName =
    typeof (profile as { display_name?: unknown }).display_name === 'string' &&
    ((profile as { display_name?: string }).display_name ?? '').trim().length > 0
      ? ((profile as { display_name?: string }).display_name as string)
      : user.email ?? ''

  return {
    profileId: (profile as { id: string }).id,
    userId: user.id,
    email: user.email ?? '',
    displayName: preferredDisplayName,
    avatarUrl: (profile as { avatar_url?: string | null }).avatar_url ?? null,
    isAdmin: Boolean((profile as { is_admin?: boolean }).is_admin),
    createdAt: (profile as { created_at: string }).created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    primaryRoleId: (profile as { primary_role_id?: string | null }).primary_role_id ?? null,
    roles,
    onboarding,
  }
}
