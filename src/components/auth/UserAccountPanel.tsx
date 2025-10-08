'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Compass,
  ExternalLink,
  FileText,
  Goal,
  IdCard,
  LifeBuoy,
  MessageCircle,
  NotebookPen,
  PanelLeftClose,
  PanelRightOpen,
  PenSquare,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type {
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
  UserCommentSummary,
  UserContributionSnapshot,
  UserPostSummary,
} from '@/utils/types'
import { CommentStatus, PostStatus } from '@/utils/types'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  MAX_PROFILE_PHOTO_SIZE,
  getObjectPathFromPublicUrl,
} from '@/lib/storage/profile-photos'
import { useAuthenticatedProfile } from '@/hooks/useAuthenticatedProfile'
import '@/styles/neo-brutalism.css'
import { GamificationSummary } from '@/components/gamification/GamificationSummary'
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase'
import { ChallengeList } from '@/components/gamification/ChallengeList'
import { LeaderboardPanel } from '@/components/gamification/LeaderboardPanel'
import { GamificationSettingsCard } from '@/components/gamification/GamificationSettingsCard'
import { useGamificationProfile } from '@/hooks/useGamificationProfile'
import { useLeaderboard } from '@/hooks/useLeaderboard'

interface UserAccountPanelProps {
  profile: AuthenticatedProfileSummary
  contributions: UserContributionSnapshot
}

type RuleStatus = 'complete' | 'pending' | 'attention'

interface RuleItem {
  title: string
  description: string
  status: RuleStatus
}

interface ActivityEntry {
  id: string
  type: 'post' | 'comment'
  title: string
  description: string
  timestamp: string | null
  href?: string | null
  statusLabel: string
  badgeTone: 'purple' | 'blue' | 'orange' | 'emerald' | 'red'
  excerpt?: string
}

interface SidebarSection {
  id: string
  label: string
  icon: LucideIcon
}

type CapabilityStatus = 'available' | 'locked' | 'upcoming'

interface CapabilityItem {
  title: string
  description: string
  icon: LucideIcon
  status: CapabilityStatus
  ctaHref?: string
  ctaLabel?: string
}

type StatusTone = 'success' | 'error'

interface StatusMessage {
  tone: StatusTone
  message: string
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
})

const relativeUnits: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: 'day', ms: 1000 * 60 * 60 * 24 },
  { unit: 'hour', ms: 1000 * 60 * 60 },
  { unit: 'minute', ms: 1000 * 60 },
]

const formatRelative = (iso: string | null) => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const diffMs = Date.now() - date.getTime()

  for (const { unit, ms } of relativeUnits) {
    if (Math.abs(diffMs) >= ms || unit === 'minute') {
      const value = Math.round(diffMs / ms)
      return relativeTimeFormatter.format(-value, unit)
    }
  }

  return 'just now'
}

const buildActivity = (
  posts: UserPostSummary[],
  comments: UserCommentSummary[],
): ActivityEntry[] => {
  const entries: ActivityEntry[] = []

  for (const post of posts) {
    const isPublished = post.status === PostStatus.PUBLISHED
    entries.push({
      id: `post-${post.id}`,
      type: 'post',
      title: post.title,
      description: isPublished ? 'Published article' : 'Draft in progress',
      timestamp: post.publishedAt ?? post.createdAt,
      href: post.slug ? `/blogs/${post.slug}` : null,
      statusLabel:
        post.status === PostStatus.DRAFT
          ? 'Draft'
          : post.status === PostStatus.SCHEDULED
          ? 'Scheduled'
          : 'Published',
      badgeTone:
        post.status === PostStatus.DRAFT
          ? 'orange'
          : post.status === PostStatus.SCHEDULED
          ? 'blue'
          : 'emerald',
      excerpt: isPublished
        ? `Read count: ${post.views.toLocaleString('en-US')}`
        : 'Finalize your edits to share this story.',
    })
  }

  for (const comment of comments) {
    entries.push({
      id: `comment-${comment.id}`,
      type: 'comment',
      title: comment.postTitle ?? 'Community conversation',
      description:
        comment.status === CommentStatus.APPROVED
          ? 'Comment approved'
          : comment.status === CommentStatus.REJECTED
          ? 'Comment rejected'
          : 'Awaiting moderator review',
      timestamp: comment.createdAt,
      href: comment.postSlug ? `/blogs/${comment.postSlug}#comments` : null,
      statusLabel:
        comment.status === CommentStatus.APPROVED
          ? 'Approved'
          : comment.status === CommentStatus.REJECTED
          ? 'Rejected'
          : 'Pending',
      badgeTone:
        comment.status === CommentStatus.APPROVED
          ? 'emerald'
          : comment.status === CommentStatus.REJECTED
          ? 'red'
          : 'orange',
      excerpt: comment.content,
    })
  }

  return entries
    .filter((entry) => Boolean(entry.timestamp))
    .sort((a, b) => {
      const aTime = new Date(a.timestamp ?? 0).getTime()
      const bTime = new Date(b.timestamp ?? 0).getTime()
      return bTime - aTime
    })
    .slice(0, 8)
}

const onboardingPersonaDictionary: Record<OnboardingPersona, { title: string; summary: string }> = {
  'learning-explorer': {
    title: 'Curious explorer',
    summary: 'Scans emerging research, tools, and ideas to stay ahead of the curve.',
  },
  'hands-on-builder': {
    title: 'Hands-on builder',
    summary: 'Learns by prototyping quickly and sharing practical discoveries.',
  },
  'community-connector': {
    title: 'Community connector',
    summary: 'Curates resources, sparks conversations, and energises the community.',
  },
  'career-switcher': {
    title: 'Career switcher',
    summary: 'Pivoting into AI/ML with a need for guided pathways and peers.',
  },
  'team-enabler': {
    title: 'Team enabler',
    summary: 'Coaches squads and needs signal to guide and unblock the crew.',
  },
}

const onboardingExperienceDictionary: Record<OnboardingExperienceLevel, string> = {
  'early-career': 'Early career (0-2 years in AI/ML)',
  'mid-level': 'Practicing contributor',
  'senior-practitioner': 'Senior practitioner',
  'strategic-leader': 'Strategic leader',
}

const onboardingGoalDictionary: Record<OnboardingGoal, string> = {
  'publish-signature-series': 'Publish a signature series',
  'grow-technical-voice': 'Grow your technical voice',
  'level-up-ai-skills': 'Level up AI & ML skills',
  'ship-side-projects': 'Ship side projects faster',
  'find-peers': 'Meet collaborators & peers',
  'transition-role': 'Transition into a new role',
}

const onboardingContributionDictionary: Record<OnboardingContribution, string> = {
  'write-articles': 'Long-form articles',
  'share-code-snippets': 'Code walkthroughs & repos',
  'host-events': 'Live sessions & events',
  'produce-videos': 'Video & podcast experiments',
  'mentor-community': 'Mentorship & feedback',
}

const onboardingLearningDictionary: Record<OnboardingLearningFormat, string> = {
  'deep-dives': 'Deep dives',
  'quick-tips': 'Quick tips',
  'live-builds': 'Live builds',
  'case-studies': 'Case studies',
  'audio-notes': 'Audio notes',
}

const onboardingSupportDictionary: Record<OnboardingSupportPreference, string> = {
  'editorial-reviews': 'Editorial reviews',
  'pair-programming': 'Pair programming jams',
  'career-coaching': 'Career strategy chats',
  'community-challenges': 'Community challenges',
  'office-hours': 'Office hours & AMAs',
}

const onboardingCommunicationDictionary: Record<OnboardingCommunication, string> = {
  'weekly-digest': 'Weekly digest',
  'event-reminders': 'Event reminders',
  'opportunity-alerts': 'Opportunities & collaborations',
  'product-updates': 'Product updates & roadmap notes',
}

const onboardingAccountabilityDictionary: Record<OnboardingAccountability, string> = {
  'progress-updates': 'Weekly progress pulses',
  'quiet-focus': 'Heads-down focus',
  'public-goals': 'Public goal setting',
  'one-on-one': '1:1 accountability partner',
}

const onboardingStepProgress: Record<string, number> = {
  persona: 0.2,
  outcomes: 0.45,
  enablement: 0.7,
  support: 0.9,
  summary: 1,
}

const computeOnboardingProgress = (journey: ProfileOnboardingJourney | null) => {
  if (!journey) {
    return 0
  }

  if (journey.status === 'completed') {
    return 1
  }

  const weight = onboardingStepProgress[journey.currentStep ?? 'persona']
  if (typeof weight === 'number') {
    return weight
  }

  return 0
}

const formatOnboardingList = <T extends string>(
  values: ReadonlyArray<T> | null | undefined,
  dictionary: Record<T, string>,
) => (values ?? []).map((value) => dictionary[value] ?? value)

const renderRuleBadge = (status: RuleStatus) => {
  if (status === 'complete') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-600 bg-emerald-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Complete
      </span>
    )
  }

  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border-2 border-blue-500 bg-blue-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Pending
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border-2 border-red-500 bg-red-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-700">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Needs attention
    </span>
  )
}

const RuleCard = ({ title, description, status }: RuleItem) => (
  <div
    className="rounded-2xl border-2 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)]"
    title={description}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-base font-extrabold leading-tight text-gray-900">{title}</p>
        <p className="mt-1 text-sm font-medium text-gray-600">{description}</p>
      </div>
      {renderRuleBadge(status)}
    </div>
  </div>
)

const StatCard = ({
  label,
  value,
  accent,
  helper,
}: {
  label: string
  value: number
  accent: string
  helper: string
}) => (
  <div
    className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.18)]"
    style={{ boxShadow: `8px 8px 0 0 ${accent}` }}
    title={helper}
  >
    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">{label}</p>
    <p className="mt-3 text-4xl font-black text-gray-900">{value.toLocaleString('en-US')}</p>
    <p className="mt-2 text-sm font-semibold text-gray-600">{helper}</p>
  </div>
)

const ContributionCard = ({
  post,
}: {
  post: UserPostSummary
}) => {
  const isPublished = post.status === PostStatus.PUBLISHED
  const badgeClass = isPublished
    ? 'bg-emerald-100 text-emerald-700 border-emerald-500'
    : post.status === PostStatus.SCHEDULED
    ? 'bg-blue-100 text-blue-700 border-blue-500'
    : 'bg-orange-100 text-orange-700 border-orange-500'

  const badgeLabel = isPublished
    ? 'Published'
    : post.status === PostStatus.SCHEDULED
    ? 'Scheduled'
    : 'Draft'

  return (
    <article className="rounded-2xl border-2 border-black bg-white p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.15)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}
            title={badgeLabel}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            {badgeLabel}
          </div>
          <h3 className="text-lg font-black text-gray-900">{post.title}</h3>
          <p className="text-sm font-medium text-gray-600">
            {post.publishedAt ? `Shared ${formatDate(post.publishedAt)}` : `Updated ${formatDate(post.createdAt)}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reads</p>
          <p className="text-2xl font-black text-gray-900">{post.views.toLocaleString('en-US')}</p>
        </div>
      </div>
      {isPublished && post.slug ? (
        <Link
          href={`/blogs/${post.slug}`}
          className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#6C63FF] hover:underline"
        >
          View article <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Keep refining and publish when ready.
        </p>
      )}
    </article>
  )
}

const CommentCard = ({ comment }: { comment: UserCommentSummary }) => {
  const badgeClass =
    comment.status === CommentStatus.APPROVED
      ? 'bg-emerald-100 text-emerald-700 border-emerald-500'
      : comment.status === CommentStatus.REJECTED
      ? 'bg-red-100 text-red-700 border-red-500'
      : 'bg-orange-100 text-orange-700 border-orange-500'

  const badgeLabel =
    comment.status === CommentStatus.APPROVED
      ? 'Approved'
      : comment.status === CommentStatus.REJECTED
      ? 'Rejected'
      : 'Pending review'

  return (
    <article className="rounded-2xl border-2 border-black bg-white p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.15)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}
            title={badgeLabel}
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {badgeLabel}
          </div>
          <h3 className="text-lg font-black text-gray-900">
            {comment.postTitle ?? 'General discussion'}
          </h3>
          <p className="text-sm font-medium text-gray-600">{formatDate(comment.createdAt)}</p>
          <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm font-medium text-gray-700">
            {comment.content}
          </p>
        </div>
        {comment.postSlug ? (
          <Link
            href={`/blogs/${comment.postSlug}#comments`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#FF5252] hover:underline"
          >
            Open thread <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </article>
  )
}

const AvatarBubble = ({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl: string | null
}) => (
  <span className="relative inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border-4 border-black bg-[#F6EDE3] text-2xl font-black text-black">
    {avatarUrl ? (
      <Image src={avatarUrl} alt={`${name}'s avatar`} fill sizes="64px" className="object-cover" />
    ) : (
      <UserRound className="h-8 w-8" aria-hidden="true" />
    )}
  </span>
)

const SidebarAvatar = ({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl: string | null
}) => (
  <span className="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border-2 border-black bg-[#F6EDE3] text-xl font-black text-black">
    {avatarUrl ? (
      <Image src={avatarUrl} alt={`${name}'s avatar`} fill sizes="48px" className="object-cover" />
    ) : (
      <UserRound className="h-6 w-6" aria-hidden="true" />
    )}
  </span>
)

const StatusBadge = ({ status }: { status: CapabilityStatus }) => {
  if (status === 'available') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-500 bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700"
        title="Feature enabled"
      >
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Enabled
      </span>
    )
  }

  if (status === 'locked') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border-2 border-gray-400 bg-gray-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-gray-600"
        title="Feature locked"
      >
        Locked
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border-2 border-blue-400 bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700"
      title="Feature coming soon"
    >
      Upcoming
    </span>
  )
}

const CapabilityCard = ({ title, description, icon: Icon, status, ctaHref, ctaLabel }: CapabilityItem) => (
  <div
    className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]"
    title={description}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-black bg-[#F5F3FF] text-[#6C63FF]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-black text-gray-900">{title}</p>
          <p className="mt-1 text-sm font-medium text-gray-600">{description}</p>
        </div>
      </div>
      <StatusBadge status={status} />
    </div>
    {ctaHref && ctaLabel ? (
      <Link
        href={ctaHref}
        className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6C63FF] hover:underline"
        title={ctaLabel}
      >
        {ctaLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    ) : null}
  </div>
)

const AccountSidebar = ({
  profile,
  totals,
  sections,
  isCollapsed,
  onToggleCollapse,
}: {
  profile: AuthenticatedProfileSummary
  totals: UserContributionSnapshot['totals']
  sections: SidebarSection[]
  isCollapsed: boolean
  onToggleCollapse: () => void
}) => (
  <aside
    className={clsx(
      'mb-6 w-full transition-all duration-300 lg:mb-0 lg:flex-shrink-0',
      isCollapsed ? 'lg:w-[96px]' : 'lg:w-[320px] xl:w-[360px]',
    )}
  >
    <div className="lg:sticky lg:top-6">
      <div className="mb-4 flex items-center justify-between lg:justify-end">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 lg:hidden">Workspace</p>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px]"
        >
          <span className="sr-only">{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
          {isCollapsed ? (
            <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="hidden text-[11px] lg:inline">{isCollapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </div>

      <div className={clsx('space-y-6', isCollapsed ? 'lg:hidden' : '')}>
        <div className="rounded-3xl border-4 border-black bg-white p-5 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-4">
            <SidebarAvatar name={profile.displayName} avatarUrl={profile.avatarUrl} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-500">Signed in</p>
              <p className="text-lg font-black text-gray-900">{profile.displayName}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Member since {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div
              className="rounded-2xl border-2 border-black bg-[#F6EDE3] px-3 py-2"
              title="Published posts"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Posts</p>
              <p className="text-xl font-black text-gray-900">{totals.publishedPosts}</p>
            </div>
            <div
              className="rounded-2xl border-2 border-black bg-[#E8F5FF] px-3 py-2"
              title="Total comments contributed"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Comments</p>
              <p className="text-xl font-black text-gray-900">{totals.totalComments}</p>
            </div>
          </div>
        </div>

        <nav className="rounded-3xl border-4 border-black bg-white p-5 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Workspace</p>
          <ul className="mt-4 space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="group flex items-center gap-3 rounded-2xl border-2 border-transparent px-3 py-2 text-sm font-bold text-gray-800 transition hover:border-black hover:bg-[#F5F3FF]"
                  title={`Jump to ${section.label}`}
                >
                  <section.icon className="h-4 w-4 text-[#6C63FF] transition group-hover:scale-110" aria-hidden="true" />
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="rounded-3xl border-4 border-black bg-[#0B0B0F] p-5 text-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.25)]">
          <p className="text-sm font-black uppercase tracking-[0.25em] opacity-70">Shortcuts</p>
          <ul className="mt-4 space-y-3 text-sm font-semibold">
            <li>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-[#FFD66B] hover:underline"
                title="Browse the latest articles"
              >
                Browse editorial feed <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                href="#publishing"
                className="inline-flex items-center gap-2 text-[#6C63FF] hover:underline"
                title="Jump to publishing insights"
              >
                Check drafting stats <Activity className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </li>
            {profile.isAdmin ? (
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-[#7CFBFF] hover:underline"
                  title="Launch the admin console"
                >
                  Review newsroom queue <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <nav
        className={clsx(
          'hidden',
          isCollapsed ? 'lg:flex lg:flex-col lg:items-center lg:gap-4' : '',
        )}
        aria-label="Collapsed account sections"
      >
        <div className="rounded-3xl border-4 border-black bg-white p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
          <ul className="flex flex-col items-center gap-3">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black bg-[#F5F3FF] text-[#6C63FF] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px]"
                  title={`Jump to ${section.label}`}
                >
                  <section.icon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">{section.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  </aside>
)

const SectionHeader = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) => (
  <header className="space-y-1">
    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6C63FF]">{eyebrow}</p>
    <h2 className="text-3xl font-black text-gray-900">{title}</h2>
    <p className="text-sm font-semibold text-gray-600">{description}</p>
  </header>
)

interface ProfileIdentityManagerProps {
  profile: AuthenticatedProfileSummary
  onProfileChange: (patch: Partial<AuthenticatedProfileSummary>) => void
  onRefreshRequested: () => Promise<void>
}

const ProfileIdentityManager = ({
  profile,
  onProfileChange,
  onRefreshRequested,
}: ProfileIdentityManagerProps) => {
  const supabase = useMemo(() => createBrowserClient(), [])
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameStatus, setNameStatus] = useState<StatusMessage | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<StatusMessage | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setDisplayName(profile.displayName)
  }, [profile.displayName])

  const handleNameSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = displayName.trim()

      if (!trimmed) {
        setNameStatus({ tone: 'error', message: 'Display name cannot be empty.' })
        return
      }

      if (trimmed === profile.displayName) {
        setNameStatus({ tone: 'success', message: 'No changes needed — name already saved.' })
        return
      }

      setIsSavingName(true)
      setNameStatus(null)

      try {
        const { error } = await supabase
          .from('profiles')
          .update({ display_name: trimmed })
          .eq('user_id', profile.userId)

        if (error) {
          throw error
        }

        onProfileChange({ displayName: trimmed })
        await onRefreshRequested()
        setNameStatus({ tone: 'success', message: 'Display name updated.' })
      } catch (error) {
        console.error('Failed to update display name', error)
        setNameStatus({ tone: 'error', message: 'Unable to update name. Please try again.' })
      } finally {
        setIsSavingName(false)
      }
    },
    [displayName, onProfileChange, onRefreshRequested, profile.displayName, profile.userId, supabase],
  )

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }

      if (!file.type.startsWith('image/')) {
        setUploadStatus({
          tone: 'error',
          message: 'Please choose an image file (PNG, JPG, GIF, SVG, or WebP).',
        })
        return
      }

      if (file.size > MAX_PROFILE_PHOTO_SIZE) {
        setUploadStatus({ tone: 'error', message: 'Image is larger than 5MB. Choose a smaller file.' })
        return
      }

      setIsUploading(true)
      setUploadStatus(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const previousPath = profile.avatarUrl ? getObjectPathFromPublicUrl(profile.avatarUrl) : null
        if (previousPath) {
          formData.append('previousPath', previousPath)
        }

        const response = await fetch('/api/profile/avatar', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error ?? 'Unable to update profile photo. Please try again.')
        }

        const { avatarUrl } = (await response.json()) as { avatarUrl: string }

        onProfileChange({ avatarUrl })
        await onRefreshRequested()
        setUploadStatus({ tone: 'success', message: 'Profile photo updated.' })
      } catch (error) {
        console.error('Failed to upload avatar', error)
        setUploadStatus({
          tone: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to update profile photo. Please try again.',
        })
      } finally {
        setIsUploading(false)
        if (event.target) {
          event.target.value = ''
        }
      }
    },
    [onProfileChange, onRefreshRequested, profile.avatarUrl],
  )

  const handleRemovePhoto = useCallback(async () => {
    if (!profile.avatarUrl) {
      return
    }

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: profile.avatarUrl }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Unable to remove profile photo. Please try again.')
      }

      onProfileChange({ avatarUrl: null })
      await onRefreshRequested()
      setUploadStatus({ tone: 'success', message: 'Profile photo removed.' })
    } catch (error) {
      console.error('Failed to remove avatar', error)
      setUploadStatus({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to remove profile photo right now.',
      })
    } finally {
      setIsUploading(false)
    }
  }, [onProfileChange, onRefreshRequested, profile.avatarUrl])

  return (
    <div className="rounded-[32px] border-4 border-black bg-white p-6 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <SidebarAvatar name={profile.displayName} avatarUrl={profile.avatarUrl} />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Profile identity</p>
            <p className="text-xl font-black text-gray-900">{profile.displayName}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{profile.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            id="profile-avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-black bg-[#6C63FF] px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] transition hover:-translate-y-[1px]"
            disabled={isUploading}
          >
            Upload new photo
          </button>
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="inline-flex items-center justify-center rounded-md border-2 border-dashed border-black/40 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-gray-700 transition hover:border-black"
            disabled={isUploading || !profile.avatarUrl}
          >
            Remove photo
          </button>
        </div>
      </div>

      {uploadStatus ? (
        <p
          className={`mt-4 rounded-2xl border-2 px-4 py-2 text-sm font-semibold ${
            uploadStatus.tone === 'success'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-red-400 bg-red-50 text-red-700'
          }`}
        >
          {uploadStatus.message}
        </p>
      ) : null}

      <form onSubmit={handleNameSubmit} className="mt-6 space-y-3">
        <label htmlFor="display-name" className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">
          Display name
        </label>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            id="display-name"
            name="display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-xl border-2 border-black bg-[#F8F7FF] px-4 py-2 text-base font-semibold text-gray-900 focus:border-[#6C63FF] focus:outline-none focus:ring-2 focus:ring-[#B7AEFF]"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#FFD66B] px-4 py-2 text-sm font-black uppercase tracking-wide text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] transition hover:-translate-y-[1px] disabled:opacity-60"
            disabled={isSavingName}
          >
            Save name
          </button>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          This name appears on your articles and comments.
        </p>
        {nameStatus ? (
          <p
            className={`rounded-2xl border-2 px-4 py-2 text-sm font-semibold ${
              nameStatus.tone === 'success'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-red-400 bg-red-50 text-red-700'
            }`}
          >
            {nameStatus.message}
          </p>
        ) : null}
      </form>
    </div>
  )
}

export const UserAccountPanel = ({ profile, contributions }: UserAccountPanelProps) => {
  const { refresh: refreshAuthenticatedProfile } = useAuthenticatedProfile()
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(), [])
  const [currentProfile, setCurrentProfile] = useState(profile)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const gamificationSettingsRef = useRef<HTMLDivElement | null>(null)
  const {
    data: gamificationData,
    error: gamificationError,
    isLoading: isGamificationLoading,
    refresh: refreshGamification,
  } = useGamificationProfile()
  const {
    entries: leaderboardEntries,
    error: leaderboardError,
    isLoading: isLeaderboardLoading,
    scope: leaderboardScope,
    refresh: refreshLeaderboard,
  } = useLeaderboard('global')

  useEffect(() => {
    setCurrentProfile(profile)
  }, [profile])

  const primaryRole = useMemo(
    () =>
      currentProfile.roles.find((role) => role.id === currentProfile.primaryRoleId) ??
      currentProfile.roles[0] ??
      null,
    [currentProfile.primaryRoleId, currentProfile.roles],
  )

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true)
    setSignOutError(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      await refreshAuthenticatedProfile().catch(() => {})
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Failed to sign out', error)
      setSignOutError('Unable to sign out right now. Please try again in a moment.')
    } finally {
      setIsSigningOut(false)
    }
  }, [refreshAuthenticatedProfile, router, supabase])

  const activity = useMemo(
    () => buildActivity(contributions.posts, contributions.comments),
    [contributions.comments, contributions.posts],
  )

  const onboardingJourney = currentProfile.onboarding ?? null
  const onboardingResponses: ProfileOnboardingResponses | null = onboardingJourney?.responses ?? null
  const onboardingProgress = computeOnboardingProgress(onboardingJourney)
  const onboardingProgressPercent = Math.round(onboardingProgress * 100)
  const onboardingStatusLabel = onboardingJourney
    ? onboardingJourney.status === 'completed'
      ? 'Completed'
      : onboardingJourney.status === 'in_progress'
      ? 'In progress'
      : 'Action needed'
    : 'Not started'
  const onboardingStatusTone = onboardingJourney
    ? onboardingJourney.status === 'completed'
      ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
      : onboardingJourney.status === 'in_progress'
      ? 'border-[#FFB400] bg-[#FFE9B3] text-[#8C6F21]'
      : 'border-[#FF7043] bg-[#FFD5CC] text-[#8C2F22]'
    : 'border-gray-400 bg-gray-200 text-gray-600'
  const onboardingLastTouch = onboardingJourney?.updatedAt ?? onboardingJourney?.completedAt ?? currentProfile.createdAt
  const onboardingCtaLabel = onboardingJourney?.status === 'completed' ? 'Update preferences' : 'Resume onboarding'

  const onboardingPersona = onboardingResponses?.persona
    ? onboardingPersonaDictionary[onboardingResponses.persona]
    : null
  const onboardingExperienceLabel = onboardingResponses?.experienceLevel
    ? onboardingExperienceDictionary[onboardingResponses.experienceLevel]
    : null
  const onboardingGoals = onboardingResponses
    ? formatOnboardingList(onboardingResponses.motivations, onboardingGoalDictionary)
    : []
  const onboardingContributions = onboardingResponses
    ? formatOnboardingList(onboardingResponses.focusAreas, onboardingContributionDictionary)
    : []
  const onboardingLearning = onboardingResponses
    ? formatOnboardingList(onboardingResponses.preferredLearningFormats, onboardingLearningDictionary)
    : []
  const onboardingSupport = onboardingResponses
    ? formatOnboardingList(onboardingResponses.supportPreferences, onboardingSupportDictionary)
    : []
  const onboardingCommunications = onboardingResponses
    ? formatOnboardingList(
        onboardingResponses.communicationPreferences,
        onboardingCommunicationDictionary,
      )
    : []
  const onboardingAccountability = onboardingResponses?.accountabilityStyle
    ? onboardingAccountabilityDictionary[onboardingResponses.accountabilityStyle]
    : null

  const requiredRules: RuleItem[] = [
    {
      title: 'Verified email address',
      description: currentProfile.emailConfirmedAt
        ? `Verified on ${formatDate(currentProfile.emailConfirmedAt)}`
        : 'Confirm your email to secure account recovery.',
      status: currentProfile.emailConfirmedAt ? 'complete' : 'pending',
    },
    {
      title: 'Recognizable display name',
      description: `Visible to the community as ${currentProfile.displayName}.`,
      status: currentProfile.displayName ? 'complete' : 'pending',
    },
  ]

  const recommendedRules: RuleItem[] = [
    {
      title: 'Profile photo',
      description: currentProfile.avatarUrl
        ? 'Looking sharp with a custom avatar.'
        : 'Upload a photo to personalize your presence.',
      status: currentProfile.avatarUrl ? 'complete' : 'pending',
    },
    {
      title: 'Primary role selected',
      description: primaryRole
        ? `Leading as ${primaryRole.name}.`
        : 'Assign yourself a primary role to tailor recommendations.',
      status: primaryRole ? 'complete' : 'pending',
    },
  ]

  const complimentaryBenefits: RuleItem[] = [
    {
      title: 'Members-only drops',
      description: 'Enjoy early access to podcasts, changelog briefings, and community events.',
      status: 'complete',
    },
    {
      title: 'Curated learning paths',
      description: 'Bookmark tutorials and we will stitch them into a weekly study plan for you.',
      status: 'complete',
    },
  ]

  const attentionItems: RuleItem[] = []

  if (contributions.totals.pendingComments > 0) {
    attentionItems.push({
      title: 'Comments awaiting review',
      description: `${contributions.totals.pendingComments} comment${
        contributions.totals.pendingComments === 1 ? '' : 's'
      } pending moderator approval.`,
      status: 'attention',
    })
  }

  if (contributions.totals.rejectedComments > 0) {
    attentionItems.push({
      title: 'Rejected feedback',
      description: `${contributions.totals.rejectedComments} comment${
        contributions.totals.rejectedComments === 1 ? '' : 's'
      } need revision for compliance.`,
      status: 'attention',
    })
  }

  if (contributions.totals.publishedPosts === 0) {
    attentionItems.push({
      title: 'Share your first story',
      description: 'Draft something brilliant—your voice is missing from the feed.',
      status: 'pending',
    })
  }

  const navigationSections: SidebarSection[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'identity', label: 'Identity & access', icon: IdCard },
    { id: 'publishing', label: 'Publishing', icon: PenSquare },
    { id: 'community', label: 'Community impact', icon: UsersRound },
    { id: 'capabilities', label: 'Capabilities', icon: ShieldCheck },
    { id: 'rules', label: 'House rules', icon: Scale },
    { id: 'resources', label: 'Resources', icon: NotebookPen },
  ]

  const capabilities: CapabilityItem[] = useMemo(() => {
    const items: CapabilityItem[] = [
      {
        title: 'Publish long-form stories',
        description: 'Draft, schedule, and share articles that appear in the main Syntax & Sips feed.',
        icon: FileText,
        status: 'available',
        ctaHref: '#publishing',
        ctaLabel: 'Review your drafts',
      },
      {
        title: 'Join community discussions',
        description: 'Comment on posts, reply to peers, and keep the threads constructive.',
        icon: MessageCircle,
        status: 'available',
        ctaHref: '#community',
        ctaLabel: 'Open community timeline',
      },
      {
        title: 'Curate personal reading list',
        description: 'Bookmark tutorials, podcasts, and changelog updates for future study sessions.',
        icon: NotebookPen,
        status: 'upcoming',
      },
      {
        title: 'Analytics snapshot',
        description: 'Track read-through rates, referral sources, and top-performing headlines.',
        icon: Activity,
        status: 'upcoming',
      },
    ]

    if (currentProfile.isAdmin) {
      items.push(
        {
          title: 'Moderate newsroom queue',
          description: 'Approve articles, review comments, and update contributor roles.',
          icon: ShieldCheck,
          status: 'available',
          ctaHref: '/admin',
          ctaLabel: 'Launch admin tools',
        },
        {
          title: 'Access compliance reports',
          description: 'Audit contribution trends, flag policy violations, and export reports.',
          icon: Scale,
          status: 'available',
          ctaHref: '/admin?tab=reports',
          ctaLabel: 'View reports',
        },
      )
    }

    return items
  }, [currentProfile.isAdmin])

  const handleProfileChange = useCallback(
    (patch: Partial<AuthenticatedProfileSummary>) => {
      setCurrentProfile((previous) => ({ ...previous, ...patch }))
    },
    [],
  )

  const greetingSource = currentProfile.displayName?.trim().length
    ? currentProfile.displayName.trim()
    : currentProfile.email
  const greetingFirstWord = greetingSource.split(' ')[0] ?? greetingSource
  const heroGreeting = `नमस्ते ${greetingFirstWord}!`

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((previous) => !previous)
  }, [])

  const handleLeaderboardScopeChange = useCallback(
    (nextScope: 'global' | 'weekly' | 'monthly' | 'seasonal') => {
      void refreshLeaderboard(nextScope)
    },
    [refreshLeaderboard],
  )

  const handleGamificationSettingsUpdated = useCallback(() => {
    void refreshGamification()
  }, [refreshGamification])

  const handleOpenGamificationSettings = useCallback(() => {
    gamificationSettingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="neo-brutalism min-h-screen bg-gradient-to-br from-[#FFF5F1] via-[#F8F0FF] to-[#E3F2FF] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
        <AccountSidebar
          profile={currentProfile}
          totals={contributions.totals}
          sections={navigationSections}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <div
          className={clsx(
            'flex-1',
            'lg:h-[calc(100vh-6rem)] lg:overflow-y-auto',
            isSidebarCollapsed ? 'lg:pr-0' : 'lg:pr-4',
          )}
        >
          <div className="space-y-16 pb-24">
          <section id="overview" className="scroll-mt-28 space-y-6">
            <SectionHeader
              eyebrow="Overview"
              title="Your Syntax & Sips HQ"
              description="A personalized cockpit for tracking contributions, audience resonance, and account health."
            />

            <div className="rounded-[32px] border-4 border-black bg-white p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.2)]">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <AvatarBubble name={currentProfile.displayName} avatarUrl={currentProfile.avatarUrl} />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.35em] text-gray-500">Profile dashboard</p>
                    <h1 className="mt-2 text-3xl font-black leading-tight text-gray-900">{heroGreeting}</h1>
                    <p className="mt-1 text-base font-semibold text-gray-600">
                      You are steering your Syntax &amp; Sips journey like a pro.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFD66B] px-4 py-1 text-xs font-black uppercase tracking-wide text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {primaryRole ? primaryRole.name : 'Community member'}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Member since {formatDate(currentProfile.createdAt)}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Last active {formatRelative(currentProfile.lastSignInAt)}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border-2 border-black bg-[#6C63FF] p-4 text-white shadow-[8px_8px_0px_0px_rgba(108,99,255,0.35)]">
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Account email</p>
                  <p className="mt-2 break-all text-lg font-bold">{currentProfile.email}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Session persisted until you sign out
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.18)]">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Roles</p>
                  <ul className="mt-3 space-y-2 text-sm font-semibold text-gray-700">
                    {currentProfile.roles.length > 0 ? (
                      currentProfile.roles.map((role) => (
                        <li
                          key={role.id}
                          className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-gray-50 px-3 py-1"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-[#6C63FF]" aria-hidden="true" />
                          {role.name}
                        </li>
                      ))
                    ) : (
                      <li>No roles assigned yet.</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.18)]">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Most recent activity</p>
                  {activity[0] ? (
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-bold text-gray-900">{activity[0].title}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {activity[0].description}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {formatRelative(activity[0].timestamp)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      Start contributing to see your timeline fill up.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div className="flex h-full flex-col gap-4 rounded-3xl border-2 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Onboarding status</p>
                    <h3 className="text-xl font-black text-gray-900">Personalised orientation</h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-xs font-black uppercase tracking-wide ${onboardingStatusTone}`}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {onboardingStatusLabel}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600">
                  {onboardingJourney?.status === 'completed'
                    ? 'You have unlocked the full account experience—update your answers anytime to keep recommendations sharp.'
                    : 'Share a few details so we can tailor programs, invites, and editorial feedback to your goals.'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-gray-500">
                    <span>Progress</span>
                    <span>{onboardingProgressPercent}%</span>
                  </div>
                  <div className="h-3 rounded-full border-2 border-black bg-white">
                    <div
                      className="h-full rounded-full bg-[#6C63FF]"
                      style={{ width: `${Math.min(onboardingProgressPercent, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <span>Last updated {formatRelative(onboardingLastTouch)}</span>
                  <Link
                    href="/onboarding?redirect=/account"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFD66B] px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:-translate-y-[1px]"
                  >
                    {onboardingCtaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)]">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Member blueprint</p>
                <h3 className="text-xl font-black text-gray-900">How we personalise your journey</h3>
                {onboardingResponses ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-[#FFD66B]">
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-gray-500">Primary persona</p>
                          <p className="text-sm font-bold text-gray-900">
                            {onboardingPersona?.title ?? 'Let’s capture your persona'}
                          </p>
                          <p className="text-xs font-semibold text-gray-600">
                            {onboardingPersona?.summary ?? 'Complete onboarding to personalise your dashboard.'}
                          </p>
                          {onboardingExperienceLabel ? (
                            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                              <ShieldCheck className="h-3.5 w-3.5 text-[#6C63FF]" aria-hidden="true" />
                              {onboardingExperienceLabel}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border-2 border-black bg-[#F8F7FF] p-4">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#6C63FF]">
                          <Goal className="h-3.5 w-3.5" aria-hidden="true" /> Priority outcomes
                        </h4>
                        {onboardingGoals.length > 0 ? (
                          <ul className="mt-2 space-y-1 text-sm font-semibold text-gray-700">
                            {onboardingGoals.map((goal) => (
                              <li key={goal} className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#6C63FF]" aria-hidden="true" />
                                {goal}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs font-semibold text-gray-500">
                            Share the outcomes you are chasing to tailor your updates.
                          </p>
                        )}
                      </div>
                      <div className="rounded-2xl border-2 border-black bg-[#FFF5F1] p-4">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#FF8A65]">
                          <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" /> Planned contributions
                        </h4>
                        {onboardingContributions.length > 0 ? (
                          <ul className="mt-2 space-y-1 text-sm font-semibold text-gray-700">
                            {onboardingContributions.map((item) => (
                              <li key={item} className="flex items-center gap-2">
                                <NotebookPen className="h-3.5 w-3.5 text-[#FF8A65]" aria-hidden="true" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs font-semibold text-gray-500">
                            Tell us how you want to contribute so we can line up opportunities.
                          </p>
                        )}
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Formats you love:{' '}
                          {onboardingLearning.length > 0
                            ? onboardingLearning.join(', ')
                            : 'Choose at least one learning style'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border-2 border-black bg-[#E8F8FF] p-4">
                      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#2E7D32]">
                        <Target className="h-3.5 w-3.5" aria-hidden="true" /> Support &amp; check-ins
                      </h4>
                      {onboardingSupport.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm font-semibold text-gray-700">
                          {onboardingSupport.map((item) => (
                            <li key={item} className="flex items-center gap-2">
                              <Target className="h-3.5 w-3.5 text-[#2E7D32]" aria-hidden="true" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs font-semibold text-gray-500">
                          Flag the support you want so we can coordinate the right experiences.
                        </p>
                      )}
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Accountability style:{' '}
                        {onboardingAccountability ?? 'Pick what keeps you motivated'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {onboardingCommunications.length > 0 ? (
                          onboardingCommunications.map((item) => (
                            <span
                              key={item}
                              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600"
                            >
                              <CalendarCheck2 className="h-3.5 w-3.5 text-[#6C63FF]" aria-hidden="true" />
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-gray-500">
                            Choose how we should keep in touch.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-sm font-semibold text-gray-600">
                    Complete onboarding to see your personalised goals, contribution plan, and support preferences here.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Published pieces"
                value={contributions.totals.publishedPosts}
                accent="rgba(108, 99, 255, 0.25)"
                helper="Stories visible to the community"
              />
              <StatCard
                label="Drafts in progress"
                value={contributions.totals.draftPosts}
                accent="rgba(255, 214, 107, 0.45)"
                helper="Ideas waiting for the final polish"
              />
              <StatCard
                label="Total reads"
                value={contributions.totals.totalViews}
                accent="rgba(124, 251, 255, 0.35)"
                helper="Lifetime audience views"
              />
              <StatCard
                label="Community replies"
                value={contributions.totals.totalComments}
                accent="rgba(255, 82, 82, 0.35)"
                helper="Conversations you have sparked"
              />
            </div>

            <div className="space-y-6">
              {gamificationError ? (
                <div className="rounded-3xl border-2 border-red-400 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {gamificationError}
                </div>
              ) : null}
              {isGamificationLoading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {[0, 1].map((item) => (
                    <div
                      key={`gamification-skeleton-${item}`}
                      className="h-64 animate-pulse rounded-3xl border-2 border-black/10 bg-white/70"
                    />
                  ))}
                </div>
              ) : gamificationData ? (
                <>
                  <GamificationSummary data={gamificationData} onOpenSettings={handleOpenGamificationSettings} />
                  <BadgeShowcase badges={gamificationData.badges} />
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <ChallengeList challenges={gamificationData.challengeProgress} />
                    <div className="space-y-6">
                      <LeaderboardPanel
                        entries={isLeaderboardLoading ? [] : leaderboardEntries}
                        scope={leaderboardScope}
                        onScopeChange={handleLeaderboardScopeChange}
                        isLoading={isLeaderboardLoading}
                      />
                      {leaderboardError ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
                          {leaderboardError}
                        </p>
                      ) : null}
                      <div ref={gamificationSettingsRef}>
                        <GamificationSettingsCard
                          profile={gamificationData.profile}
                          onUpdated={handleGamificationSettingsUpdated}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border-2 border-dashed border-gray-400 bg-white p-6 text-sm font-semibold text-gray-600">
                  Opt into gamification from your profile settings to unlock points, badges, and seasonal quests.
                </div>
              )}
            </div>
          </section>

          <section id="identity" className="scroll-mt-28 space-y-6">
            <SectionHeader
              eyebrow="Identity"
              title="Manage profile identity and security"
              description="Refresh your public details, keep your avatar current, and review how your account stays signed in."
            />

            <ProfileIdentityManager
              profile={currentProfile}
              onProfileChange={handleProfileChange}
              onRefreshRequested={refreshAuthenticatedProfile}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
                <h3 className="text-xl font-black text-gray-900">Account access</h3>
                <p className="mt-2 text-sm font-medium text-gray-600">
                  You are signed in with a community account.
                  {currentProfile.isAdmin ? (
                    <span className="font-semibold text-[#6C63FF]">
                      {' '}
                      You also have admin permissions with newsroom oversight.
                    </span>
                  ) : (
                    <span> Contribute consistently to unlock elevated privileges.</span>
                  )}
                </p>
                <p className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Session stays active until you sign out. Close your browser without worry—your reading queue and drafts follow you.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-black bg-[#FF5252] px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    title="Sign out of your Syntax &amp; Sips account"
                  >
                    {isSigningOut ? 'Signing out…' : 'Sign out securely'}
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Need to switch accounts? Sign out first.
                  </span>
                </div>
                {signOutError ? (
                  <p className="mt-3 rounded-2xl border-2 border-red-400 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
                    {signOutError}
                  </p>
                ) : null}
                {currentProfile.isAdmin ? (
                  <Link
                    href="/admin"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#6C63FF] hover:underline"
                  >
                    Go to admin console <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
              <div className="rounded-[28px] border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
                <h3 className="text-xl font-black text-gray-900">Security log</h3>
                <ul className="mt-3 space-y-3 text-sm font-semibold text-gray-600">
                  <li className="flex items-center justify-between">
                    <span>Last sign in</span>
                    <span>{formatDate(currentProfile.lastSignInAt)}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Email confirmed</span>
                    <span>{currentProfile.emailConfirmedAt ? formatDate(currentProfile.emailConfirmedAt) : 'Pending'}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Account created</span>
                    <span>{formatDate(currentProfile.createdAt)}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section id="publishing" className="scroll-mt-28 space-y-6">
            <SectionHeader
              eyebrow="Publishing"
              title="Contribution velocity"
              description="Monitor how your stories are performing, keep drafts on track, and plan upcoming releases."
            />

            {contributions.posts.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {contributions.posts.slice(0, 6).map((post) => (
                  <ContributionCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-sm font-semibold text-gray-600">
                You have not published anything yet. Spin up a draft and share your expertise with the community.
              </div>
            )}
          </section>

          <section id="community" className="scroll-mt-28 space-y-6">
            <SectionHeader
              eyebrow="Community"
              title="Engagement timeline"
              description="Keep tabs on discussions you have started and how moderators responded to your contributions."
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900">Recent comments</h3>
                {contributions.comments.length > 0 ? (
                  contributions.comments.slice(0, 5).map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-sm font-semibold text-gray-600">
                    Join the discussion on a post to see your contributions here.
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900">Activity timeline</h3>
                {activity.length > 0 ? (
                  <ol className="space-y-4">
                    {activity.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-2xl border-2 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                entry.badgeTone === 'emerald'
                                  ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                                  : entry.badgeTone === 'orange'
                                  ? 'border-orange-500 bg-orange-100 text-orange-700'
                                  : entry.badgeTone === 'blue'
                                  ? 'border-blue-500 bg-blue-100 text-blue-700'
                                  : entry.badgeTone === 'red'
                                  ? 'border-red-500 bg-red-100 text-red-700'
                                  : 'border-purple-500 bg-purple-100 text-purple-700'
                              }`}
                            >
                              {entry.type === 'post' ? (
                                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                              ) : (
                                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              )}
                              {entry.statusLabel}
                            </span>
                            <p className="text-lg font-black text-gray-900">{entry.title}</p>
                            <p className="text-sm font-semibold text-gray-600">{entry.description}</p>
                            {entry.excerpt ? (
                              <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm font-medium text-gray-700">
                                {entry.excerpt}
                              </p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              {formatDate(entry.timestamp)}
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              {formatRelative(entry.timestamp)}
                            </p>
                            {entry.href ? (
                              <Link
                                href={entry.href}
                                className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6C63FF] hover:underline"
                              >
                                Jump to detail <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-sm font-semibold text-gray-600">
                    Your activity trail will appear here once you publish articles or join discussions.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="capabilities" className="scroll-mt-28 space-y-6">
            <SectionHeader
              eyebrow="Capabilities"
              title="What you can do inside Syntax & Sips"
              description="A quick reference of powers already unlocked and features coming soon for your membership tier."
            />

            <div className="grid gap-6 md:grid-cols-2">
              {capabilities.map((capability) => (
                <CapabilityCard key={capability.title} {...capability} />
              ))}
            </div>
          </section>

          <section id="rules" className="scroll-mt-28 space-y-6">
            <SectionHeader
              eyebrow="Guidelines"
              title="House rules & benefits"
              description="Keep these essentials, recommendations, and perks in sight to stay in good standing and maximize your membership."
            />

            <div className="grid gap-6 lg:grid-cols-4">
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  Required
                </h3>
                {requiredRules.map((rule) => (
                  <RuleCard key={rule.title} {...rule} />
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <Sparkles className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
                  Recommended
                </h3>
                {recommendedRules.map((rule) => (
                  <RuleCard key={rule.title} {...rule} />
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <Award className="h-5 w-5 text-[#FF8A65]" aria-hidden="true" />
                  Complimentary perks
                </h3>
                {complimentaryBenefits.map((rule) => (
                  <RuleCard key={rule.title} {...rule} />
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                  Needs attention
                </h3>
                {attentionItems.length > 0 ? (
                  attentionItems.map((rule) => <RuleCard key={rule.title} {...rule} />)
                ) : (
                  <div className="rounded-2xl border-2 border-black bg-white p-4 text-sm font-semibold text-gray-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)]">
                    All clear! Keep up the excellent community etiquette.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="resources" className="scroll-mt-28 space-y-6">
            <SectionHeader
              eyebrow="Support"
              title="Resources & help desk"
              description="Need a refresher on guidelines or a human to chat with? Start here to find the right channel."
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]">
                <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <NotebookPen className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
                  Contributor playbook
                </h3>
                <p className="mt-2 text-sm font-medium text-gray-600">
                  Review formatting expectations, tone guidance, and examples of exceptional submissions.
                </p>
                <Link
                  href="/resources"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6C63FF] hover:underline"
                >
                  Browse resources <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]">
                <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <LifeBuoy className="h-5 w-5 text-[#FF5252]" aria-hidden="true" />
                  Contact the editors
                </h3>
                <p className="mt-2 text-sm font-medium text-gray-600">
                  Need feedback on a draft or help recovering an account? Reach out and we will respond quickly.
                </p>
                <Link
                  href="mailto:editors@syntaxandsips.dev"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#FF5252] hover:underline"
                >
                  Email editorial desk <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]">
                <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <UsersRound className="h-5 w-5 text-[#FFD66B]" aria-hidden="true" />
                  Admin insights
                </h3>
                <p className="mt-2 text-sm font-medium text-gray-600">
                  Admins can review member contributions, flag policy violations, and assign new privileges.
                </p>
                <Link
                  href={currentProfile.isAdmin ? '/admin' : '#community'}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#FFD66B] hover:underline"
                >
                  {currentProfile.isAdmin ? 'Open moderation tools' : 'See how you contribute'}{' '}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  )
}
