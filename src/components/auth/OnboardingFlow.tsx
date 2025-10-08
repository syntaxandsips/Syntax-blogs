"use client";

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronLeft,
  Compass,
  Goal,
  Loader2,
  NotebookPen,
  RefreshCcw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthenticatedProfile } from '@/hooks/useAuthenticatedProfile';
import { cn } from '@/lib/utils';
import {
  NeobrutalAlert,
  NeobrutalAlertDescription,
  NeobrutalAlertTitle,
} from '@/components/neobrutal/alert';
import type {
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
} from '@/utils/types';

interface OnboardingFlowProps {
  profile: {
    id: string;
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    createdAt: string;
  };
  initialJourney: ProfileOnboardingJourney;
  defaultRedirect: string;
}

type StepId = 'persona' | 'outcomes' | 'enablement' | 'support' | 'summary';

type JourneyRecord = {
  status: ProfileOnboardingJourney['status'];
  current_step: string | null;
  completed_at: string | null;
  updated_at: string | null;
  version: string | null;
  responses: ProfileOnboardingJourney['responses'];
};

const personaOptions: Array<{
  value: OnboardingPersona;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    value: 'learning-explorer',
    title: 'Curious explorer',
    description: 'I scan emerging research, tools, and ideas to stay ahead of the curve.',
    icon: Compass,
  },
  {
    value: 'hands-on-builder',
    title: 'Hands-on builder',
    description: 'I learn by prototyping quickly and sharing what I discover with others.',
    icon: Rocket,
  },
  {
    value: 'community-connector',
    title: 'Community connector',
    description: 'I spark conversations, curate resources, and keep the energy high.',
    icon: UsersRound,
  },
  {
    value: 'career-switcher',
    title: 'Career switcher',
    description: 'I am pivoting into AI/ML and want a guided runway and supportive peers.',
    icon: RefreshCcw,
  },
  {
    value: 'team-enabler',
    title: 'Team enabler',
    description: 'I coach squads, manage stakeholders, and need signal to guide the crew.',
    icon: ShieldCheck,
  },
];

const experienceOptions: Array<{
  value: OnboardingExperienceLevel;
  label: string;
  description: string;
}> = [
  {
    value: 'early-career',
    label: 'Early career',
    description: '0-2 years working in AI/ML or adjacent fields.',
  },
  {
    value: 'mid-level',
    label: 'Practicing contributor',
    description: 'Actively shipping projects and leveling up craft.',
  },
  {
    value: 'senior-practitioner',
    label: 'Senior practitioner',
    description: 'Trusted specialist guiding initiatives or teams.',
  },
  {
    value: 'strategic-leader',
    label: 'Strategic leader',
    description: 'Setting vision, roadmaps, or org-wide enablement.',
  },
];

const goalOptions: Array<{
  value: OnboardingGoal;
  title: string;
  description: string;
}> = [
  {
    value: 'publish-signature-series',
    title: 'Publish a signature series',
    description: 'Craft landmark stories that cement your point of view.',
  },
  {
    value: 'grow-technical-voice',
    title: 'Grow your technical voice',
    description: 'Share frameworks, best practices, and bold opinions.',
  },
  {
    value: 'level-up-ai-skills',
    title: 'Level up AI & ML skills',
    description: 'Find playbooks, walkthroughs, and practice prompts.',
  },
  {
    value: 'ship-side-projects',
    title: 'Ship side projects faster',
    description: 'Use accountability loops to move experiments forward.',
  },
  {
    value: 'find-peers',
    title: 'Meet collaborators & peers',
    description: 'Connect with people shipping similar ideas.',
  },
  {
    value: 'transition-role',
    title: 'Transition into a new role',
    description: 'Build a portfolio and skill stack to pivot confidently.',
  },
];

const contributionOptions: Array<{
  value: OnboardingContribution;
  title: string;
  description: string;
}> = [
  {
    value: 'write-articles',
    title: 'Long-form articles',
    description: 'Break down complex topics for thousands of readers.',
  },
  {
    value: 'share-code-snippets',
    title: 'Code walkthroughs',
    description: 'Publish labs, notebooks, and reproducible examples.',
  },
  {
    value: 'host-events',
    title: 'Live sessions & events',
    description: 'Host office hours, workshops, or live coding demos.',
  },
  {
    value: 'produce-videos',
    title: 'Video & podcast drops',
    description: 'Record conversations or screen shares for the community.',
  },
  {
    value: 'mentor-community',
    title: 'Mentorship moments',
    description: 'Offer feedback, portfolio reviews, or pair-building.',
  },
];

const learningFormatOptions: Array<{
  value: OnboardingLearningFormat;
  label: string;
  description: string;
}> = [
  {
    value: 'deep-dives',
    label: 'Deep dives',
    description: 'Research-backed explorations with diagrams and code.',
  },
  {
    value: 'quick-tips',
    label: 'Quick tips',
    description: 'Bite-sized tactics, templates, and copy/paste snippets.',
  },
  {
    value: 'live-builds',
    label: 'Live builds',
    description: 'Real-time co-building with Q&A and community chat.',
  },
  {
    value: 'case-studies',
    label: 'Case studies',
    description: 'Behind-the-scenes breakdowns from working teams.',
  },
  {
    value: 'audio-notes',
    label: 'Audio notes',
    description: 'Pod-style explainers you can play on the go.',
  },
];

const supportOptions: Array<{
  value: OnboardingSupportPreference;
  label: string;
  description: string;
}> = [
  {
    value: 'editorial-reviews',
    label: 'Editorial reviews',
    description: 'Get structured edits and publishing guidance.',
  },
  {
    value: 'pair-programming',
    label: 'Pair programming jams',
    description: 'Co-build prototypes and unblock tricky problems.',
  },
  {
    value: 'career-coaching',
    label: 'Career strategy chats',
    description: 'Plan your next move and align your portfolio.',
  },
  {
    value: 'community-challenges',
    label: 'Community challenges',
    description: 'Join themed sprints with badges and celebrations.',
  },
  {
    value: 'office-hours',
    label: 'Office hours & AMAs',
    description: 'Drop in for real-time support from editors and guests.',
  },
];

const accountabilityOptions: Array<{
  value: OnboardingAccountability;
  label: string;
  description: string;
}> = [
  {
    value: 'progress-updates',
    label: 'Weekly progress pulses',
    description: 'Share snapshots and keep momentum visible.',
  },
  {
    value: 'quiet-focus',
    label: 'Heads-down focus',
    description: 'Minimal check-ins—just surface milestones when ready.',
  },
  {
    value: 'public-goals',
    label: 'Public goal setting',
    description: 'Declare bold goals and celebrate wins with the crew.',
  },
  {
    value: 'one-on-one',
    label: '1:1 accountability',
    description: 'Pair with an editor or mentor for deeper coaching.',
  },
];

const communicationOptions: Array<{
  value: OnboardingCommunication;
  label: string;
  description: string;
}> = [
  {
    value: 'weekly-digest',
    label: 'Weekly digest',
    description: 'One email that rounds up the essentials you care about.',
  },
  {
    value: 'event-reminders',
    label: 'Event reminders',
    description: 'Get nudges before livestreams, AMAs, and studio sessions.',
  },
  {
    value: 'opportunity-alerts',
    label: 'Opportunities & collabs',
    description: 'Speaking gigs, beta testing, and project matchmaking.',
  },
  {
    value: 'product-updates',
    label: 'Product updates',
    description: 'Roadmap notes, feature previews, and design experiments.',
  },
];

const defaultResponses = (
  responses: ProfileOnboardingJourney['responses'],
): ProfileOnboardingResponses => ({
  persona: responses?.persona ?? null,
  experienceLevel: responses?.experienceLevel ?? null,
  motivations: responses?.motivations ?? [],
  focusAreas: responses?.focusAreas ?? [],
  preferredLearningFormats: responses?.preferredLearningFormats ?? [],
  supportPreferences: responses?.supportPreferences ?? [],
  accountabilityStyle: responses?.accountabilityStyle ?? null,
  communicationPreferences: responses?.communicationPreferences ?? [],
});

const mapRecordToJourney = (record: JourneyRecord): ProfileOnboardingJourney => ({
  status: record.status ?? 'pending',
  currentStep: record.current_step ?? null,
  completedAt: record.completed_at ?? null,
  updatedAt: record.updated_at ?? null,
  version: record.version ?? null,
  responses: record.responses ?? null,
});

export const OnboardingFlow = ({ profile, initialJourney, defaultRedirect }: OnboardingFlowProps) => {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const { refresh: refreshProfile } = useAuthenticatedProfile();

  const [journey, setJourney] = useState<ProfileOnboardingJourney>(initialJourney);
  const [responses, setResponses] = useState<ProfileOnboardingResponses>(defaultResponses(initialJourney.responses));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const stepOrder: StepId[] = useMemo(() => ['persona', 'outcomes', 'enablement', 'support', 'summary'], []);

  const initialStep = useMemo(() => {
    if (initialJourney.status === 'completed') {
      return 'summary';
    }

    if (initialJourney.currentStep && stepOrder.includes(initialJourney.currentStep as StepId)) {
      return initialJourney.currentStep as StepId;
    }

    return 'persona';
  }, [initialJourney.currentStep, initialJourney.status, stepOrder]);

  const [currentStepIndex, setCurrentStepIndex] = useState(() => Math.max(stepOrder.indexOf(initialStep), 0));

  useEffect(() => {
    router.prefetch(defaultRedirect);
  }, [defaultRedirect, router]);

  const progressPercentage = Math.round((currentStepIndex / (stepOrder.length - 1)) * 100);

  const updateJourney = (record: JourneyRecord) => {
    const mapped = mapRecordToJourney(record);
    setJourney(mapped);
    if (mapped.responses) {
      setResponses(defaultResponses(mapped.responses));
    }
  };

  const persistJourney = async (
    nextStatus: ProfileOnboardingJourney['status'],
    nextStep: string | null,
    payload: ProfileOnboardingResponses,
    completedAt: string | null,
  ) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const baseUpdate = {
      status: nextStatus,
      current_step: nextStep,
      responses: payload,
      completed_at: completedAt,
      version: journey.version ?? '2025.02',
    };

    let record: JourneyRecord | null = null;

    const { data, error: updateError } = await supabase
      .from('profile_onboarding_journeys')
      .update(baseUpdate)
      .eq('profile_id', profile.id)
      .select('status, current_step, completed_at, updated_at, version, responses')
      .maybeSingle();

    if (updateError) {
      console.error('Failed to update onboarding journey', updateError);
    }

    if (data) {
      record = data as JourneyRecord;
    } else if (!updateError) {
      const { data: upserted, error: upsertError } = await supabase
        .from('profile_onboarding_journeys')
        .upsert(
          { profile_id: profile.id, user_id: profile.userId, ...baseUpdate },
          { onConflict: 'profile_id' },
        )
        .select('status, current_step, completed_at, updated_at, version, responses')
        .single();

      if (upsertError) {
        console.error('Failed to upsert onboarding journey', upsertError);
        setError('We could not save your progress. Please retry.');
        setIsSaving(false);
        return null;
      }

      record = upserted as JourneyRecord;
    } else {
      setError('We could not save your progress. Please retry.');
      setIsSaving(false);
      return null;
    }

    if (!record) {
      setError('We could not save your progress. Please retry.');
      setIsSaving(false);
      return null;
    }

    updateJourney(record);
    await refreshProfile();
    setIsSaving(false);
    return record;
  };

  const toggleMotivation = (value: OnboardingGoal) => {
    setResponses((previous) => ({
      ...previous,
      motivations: previous.motivations.includes(value)
        ? previous.motivations.filter((item) => item !== value)
        : [...previous.motivations, value],
    }));
  };

  const toggleContribution = (value: OnboardingContribution) => {
    setResponses((previous) => ({
      ...previous,
      focusAreas: previous.focusAreas.includes(value)
        ? previous.focusAreas.filter((item) => item !== value)
        : [...previous.focusAreas, value],
    }));
  };

  const toggleLearningFormat = (value: OnboardingLearningFormat) => {
    setResponses((previous) => ({
      ...previous,
      preferredLearningFormats: previous.preferredLearningFormats.includes(value)
        ? previous.preferredLearningFormats.filter((item) => item !== value)
        : [...previous.preferredLearningFormats, value],
    }));
  };

  const toggleSupportPreference = (value: OnboardingSupportPreference) => {
    setResponses((previous) => ({
      ...previous,
      supportPreferences: previous.supportPreferences.includes(value)
        ? previous.supportPreferences.filter((item) => item !== value)
        : [...previous.supportPreferences, value],
    }));
  };

  const toggleCommunicationPreference = (value: OnboardingCommunication) => {
    setResponses((previous) => ({
      ...previous,
      communicationPreferences: previous.communicationPreferences.includes(value)
        ? previous.communicationPreferences.filter((item) => item !== value)
        : [...previous.communicationPreferences, value],
    }));
  };

  const validateStep = (stepId: StepId): string | null => {
    switch (stepId) {
      case 'persona':
        if (!responses.persona || !responses.experienceLevel) {
          return 'Choose the persona and experience level that best represent you.';
        }
        return null;
      case 'outcomes':
        if (responses.motivations.length === 0) {
          return 'Select at least one outcome you want to unlock with Syntax & Sips.';
        }
        return null;
      case 'enablement':
        if (responses.focusAreas.length === 0) {
          return 'Let us know how you want to contribute.';
        }
        if (responses.preferredLearningFormats.length === 0) {
          return 'Pick at least one content format you value most.';
        }
        return null;
      case 'support':
        if (!responses.accountabilityStyle) {
          return 'Pick the support style that keeps you motivated.';
        }
        if (responses.communicationPreferences.length === 0) {
          return 'Tell us how you want us to stay in touch.';
        }
        return null;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    const activeStep = stepOrder[currentStepIndex];
    const validationMessage = validateStep(activeStep);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const isFinalStep = currentStepIndex === stepOrder.length - 1;

    if (isFinalStep) {
      return;
    }

    const nextStepId = stepOrder[currentStepIndex + 1];
    const completionTimestamp = nextStepId === 'summary' ? new Date().toISOString() : null;
    const nextStatus = nextStepId === 'summary' ? 'completed' : 'in_progress';

    const record = await persistJourney(nextStatus, nextStepId, responses, completionTimestamp);

    if (!record) {
      return;
    }

    if (nextStepId === 'summary') {
      setSuccessMessage('Onboarding complete! Your dashboard is now personalised.');
    }

    setCurrentStepIndex((index) => Math.min(index + 1, stepOrder.length - 1));
  };

  const handleBack = () => {
    if (currentStepIndex === 0) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  };

  const handleSkip = async () => {
    await persistJourney(journey.status === 'completed' ? 'completed' : 'in_progress', stepOrder[currentStepIndex], responses, journey.completedAt ?? null);
    router.replace(defaultRedirect);
  };

  const handleFinish = async () => {
    const record = await persistJourney('completed', 'summary', responses, new Date().toISOString());

    if (!record) {
      return;
    }

    setSuccessMessage('Onboarding complete! Redirecting you to your dashboard.');
    setCurrentStepIndex(stepOrder.length - 1);

    setTimeout(() => {
      router.replace(defaultRedirect);
    }, 1200);
  };

  const currentStep = stepOrder[currentStepIndex];

  const renderPersonaStep = () => (
    <div className="space-y-6">
      <p className="text-base font-semibold text-gray-600">
        We use your answers to tailor playbooks, match you with collaborators, and decide which experiments to invite you into first.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {personaOptions.map((option) => {
          const Icon = option.icon;
          const isActive = responses.persona === option.value;

          return (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                setResponses((previous) => ({ ...previous, persona: option.value }));
                setError(null);
              }}
              className={cn(
                'flex h-full flex-col items-start gap-3 rounded-3xl border-2 border-black bg-white p-5 text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-1',
                isActive ? 'bg-[#FFD66B] shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white',
              )}
            >
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {isActive ? 'Your pick' : 'Persona'}
              </span>
              <div>
                <h3 className="text-xl font-black text-gray-900">{option.title}</h3>
                <p className="mt-1 text-sm font-medium text-gray-700">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border-2 border-dashed border-black/20 bg-[#F8F4FF] p-5">
        <p className="text-sm font-black uppercase tracking-wide text-[#6C63FF]">Experience signal</p>
        <p className="mt-2 text-base font-semibold text-gray-700">
          We calibrate recommendations based on how confident you feel in your craft.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {experienceOptions.map((option) => {
            const isActive = responses.experienceLevel === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setResponses((previous) => ({ ...previous, experienceLevel: option.value }));
                  setError(null);
                }}
                className={cn(
                  'rounded-full border-2 border-black bg-white px-4 py-2 text-left text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-[1px] focus:outline-none',
                  isActive ? 'bg-[#6C63FF] text-white' : 'bg-white text-gray-900',
                )}
              >
                <span className="block text-xs font-black uppercase tracking-wide text-gray-500">
                  {option.label}
                </span>
                <span className="block text-xs font-semibold text-gray-700">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderOutcomeStep = () => (
    <div className="space-y-6">
      <p className="text-base font-semibold text-gray-600">
        What would make Syntax &amp; Sips wildly valuable for you? Pick the wins you are chasing so we can craft the right nudges.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {goalOptions.map((option) => {
          const isActive = responses.motivations.includes(option.value);

          return (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                toggleMotivation(option.value);
                setError(null);
              }}
              className={cn(
                'flex h-full flex-col items-start gap-3 rounded-3xl border-2 border-black bg-white p-5 text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-1',
                isActive ? 'bg-[#C5F8FF]' : 'bg-white',
              )}
            >
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#6C63FF] px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                <Goal className="h-4 w-4" aria-hidden="true" />
                {isActive ? 'Selected' : 'Goal'}
              </span>
              <h3 className="text-xl font-black text-gray-900">{option.title}</h3>
              <p className="text-sm font-medium text-gray-700">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderEnablementStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-gray-900">How do you want to contribute?</h3>
        <p className="mt-1 text-sm font-medium text-gray-600">
          Your selections help us match you with editors, resources, and programs that amplify your strengths.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {contributionOptions.map((option) => {
            const isActive = responses.focusAreas.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  toggleContribution(option.value);
                  setError(null);
                }}
                className={cn(
                  'flex h-full flex-col items-start gap-3 rounded-3xl border-2 border-black bg-white p-5 text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-1',
                  isActive ? 'bg-[#FFE6F0]' : 'bg-white',
                )}
              >
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FF8A65] px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                  <NotebookPen className="h-4 w-4" aria-hidden="true" />
                  {isActive ? 'In your plan' : 'Contribution'}
                </span>
                <h3 className="text-xl font-black text-gray-900">{option.title}</h3>
                <p className="text-sm font-medium text-gray-700">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border-2 border-black bg-[#F6EDE3] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.15)]">
        <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
          <Sparkles className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
          Learning signals
        </h3>
        <p className="mt-2 text-sm font-medium text-gray-700">
          Pick the delivery formats that keep you motivated and in flow.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {learningFormatOptions.map((option) => {
            const isActive = responses.preferredLearningFormats.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  toggleLearningFormat(option.value);
                  setError(null);
                }}
                className={cn(
                  'rounded-full border-2 border-black bg-white px-4 py-2 text-left text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-[1px]',
                  isActive ? 'bg-[#6C63FF] text-white' : 'bg-white text-gray-900',
                )}
              >
                <span className="block text-xs font-black uppercase tracking-wide text-gray-500">
                  {option.label}
                </span>
                <span className="block text-xs font-semibold text-gray-700">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSupportStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-gray-900">How can we support your momentum?</h3>
        <p className="mt-1 text-sm font-medium text-gray-600">
          Signal the experiences that would unblock you—we coordinate programming around real member needs.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {supportOptions.map((option) => {
            const isActive = responses.supportPreferences.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  toggleSupportPreference(option.value);
                  setError(null);
                }}
                className={cn(
                  'rounded-2xl border-2 border-black bg-white px-4 py-3 text-left text-sm font-semibold shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-[1px]',
                  isActive ? 'bg-[#D7F8E4]' : 'bg-white',
                )}
              >
                <span className="block text-xs font-black uppercase tracking-wide text-[#2E7D32]">
                  {isActive ? 'Priority' : 'Support'}
                </span>
                <span className="block text-sm font-bold text-gray-900">{option.label}</span>
                <span className="block text-xs font-medium text-gray-600">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accountabilityOptions.map((option) => {
          const isActive = responses.accountabilityStyle === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setResponses((previous) => ({
                  ...previous,
                  accountabilityStyle: previous.accountabilityStyle === option.value ? null : option.value,
                }));
                setError(null);
              }}
              className={cn(
                'flex h-full flex-col items-start gap-3 rounded-3xl border-2 border-black bg-white p-5 text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-1',
                isActive ? 'bg-[#FFF5D1]' : 'bg-white',
              )}
            >
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFD66B] px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                <Target className="h-4 w-4" aria-hidden="true" />
                {isActive ? 'Your flow' : 'Accountability'}
              </span>
              <h3 className="text-xl font-black text-gray-900">{option.label}</h3>
              <p className="text-sm font-medium text-gray-700">{option.description}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.12)]">
        <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
          <CalendarCheck2 className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
          Communication cadence
        </h3>
        <p className="mt-2 text-sm font-medium text-gray-600">
          Choose the touchpoints you actually want to receive—no noise, just relevance.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {communicationOptions.map((option) => {
            const isActive = responses.communicationPreferences.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  toggleCommunicationPreference(option.value);
                  setError(null);
                }}
                className={cn(
                  'rounded-full border-2 border-black bg-white px-4 py-2 text-left text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-[1px]',
                  isActive ? 'bg-[#6C63FF] text-white' : 'bg-white text-gray-900',
                )}
              >
                <span className="block text-xs font-black uppercase tracking-wide text-gray-500">
                  {option.label}
                </span>
                <span className="block text-xs font-semibold text-gray-700">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSummaryStep = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border-2 border-black bg-[#E8F8FF] p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)]">
        <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
          <CheckCircle2 className="h-5 w-5 text-[#2E7D32]" aria-hidden="true" />
          Ready to roll
        </h3>
        <p className="mt-2 text-sm font-medium text-gray-700">
          Your dashboard, notifications, and invitations will now reflect what you told us matters most.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)]">
          <h4 className="text-base font-black uppercase tracking-wide text-gray-500">Persona</h4>
          <p className="mt-2 text-xl font-black text-gray-900">
            {personaOptions.find((option) => option.value === responses.persona)?.title ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-600">
            {experienceOptions.find((option) => option.value === responses.experienceLevel)?.label ?? '—'}
          </p>
        </div>

        <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)]">
          <h4 className="text-base font-black uppercase tracking-wide text-gray-500">Primary goals</h4>
          <ul className="mt-2 space-y-2 text-sm font-semibold text-gray-700">
            {responses.motivations.map((goal) => {
              const detail = goalOptions.find((option) => option.value === goal);
              return (
                <li key={goal} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#6C63FF]" aria-hidden="true" />
                  {detail?.title ?? goal}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)]">
          <h4 className="text-base font-black uppercase tracking-wide text-gray-500">Contribution focus</h4>
          <ul className="mt-2 space-y-2 text-sm font-semibold text-gray-700">
            {responses.focusAreas.map((item) => {
              const detail = contributionOptions.find((option) => option.value === item);
              return (
                <li key={item} className="flex items-center gap-2">
                  <NotebookPen className="h-4 w-4 text-[#FF8A65]" aria-hidden="true" />
                  {detail?.title ?? item}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)]">
          <h4 className="text-base font-black uppercase tracking-wide text-gray-500">Preferred support</h4>
          <ul className="mt-2 space-y-2 text-sm font-semibold text-gray-700">
            {responses.supportPreferences.map((item) => {
              const detail = supportOptions.find((option) => option.value === item);
              return (
                <li key={item} className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#2E7D32]" aria-hidden="true" />
                  {detail?.label ?? item}
                </li>
              );
            })}
          </ul>
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm font-semibold text-gray-600">
            Accountability: {accountabilityOptions.find((option) => option.value === responses.accountabilityStyle)?.label ?? '—'}
          </div>
          <div className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm font-semibold text-gray-600">
            Updates: {responses.communicationPreferences.length > 0 ? responses.communicationPreferences.map((item) => communicationOptions.find((option) => option.value === item)?.label ?? item).join(', ') : '—'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="neo-brutalism min-h-screen bg-gradient-to-br from-[#FFF5F1] via-[#F8F0FF] to-[#E3F2FF] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[32px] border-4 border-black bg-white shadow-[18px_18px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="border-b-4 border-black bg-[#F6EDE3] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-black bg-white">
                  {profile.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt={profile.displayName} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#FFD66B] text-lg font-black uppercase text-black">
                      {profile.displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Syntax &amp; Sips onboarding</p>
                  <h1 className="text-2xl font-black text-gray-900">Welcome, {profile.displayName.split(' ')[0] ?? profile.displayName}!</h1>
                  <p className="text-sm font-semibold text-gray-600">We are configuring your personal dashboard and community access.</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-600">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#6C63FF]" aria-hidden="true" />
                  Step {currentStepIndex + 1} of {stepOrder.length}
                </div>
                <div className="h-2 w-48 overflow-hidden rounded-full border-2 border-black bg-white">
                  <div className="h-full bg-[#6C63FF]" style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
                </div>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs font-bold uppercase tracking-wide text-[#6C63FF] underline"
                >
                  Save &amp; continue later
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6C63FF]">{currentStep === 'summary' ? 'Review' : 'Discovery'}</p>
                  <h2 className="text-2xl font-black text-gray-900">
                    {currentStep === 'persona'
                      ? 'Know thy member'
                      : currentStep === 'outcomes'
                      ? 'Define your wins'
                      : currentStep === 'enablement'
                      ? 'Design your playbook'
                      : currentStep === 'support'
                      ? 'Set your support system'
                      : 'Your personalized launch plan'}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-600">
                    {currentStep === 'persona'
                      ? 'Tell us who you are so we can tailor everything from tone to templates.'
                      : currentStep === 'outcomes'
                      ? 'Highlight the outcomes that will prove Syntax & Sips was worth your time.'
                      : currentStep === 'enablement'
                      ? 'Pick the creative muscles you want to flex so we can line up the right opportunities.'
                      : currentStep === 'support'
                      ? 'Share how we should champion you and what signals to send.'
                      : 'Review your answers—change anything before we lock them in.'}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-sm font-semibold text-gray-600">
                  We will revisit this during retros. You can update preferences anytime from your account dashboard.
                </div>
              </div>
            </div>

            {error ? (
              <NeobrutalAlert tone="danger">
                <NeobrutalAlertTitle>We could not save your answers</NeobrutalAlertTitle>
                <NeobrutalAlertDescription>{error}</NeobrutalAlertDescription>
              </NeobrutalAlert>
            ) : null}

            {successMessage ? (
              <NeobrutalAlert tone="success" role="status">
                <NeobrutalAlertTitle>Progress saved</NeobrutalAlertTitle>
                <NeobrutalAlertDescription>{successMessage}</NeobrutalAlertDescription>
              </NeobrutalAlert>
            ) : null}

            <div>
              {currentStep === 'persona'
                ? renderPersonaStep()
                : currentStep === 'outcomes'
                ? renderOutcomeStep()
                : currentStep === 'enablement'
                ? renderEnablementStep()
                : currentStep === 'support'
                ? renderSupportStep()
                : renderSummaryStep()}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t-4 border-black bg-[#F6EDE3] p-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0 || isSaving}
              className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>

            {currentStep === 'summary' ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#6C63FF] px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                Confirm &amp; launch dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FF8A65] px-6 py-3 text-sm font-black uppercase tracking-wide text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                Save &amp; continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
