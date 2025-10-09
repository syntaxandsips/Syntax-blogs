'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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

const quickLinks = [
  { href: '/me/lists', label: 'Create a list', color: '#9723C9' },
  { href: '/me/highlights', label: 'Review highlights', color: '#FF69B4' },
  { href: '/me/history', label: 'Continue reading', color: '#87CEEB' },
]

export function LibraryDashboard({ initialStats, profileName }: LibraryDashboardProps) {
  const [stats, setStats] = useState(initialStats)
  const [range, setRange] = useState<StatsRange>('30d')
  const [loadingStats, setLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [activity, setActivity] = useState<LibraryActivityEntry[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [activityError, setActivityError] = useState<string | null>(null)

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
        color: '#9723C9',
      },
      {
        label: 'Custom lists',
        value: stats.stats.totalLists,
        color: '#FF69B4',
      },
      {
        label: 'Highlights',
        value: stats.stats.totalHighlights,
        color: '#87CEEB',
      },
      {
        label: 'Reading streak',
        value: stats.stats.readingStreak,
        color: '#90EE90',
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
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b-4 border-black pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-black/60">Your library</p>
          <h1 className="text-4xl font-black text-black">Keep exploring, {profileName.split(' ')[0] ?? 'friend'}!</h1>
          <p className="mt-2 max-w-2xl text-lg text-black/70">
            Track everything you&apos;ve saved, highlighted, and read across Syntax &amp; Sips. Pick up right where you left off.
          </p>
        </div>
        <div className="flex gap-2">
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
                  'rounded-[24px] border-4 border-black px-4 py-2 text-sm font-bold uppercase transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50',
                  isActive ? 'bg-[#9723C9] text-white' : 'bg-white text-black',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </header>

      {statsError ? (
        <div className="rounded-[24px] border-4 border-black bg-[#FFB347] p-4 font-semibold text-black">
          {statsError}
        </div>
      ) : null}

      <section aria-labelledby="library-stats" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.label}
            className="rounded-[32px] border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]"
            style={{ backgroundColor: `${card.color}20` }}
          >
            <p className="text-sm font-bold uppercase text-black/70">{card.label}</p>
            <p className="mt-3 text-4xl font-black text-black">{card.value.toLocaleString()}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3" aria-label="Library insights">
        <article className="rounded-[32px] border-4 border-black bg-[#87CEEB]/40 p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-black">Reading timeline</h2>
            {loadingStats ? <Loader2 className="h-5 w-5 animate-spin text-black" aria-hidden="true" /> : null}
          </div>
          <p className="mt-2 text-sm text-black/70">Minutes read per day</p>
          <div className="mt-6 grid grid-cols-7 gap-2 text-xs">
            {stats.readingTimeline.map((entry) => (
              <div key={entry.date} className="flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-full border-2 border-black bg-[#9723C9]/30"
                  style={{ height: `${Math.min(entry.minutes * 3, 120)}px` }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-black/70">{new Date(entry.date).getDate()}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[32px] border-4 border-black bg-[#90EE90]/40 p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
          <h2 className="text-2xl font-black text-black">Highlight colors</h2>
          <ul className="mt-4 space-y-3">
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

      <section aria-labelledby="quick-actions" className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-[32px] border-4 border-black px-6 py-5 font-black text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1"
            style={{ backgroundColor: link.color }}
          >
            <span>{link.label}</span>
            <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </Link>
        ))}
      </section>

      <section aria-labelledby="recent-activity" className="rounded-[32px] border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="recent-activity" className="text-2xl font-black text-black">
              Recent activity
            </h2>
            <p className="text-sm text-black/70">A snapshot of your latest saves, highlights, and reading sessions.</p>
          </div>
          <Sparkles className="h-6 w-6 text-[#9723C9]" aria-hidden="true" />
        </div>
        {activityError ? (
          <div className="mt-4 rounded-[24px] border-4 border-black bg-[#FFB347] px-4 py-3 font-semibold text-black">
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
              <li className="rounded-[24px] border-4 border-dashed border-black/40 bg-[#FDF7FF] px-4 py-4 text-sm font-semibold text-black/70">
                No activity yet. Explore posts and start building your library.
              </li>
            ) : (
              activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-[24px] border-4 border-black bg-[#FDF7FF] px-4 py-3 text-black"
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
                  <span className="text-sm font-semibold text-black/80">{formatDate(item.occurredAt)}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </section>
    </div>
  )
}
