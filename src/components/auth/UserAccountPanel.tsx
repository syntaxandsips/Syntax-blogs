import Image from 'next/image'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import type {
  AuthenticatedProfileSummary,
  UserCommentSummary,
  UserContributionSnapshot,
  UserPostSummary,
} from '@/utils/types'
import { CommentStatus, PostStatus } from '@/utils/types'
import '@/styles/neo-brutalism.css'

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
  <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)]">
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
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
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
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
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
}) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <span className="relative inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border-4 border-black bg-[#F6EDE3] text-2xl font-black text-black">
      {avatarUrl ? (
        <Image src={avatarUrl} alt={`${name}'s avatar`} fill sizes="64px" className="object-cover" />
      ) : initials ? (
        initials
      ) : (
        <UserRound className="h-8 w-8" aria-hidden="true" />
      )}
    </span>
  )
}

export const UserAccountPanel = ({ profile, contributions }: UserAccountPanelProps) => {
  const primaryRole = profile.roles.find((role) => role.id === profile.primaryRoleId) ?? profile.roles[0] ?? null
  const activity = buildActivity(contributions.posts, contributions.comments)

  const requiredRules: RuleItem[] = [
    {
      title: 'Verified email address',
      description: profile.emailConfirmedAt
        ? `Verified on ${formatDate(profile.emailConfirmedAt)}`
        : 'Confirm your email to secure account recovery.',
      status: profile.emailConfirmedAt ? 'complete' : 'pending',
    },
    {
      title: 'Recognizable display name',
      description: `Visible to the community as ${profile.displayName}.`,
      status: profile.displayName ? 'complete' : 'pending',
    },
  ]

  const recommendedRules: RuleItem[] = [
    {
      title: 'Profile photo',
      description: profile.avatarUrl ? 'Looking sharp with a custom avatar.' : 'Upload a photo to personalize your presence.',
      status: profile.avatarUrl ? 'complete' : 'pending',
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
      description: `${contributions.totals.pendingComments} comment${contributions.totals.pendingComments === 1 ? '' : 's'} pending moderator approval.`,
      status: 'attention',
    })
  }

  if (contributions.totals.rejectedComments > 0) {
    attentionItems.push({
      title: 'Rejected feedback',
      description: `${contributions.totals.rejectedComments} comment${contributions.totals.rejectedComments === 1 ? '' : 's'} need revision for compliance.`,
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

  const heroGreeting = `Bonjour ${profile.displayName.split(' ')[0] ?? profile.displayName},`;

  return (
    <div className="neo-brutalism min-h-screen bg-gradient-to-br from-[#FFF5F1] via-[#F8F0FF] to-[#E3F2FF] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[32px] border-4 border-black bg-white p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.2)]">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <AvatarBubble name={profile.displayName} avatarUrl={profile.avatarUrl} />
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.35em] text-gray-500">Profile dashboard</p>
                  <h1 className="mt-2 text-3xl font-black leading-tight text-gray-900">
                    {heroGreeting}
                  </h1>
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
                  Member since {formatDate(profile.createdAt)}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Last active {formatRelative(profile.lastSignInAt)}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border-2 border-black bg-[#6C63FF] p-4 text-white shadow-[8px_8px_0px_0px_rgba(108,99,255,0.35)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Account email</p>
                <p className="mt-2 text-lg font-bold break-all">{profile.email}</p>
                <p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Session persisted until you sign out
                </p>
              </div>
              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.18)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Roles</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-gray-700">
                  {profile.roles.length > 0 ? (
                    profile.roles.map((role) => (
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
                  <p className="mt-3 text-sm font-semibold text-gray-600">Start contributing to see your timeline fill up.</p>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
              <h2 className="text-xl font-black text-gray-900">Account access</h2>
              <p className="mt-2 text-sm font-medium text-gray-600">
                You are signed in with a community account.
                {profile.isAdmin ? (
                  <span className="font-semibold text-[#6C63FF]"> You also have admin permissions with newsroom oversight.</span>
                ) : (
                  <span> Contribute consistently to unlock elevated privileges.</span>
                )}
              </p>
              <p className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs font-semibold uppercase tracking-wide text-gray-600">
                Session stays active until you sign out. Close your browser without worry—your reading queue and drafts follow you.
              </p>
              {profile.isAdmin ? (
                <Link
                  href="/admin"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.18)] transition hover:-translate-y-[1px]"
                >
                  Enter admin control <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href="/admin/login"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.18)] transition hover:-translate-y-[1px]"
                >
                  Admins sign in here <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>

            {profile.isAdmin ? (
              <div className="rounded-[28px] border-4 border-black bg-[#E3F2FF] p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-8 w-8 text-[#1E88E5]" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Editorial oversight</h3>
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      Track contributor momentum, approve comments, and keep the newsroom tidy from the admin console.
                    </p>
                    <Link
                      href="/admin/users"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#1E88E5] hover:underline"
                    >
                      Review community contributions <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </section>

        <section id="contributions" className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Your contribution cockpit</h2>
              <p className="text-sm font-semibold text-gray-600">
                Monitor story output, audience engagement, and community conversations at a glance.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
              <Activity className="h-4 w-4" aria-hidden="true" />
              Live sync enabled
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Published posts"
              value={contributions.totals.publishedPosts}
              helper="Live for the community to enjoy"
              accent="rgba(108,99,255,0.25)"
            />
            <StatCard
              label="Drafts in motion"
              value={contributions.totals.draftPosts}
              helper="Polish and publish when ready"
              accent="rgba(255,82,82,0.25)"
            />
            <StatCard
              label="Total comments"
              value={contributions.totals.totalComments}
              helper="Conversations you sparked"
              accent="rgba(255,214,107,0.35)"
            />
            <StatCard
              label="Total reads"
              value={contributions.totals.totalViews}
              helper="Cumulative article views"
              accent="rgba(76,175,80,0.25)"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                <FileText className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
                Featured drafts &amp; publications
              </h3>
              {contributions.posts.length > 0 ? (
                contributions.posts.slice(0, 3).map((post) => <ContributionCard key={post.id} post={post} />)
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-sm font-semibold text-gray-600">
                  No posts yet. Start a new story from the admin console or request author access.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
                <MessageCircle className="h-5 w-5 text-[#FF5252]" aria-hidden="true" />
                Community conversations
              </h3>
              {contributions.comments.length > 0 ? (
                contributions.comments.slice(0, 3).map((comment) => <CommentCard key={comment.id} comment={comment} />)
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-sm font-semibold text-gray-600">
                  Jump into the comments to cheer on fellow makers or ask thoughtful questions.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900">Live activity timeline</h2>
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
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">House rules &amp; benefits</h2>
            <p className="text-sm font-semibold text-gray-600">
              Keep these essentials, recommendations, and perks in sight to stay in good standing and maximize your membership.
            </p>
          </div>

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
      </div>
    </div>
  )
}
