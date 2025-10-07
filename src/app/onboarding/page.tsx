import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server-client';
import { OnboardingFlow } from '@/components/auth/OnboardingFlow';
import { sanitizeRedirect } from '@/utils/sanitizeRedirect';
import type { ProfileOnboardingJourney } from '@/utils/types';

export const dynamic = 'force-dynamic';

interface OnboardingPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const supabase = createServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect_to=/onboarding');
  }

  const { data: profileRecord, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, display_name, avatar_url, created_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to load profile for onboarding: ${profileError.message}`);
  }

  if (!profileRecord) {
    throw new Error('Profile not found for onboarding.');
  }

  const { data: onboardingRecord, error: onboardingError } = await supabase
    .from('profile_onboarding_journeys')
    .select('status, current_step, completed_at, updated_at, version, responses')
    .eq('profile_id', profileRecord.id)
    .maybeSingle();

  if (onboardingError) {
    console.error('Unable to load onboarding journey for onboarding page', onboardingError);
  }

  const journey: ProfileOnboardingJourney = onboardingRecord
    ? {
        status: (onboardingRecord.status as ProfileOnboardingJourney['status']) ?? 'pending',
        currentStep: (onboardingRecord.current_step as string | null) ?? null,
        completedAt: (onboardingRecord.completed_at as string | null) ?? null,
        updatedAt: (onboardingRecord.updated_at as string | null) ?? null,
        version: (onboardingRecord.version as string | null) ?? null,
        responses: (onboardingRecord.responses as ProfileOnboardingJourney['responses']) ?? null,
      }
    : {
        status: 'pending',
        currentStep: null,
        completedAt: null,
        updatedAt: null,
        version: '2025.02',
        responses: null,
      };

  const redirectPath = sanitizeRedirect(resolvedSearchParams?.redirect) ?? '/account';

  return (
    <OnboardingFlow
      profile={{
        id: profileRecord.id as string,
        userId: profileRecord.user_id as string,
        displayName: profileRecord.display_name as string,
        avatarUrl: (profileRecord.avatar_url as string | null) ?? null,
        createdAt: profileRecord.created_at as string,
      }}
      initialJourney={journey}
      defaultRedirect={redirectPath}
    />
  );
}
