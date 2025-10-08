'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCcw, Save, Star, Flame, Target } from 'lucide-react'
import { NeobrutalCard } from '@/components/neobrutal/card'
import { NeobrutalProgressBar } from '@/components/neobrutal/progress-bar'
import { cn } from '@/lib/utils'

interface BadgeFormState {
  id?: string
  slug: string
  name: string
  category: string
  rarity: string
  rewardPoints: number
  description: string
}

interface ChallengeFormState {
  id?: string
  slug: string
  title: string
  cadence: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'event'
  rewardPoints: number
  description: string
}

interface AnalyticsState {
  profiles: {
    total: number
    totalXp: number
    averageLevel: number
    streakLeaders: Array<{ profileId: string; streak: number; level: number; xp: number }>
  }
  badges: Record<string, number>
  challenges: Record<string, number>
}

const defaultBadge: BadgeFormState = {
  slug: '',
  name: '',
  category: '',
  rarity: 'common',
  rewardPoints: 0,
  description: '',
}

const defaultChallenge: ChallengeFormState = {
  slug: '',
  title: '',
  cadence: 'weekly',
  rewardPoints: 0,
  description: '',
}

export const GamificationPanel = () => {
  const [analytics, setAnalytics] = useState<AnalyticsState | null>(null)
  const [badges, setBadges] = useState<BadgeFormState[]>([])
  const [challenges, setChallenges] = useState<ChallengeFormState[]>([])
  const [badgeForm, setBadgeForm] = useState<BadgeFormState>(defaultBadge)
  const [challengeForm, setChallengeForm] = useState<ChallengeFormState>(defaultChallenge)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingBadge, setIsSavingBadge] = useState(false)
  const [isSavingChallenge, setIsSavingChallenge] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setFeedback(null)

    try {
      const [analyticsResponse, badgesResponse, challengesResponse] = await Promise.all([
        fetch('/api/admin/gamification/analytics', { cache: 'no-store' }),
        fetch('/api/admin/gamification/badges', { cache: 'no-store' }),
        fetch('/api/admin/gamification/challenges', { cache: 'no-store' }),
      ])

      const [analyticsPayload, badgesPayload, challengesPayload] = await Promise.all([
        analyticsResponse.json(),
        badgesResponse.json(),
        challengesResponse.json(),
      ])

      if (!analyticsResponse.ok) {
        throw new Error(analyticsPayload.error ?? 'Unable to load analytics.')
      }

      if (!badgesResponse.ok) {
        throw new Error(badgesPayload.error ?? 'Unable to load badges.')
      }

      if (!challengesResponse.ok) {
        throw new Error(challengesPayload.error ?? 'Unable to load challenges.')
      }

      setAnalytics(analyticsPayload)
      setBadges((badgesPayload.badges ?? []).map((badge: any) => ({
        id: badge.id,
        slug: badge.slug,
        name: badge.name,
        category: badge.category,
        rarity: badge.rarity,
        rewardPoints: Number(badge.rewardPoints ?? badge.reward_points ?? 0),
        description: badge.description ?? '',
      })))
      setChallenges((challengesPayload.challenges ?? []).map((challenge: any) => ({
        id: challenge.id,
        slug: challenge.slug,
        title: challenge.title,
        cadence: challenge.cadence,
        rewardPoints: Number(challenge.rewardPoints ?? challenge.reward_points ?? 0),
        description: challenge.description ?? '',
      })))
    } catch (error) {
      console.error('Failed to load gamification admin data', error)
      setFeedback(error instanceof Error ? error.message : 'Unable to load gamification data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const handleBadgeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingBadge(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/gamification/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: badgeForm.id,
          slug: badgeForm.slug,
          name: badgeForm.name,
          category: badgeForm.category,
          rarity: badgeForm.rarity,
          rewardPoints: badgeForm.rewardPoints,
          description: badgeForm.description,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save badge.')
      }

      setBadgeForm(defaultBadge)
      setFeedback('Badge saved successfully.')
      await fetchAll()
    } catch (error) {
      console.error('Failed to save badge', error)
      setFeedback(error instanceof Error ? error.message : 'Unable to save badge.')
    } finally {
      setIsSavingBadge(false)
    }
  }

  const handleChallengeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingChallenge(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/gamification/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: challengeForm.id,
          slug: challengeForm.slug,
          title: challengeForm.title,
          cadence: challengeForm.cadence,
          rewardPoints: challengeForm.rewardPoints,
          description: challengeForm.description,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save challenge.')
      }

      setChallengeForm(defaultChallenge)
      setFeedback('Challenge saved successfully.')
      await fetchAll()
    } catch (error) {
      console.error('Failed to save challenge', error)
      setFeedback(error instanceof Error ? error.message : 'Unable to save challenge.')
    } finally {
      setIsSavingChallenge(false)
    }
  }

  const streakLeaders = analytics?.profiles.streakLeaders ?? []

  const badgeDistribution = useMemo(() => {
    if (!analytics?.badges) return []
    return Object.entries(analytics.badges).map(([slug, total]) => ({ slug, total }))
  }, [analytics?.badges])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-gray-900">Gamification Control Center</h2>
        <button
          type="button"
          onClick={() => void fetchAll()}
          className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-black shadow-[6px_6px_0px_rgba(0,0,0,0.12)] hover:-translate-y-[1px]"
          disabled={isLoading}
        >
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {feedback ? (
        <div className="rounded-xl border-2 border-black bg-[#FFF1D6] p-4 text-sm font-semibold text-black shadow-[6px_6px_0px_rgba(0,0,0,0.12)]">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <NeobrutalCard className="bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Total Profiles</h3>
            <Star className="h-5 w-5 text-[#FFAF00]" />
          </div>
          <p className="mt-4 text-3xl font-black text-gray-900">{analytics?.profiles.total ?? '—'}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            XP awarded {analytics ? analytics.profiles.totalXp.toLocaleString('en-US') : '—'}
          </p>
          <NeobrutalProgressBar
            className="mt-4"
            value={analytics?.profiles.averageLevel ?? 0}
            max={10}
            label={`Average level ${analytics?.profiles.averageLevel?.toFixed(2) ?? '—'}`}
          />
        </NeobrutalCard>
        <NeobrutalCard className="bg-[#FFF0F5]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Badge Distribution</h3>
            <Flame className="h-5 w-5 text-[#FF5252]" />
          </div>
          <div className="mt-4 space-y-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
            {badgeDistribution.length > 0 ? (
              badgeDistribution.map((item) => (
                <div key={item.slug} className="flex items-center justify-between">
                  <span>{item.slug}</span>
                  <span>{item.total}</span>
                </div>
              ))
            ) : (
              <p>No badges awarded yet.</p>
            )}
          </div>
        </NeobrutalCard>
        <NeobrutalCard className="bg-[#E9F5FF]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Challenge Status</h3>
            <Target className="h-5 w-5 text-[#1B9AAA]" />
          </div>
          <div className="mt-4 space-y-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
            {analytics?.challenges ? (
              Object.entries(analytics.challenges).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span>{status}</span>
                  <span>{count}</span>
                </div>
              ))
            ) : (
              <p>Challenge telemetry is warming up.</p>
            )}
          </div>
        </NeobrutalCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NeobrutalCard className="bg-white">
          <h3 className="text-lg font-black uppercase tracking-[0.3em] text-gray-900">Badge catalog</h3>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Create and update badges. Existing badges will be updated when slugs match.
          </p>
          <form onSubmit={handleBadgeSubmit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Slug
                <input
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                  value={badgeForm.slug}
                  onChange={(event) => setBadgeForm((prev) => ({ ...prev, slug: event.target.value }))}
                  required
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Name
                <input
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                  value={badgeForm.name}
                  onChange={(event) => setBadgeForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Category
                <input
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                  value={badgeForm.category}
                  onChange={(event) => setBadgeForm((prev) => ({ ...prev, category: event.target.value }))}
                  required
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Rarity
                <select
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                  value={badgeForm.rarity}
                  onChange={(event) => setBadgeForm((prev) => ({ ...prev, rarity: event.target.value }))}
                >
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="legendary">Legendary</option>
                </select>
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Reward points
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                  value={badgeForm.rewardPoints}
                  onChange={(event) => setBadgeForm((prev) => ({ ...prev, rewardPoints: Number(event.target.value) }))}
                  min={0}
                />
              </label>
            </div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Description
              <textarea
                className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                rows={3}
                value={badgeForm.description}
                onChange={(event) => setBadgeForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#6C63FF] px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow-[6px_6px_0px_rgba(0,0,0,0.18)] hover:-translate-y-[1px]',
                  isSavingBadge && 'opacity-70',
                )}
                disabled={isSavingBadge}
              >
                {isSavingBadge ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save badge
              </button>
            </div>
          </form>
          <div className="mt-6 space-y-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {badges.map((badge) => (
              <button
                key={badge.slug}
                type="button"
                onClick={() => setBadgeForm(badge)}
                className="flex w-full items-center justify-between rounded-xl border-2 border-black bg-white px-3 py-2 text-left shadow-[4px_4px_0px_rgba(0,0,0,0.12)] hover:-translate-y-[1px]"
              >
                <span>{badge.name}</span>
                <span>{badge.rarity}</span>
              </button>
            ))}
          </div>
        </NeobrutalCard>

        <NeobrutalCard className="bg-white">
          <h3 className="text-lg font-black uppercase tracking-[0.3em] text-gray-900">Challenge catalog</h3>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Keep programming fresh with rotating challenges.
          </p>
          <form onSubmit={handleChallengeSubmit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Slug
                <input
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                  value={challengeForm.slug}
                  onChange={(event) => setChallengeForm((prev) => ({ ...prev, slug: event.target.value }))}
                  required
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Title
                <input
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                  value={challengeForm.title}
                  onChange={(event) => setChallengeForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Cadence
                <select
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                  value={challengeForm.cadence}
                  onChange={(event) =>
                    setChallengeForm((prev) => ({ ...prev, cadence: event.target.value as ChallengeFormState['cadence'] }))
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="event">Event</option>
                </select>
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Reward points
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                  value={challengeForm.rewardPoints}
                  onChange={(event) => setChallengeForm((prev) => ({ ...prev, rewardPoints: Number(event.target.value) }))}
                />
              </label>
            </div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Description
              <textarea
                className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
                rows={3}
                value={challengeForm.description}
                onChange={(event) => setChallengeForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#06D6A0] px-4 py-2 text-sm font-black uppercase tracking-wide text-black shadow-[6px_6px_0px_rgba(0,0,0,0.18)] hover:-translate-y-[1px]',
                  isSavingChallenge && 'opacity-70',
                )}
                disabled={isSavingChallenge}
              >
                {isSavingChallenge ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save challenge
              </button>
            </div>
          </form>
          <div className="mt-6 space-y-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {challenges.map((challenge) => (
              <button
                key={challenge.slug}
                type="button"
                onClick={() => setChallengeForm(challenge)}
                className="flex w-full items-center justify-between rounded-xl border-2 border-black bg-white px-3 py-2 text-left shadow-[4px_4px_0px_rgba(0,0,0,0.12)] hover:-translate-y-[1px]"
              >
                <span>{challenge.title}</span>
                <span>{challenge.cadence}</span>
              </button>
            ))}
          </div>
        </NeobrutalCard>
      </div>

      <NeobrutalCard className="bg-white">
        <h3 className="text-lg font-black uppercase tracking-[0.3em] text-gray-900">Top streak leaders</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {streakLeaders.length > 0 ? (
            streakLeaders.map((leader) => (
              <div
                key={leader.profileId}
                className="rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 shadow-[4px_4px_0px_rgba(0,0,0,0.12)]"
              >
                <p className="text-xs font-bold text-gray-500">Profile</p>
                <p className="text-sm font-black text-gray-900">{leader.profileId.slice(0, 8)}…</p>
                <p className="mt-2 text-xs font-bold text-gray-500">Streak</p>
                <p className="text-lg font-black text-gray-900">{leader.streak} days</p>
                <p className="mt-2 text-xs font-bold text-gray-500">Level</p>
                <p className="text-lg font-black text-gray-900">{leader.level}</p>
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-gray-600">No streak data yet. Encourage daily engagement!</p>
          )}
        </div>
      </NeobrutalCard>
    </div>
  )
}
