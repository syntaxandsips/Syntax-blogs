'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2, ArrowRight, Sparkles } from 'lucide-react'
import type { LibraryStatsResponse, LibraryActivityEntry } from '@/lib/library/types'
import type { Bookmark, Highlight, ReadingHistoryEntry } from '@/utils/types'
import { cn } from '@/lib/utils'

interface LibraryDashboardProps {
  initialStats: LibraryStatsResponse
  profileName: string
}

type StatsRange = '7d' | '30d' | '90d' | '365d'

const rangeOptions: Array<{ label: string; value: StatsRange }> = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '1 year', value: '365d' },
]

const libraryNavigation = [
  { href: '/me', label: 'Overview' },
  { href: '/me/lists', label: 'Your lists' },
  { href: '/me/saved-lists', label: 'Saved lists' },
  { href: '/me/highlights', label: 'Highlights' },
  { href: '/me/history', label: 'Reading history' },
  { href: '/me/responses', label: 'Responses' },
]

const quickLinks = [
  { href: '/me/lists', label: 'Create a list', color: '#FAD0C9' },
  { href: '/me/highlights', label: 'Review highlights', color: '#C5F0D0' },
  { href: '/me/history', label: 'Continue reading', color: '#C9E4FF' },
]

export function LibraryDashboard({ initialStats, profileName }: LibraryDashboardProps) {
  const [stats, setStats] = useState(initialStats)
  const [range, setRange] = useState<StatsRange>('30d')
  const [loadingStats, setLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [activity, setActivity] = useState<LibraryActivityEntry[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [activityError, setActivityError] = useState<string | null>(null)
  const pathname = usePathname()
  const normalizedPath = (() => {
    const candidate = (pathname ?? '/me').replace(/\/$/, '')
    return candidate.length > 0 ? candidate : '/me'
  })()
  const firstName = profileName.trim().split(/\s+/)[0] || 'friend'

  const fetchStats = useCallback(async (nextRange: StatsRange) => {
    setLoadingStats(true)
    setStatsError(null)
    try {
      const response = await fetch(`/api/library/stats?range=${nextRange}`, {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error ?? 'Unable to load stats')
      }

      const payload = (await response.json()) as LibraryStatsResponse
      setStats(payload)
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Unable to load stats')
    } finally {
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    const loadActivity = async () => {
      setLoadingActivity(true)
      setActivityError(null)
      try {
        const [bookmarksRes, highlightsRes, historyRes] = await Promise.all([
          fetch('/api/library/bookmarks?limit=5', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/library/highlights?limit=5', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/library/history?limit=5', { credentials: 'include', cache: 'no-store' }),
        ])

        if (!bookmarksRes.ok || !highlightsRes.ok || !historyRes.ok) {
          throw new Error('Unable to load recent activity')
        }

        const bookmarksPayload = (await bookmarksRes.json()) as { items: Bookmark[] }
        const highlightsPayload = (await highlightsRes.json()) as { items: Highlight[] }
        const historyPayload = (await historyRes.json()) as { items: ReadingHistoryEntry[] }

        const items: LibraryActivityEntry[] = []

        for (const bookmark of bookmarksPayload.items ?? []) {
          items.push({
            id: `bookmark-${bookmark.id}`,
            type: 'bookmark',
            title: bookmark.postTitle,
            subtitle: 'Saved for later',
            occurredAt: bookmark.createdAt,
            metadata: { slug: bookmark.postSlug },
          })
        }

        for (const highlight of highlightsPayload.items ?? []) {
          items.push({
            id: `highlight-${highlight.id}`,
            type: 'highlight',
            title: highlight.postTitle,
            subtitle: highlight.highlightedText.slice(0, 120),
            occurredAt: highlight.createdAt,
            metadata: { color: highlight.color },
          })
        }

        for (const entry of historyPayload.items ?? []) {
          items.push({
            id: `history-${entry.id}`,
            type: 'history',
            title: entry.postTitle,
            subtitle: entry.completed ? 'Completed reading' : 'Still reading',
            occurredAt: entry.readAt,
            metadata: { progress: entry.scrollPercentage ?? 0 },
          })
        }

        items.sort((a, b) => (a.occurredAt > b.occurredAt ? -1 : 1))
        setActivity(items.slice(0, 9))
      } catch (error) {
        setActivityError(error instanceof Error ? error.message : 'Unable to load activity')
      } finally {
        setLoadingActivity(false)
      }
    }

    loadActivity()
  }, [])

  const statCards = useMemo(
    () => [
      {
        label: 'Saved posts',
        value: stats.stats.totalBookmarks,
        accent: '#3F2B96',
        background: '#E9E4FF',
      },
      {
        label: 'Custom lists',
        value: stats.stats.totalLists,
        accent: '#D946AA',
        background: '#FFE2F3',
      },
      {
        label: 'Highlights',
        value: stats.stats.totalHighlights,
        accent: '#0678A1',
        background: '#D9F2FF',
      },
      {
        label: 'Reading streak',
        value: stats.stats.readingStreak,
        accent: '#137B4D',
        background: '#DDF8E7',
      },
    ],
    [stats],
  )

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-10">
      <header className="rounded-[32px] border-4 border-black bg-[#F7F4FF] p-8 shadow-[12px_12px_0_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/60">Library overview</p>
            <h1 className="text-4xl font-black text-black">Your library</h1>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/50">Keep exploring, {firstName}!</p>
            <p className="max-w-2xl text-base leading-relaxed text-black/70">
              Track everything you&apos;ve saved, highlighted, and read across Syntax &amp; Sips. Pick up right where you left off with
              a layout that keeps things aligned and easy to scan.
            </p>
          </div>
          <Link
            href="/me/lists"
            className="inline-flex items-center justify-center rounded-full border-4 border-black bg-black px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[8px_8px_0_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40"
          >
            Start a new list
          </Link>
        </div>
        <nav aria-label="Library sections" className="mt-6 flex flex-wrap gap-2">
          {libraryNavigation.map((item) => {
            const isActive = normalizedPath === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'rounded-full border-2 border-black px-4 py-2 text-sm font-semibold shadow-[4px_4px_0_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40',
                  isActive ? 'bg-black text-white' : 'bg-white text-black',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <section aria-labelledby="library-stats" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="library-stats" className="text-xl font-black text-black">
            Snapshot
          </h2>
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => {
              const isActive = option.value === range
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setRange(option.value)
                    void fetchStats(option.value)
                  }}
                  className={cn(
                    'rounded-full border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-[4px_4px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40',
                    isActive ? 'bg-[#111111] text-white' : 'bg-white text-black',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {statsError ? (
          <div className="rounded-[24px] border-4 border-black bg-[#FFDC7C] p-4 text-sm font-semibold text-black">
            {statsError}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[28px] border-4 border-black p-6 shadow-[10px_10px_0_rgba(0,0,0,0.18)]"
              style={{ backgroundColor: card.background }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold uppercase tracking-wide text-black/70">{card.label}</p>
                <span
                  className="inline-flex h-3 w-3 rounded-full border-2 border-black"
                  style={{ backgroundColor: card.accent }}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-6 text-4xl font-black text-black">{card.value.toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Library insights" className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="rounded-[32px] border-4 border-black bg-[#C9E4FF] p-6 shadow-[12px_12px_0_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-black">Reading timeline</h2>
            {loadingStats ? <Loader2 className="h-5 w-5 animate-spin text-black" aria-hidden="true" /> : null}
          </div>
          <p className="mt-2 text-sm text-black/70">Minutes read per day</p>
          {stats.readingTimeline.length === 0 ? (
            <p className="mt-6 rounded-[24px] border-4 border-dashed border-black/40 bg-white/70 px-4 py-4 text-sm font-semibold text-black/70">
              We&apos;ll chart your reading streak once you dive into a story.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-7 gap-3 text-xs sm:text-[0.7rem]">
              {stats.readingTimeline.map((entry) => (
                <div key={entry.date} className="flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-full border-2 border-black bg-[#3F2B96]/40"
                    style={{ height: `${Math.min(entry.minutes * 3, 120)}px` }}
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-black/70">{new Date(entry.date).getDate()}</span>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="rounded-[32px] border-4 border-black bg-[#DDF8E7] p-6 shadow-[12px_12px_0_rgba(0,0,0,0.18)]">
          <h2 className="text-2xl font-black text-black">Highlight colors</h2>
          <p className="mt-2 text-sm text-black/70">See which shades you gravitate toward when something inspires you.</p>
          <ul className="mt-5 space-y-3">
            {stats.highlightGroups.length === 0 ? (
              <li className="rounded-[24px] border-4 border-dashed border-black/40 bg-white/70 px-4 py-3 text-sm font-semibold text-black/70">
                No highlights yet. Start capturing what matters!
              </li>
            ) : (
              stats.highlightGroups.map((group) => (
                <li
                  key={group.color}
                  className="flex items-center justify-between rounded-[24px] border-4 border-black bg-white px-4 py-3 font-bold text-black"
                >
                  <span className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full border-2 border-black" style={{ backgroundColor: group.color }} />
                    {group.color}
                  </span>
                  <span>{group.count}</span>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      <section
        aria-labelledby="quick-actions"
        className="rounded-[32px] border-4 border-black bg-white p-6 shadow-[12px_12px_0_rgba(0,0,0,0.18)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="quick-actions" className="text-2xl font-black text-black">
            Quick actions
          </h2>
          <p className="max-w-xl text-sm text-black/60">
            Shortcuts to keep your reading queue tidy and discoverable.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-[28px] border-4 border-black px-5 py-4 text-sm font-black text-black shadow-[10px_10px_0_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-1"
              style={{ backgroundColor: link.color }}
            >
              <span>{link.label}</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="recent-activity"
        className="rounded-[32px] border-4 border-black bg-[#FDF7FF] p-6 shadow-[12px_12px_0_rgba(0,0,0,0.18)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 id="recent-activity" className="text-2xl font-black text-black">
              Recent activity
            </h2>
            <p className="text-sm text-black/70">A snapshot of your latest saves, highlights, and reading sessions.</p>
          </div>
          <Sparkles className="h-6 w-6 text-[#3F2B96]" aria-hidden="true" />
        </div>
        {activityError ? (
          <div className="mt-4 rounded-[24px] border-4 border-black bg-[#FFDC7C] px-4 py-3 text-sm font-semibold text-black">
            {activityError}
          </div>
        ) : null}
        {loadingActivity ? (
          <div className="mt-6 flex items-center gap-3 text-black">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading activity…
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {activity.length === 0 ? (
              <li className="rounded-[24px] border-4 border-dashed border-black/40 bg-white/70 px-4 py-4 text-sm font-semibold text-black/70">
                No activity yet. Explore posts and start building your library.
              </li>
            ) : (
              activity.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 rounded-[24px] border-4 border-black bg-white px-4 py-3 text-black sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg font-bold">
                      {item.type === 'bookmark'
                        ? 'Saved: '
                        : item.type === 'highlight'
                          ? 'Highlighted: '
                          : 'Reading: '}
                      {item.title}
                    </p>
                    <p className="text-sm text-black/70">{item.subtitle}</p>
                  </div>
                  <span className="text-sm font-semibold text-black/70">{formatDate(item.occurredAt)}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </section>
    </div>
  )
}
