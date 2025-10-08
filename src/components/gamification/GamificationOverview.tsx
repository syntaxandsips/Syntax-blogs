'use client'

import { useMemo } from 'react'
import { Trophy, Flame, Sparkles, Target, Award, TrendingUp } from 'lucide-react'
import { NeobrutalCard } from '@/components/neobrutal/card'
import { NeobrutalProgressBar } from '@/components/neobrutal/progress-bar'
import { useGamificationProfile } from '@/hooks/useGamificationProfile'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useChallenges } from '@/hooks/useChallenges'
import type { OwnedBadge } from '@/lib/gamification/types'
import { cn } from '@/lib/utils'

interface GamificationOverviewProps {
  profileId?: string
}

const rarityColorMap: Record<string, string> = {
  common: 'bg-white text-black',
  uncommon: 'bg-[#06D6A0]/90 text-black',
  rare: 'bg-[#6C63FF]/90 text-white',
  legendary: 'bg-[#FF5252]/90 text-white',
}

const formatNumber = (value: number) => value.toLocaleString('en-US')

const BadgeCard = ({ badge }: { badge: OwnedBadge }) => {
  const tone = rarityColorMap[badge.rarity] ?? rarityColorMap.common

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border-3 border-black p-4 text-sm shadow-[4px_4px_0px_rgba(0,0,0,0.12)]',
        tone,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-black/10 text-lg">
            {badge.icon ? badge.icon.slice(0, 2).toUpperCase() : '★'}
          </span>
          <div>
            <p className="text-base font-black uppercase tracking-wide">{badge.name}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-black/70">{badge.category}</p>
          </div>
        </div>
        <span className="rounded-full border-2 border-black bg-black/10 px-3 py-1 text-xs font-bold uppercase tracking-widest">
          {badge.rarity}
        </span>
      </div>
      {badge.description ? <p className="text-sm leading-relaxed">{badge.description}</p> : null}
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-black/70">
        <span>Reward</span>
        <span>{formatNumber(badge.rewardPoints)} pts</span>
      </div>
    </div>
  )
}

export function GamificationOverview({ profileId }: GamificationOverviewProps) {
  const { profile, badges, recentActions, isLoading, error } = useGamificationProfile(profileId)
  const { entries: leaderboardEntries } = useLeaderboard('global')
  const { challenges } = useChallenges()

  const topBadges = useMemo(() => badges.slice(0, 6), [badges])
  const xpProgress = profile ? Math.min((profile.xpTotal / (profile.nextLevelXp || 1)) * 100, 100) : 0

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
        <NeobrutalCard className="col-span-2 h-full bg-gradient-to-br from-white to-[#F7F1FF]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-black/60">Level</p>
                <h2 className="text-3xl font-black leading-tight text-black">
                  {isLoading ? 'Loading…' : `Level ${profile?.level ?? 1}`}
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border-3 border-black bg-white px-3 py-1">
                <Flame className="h-5 w-5 text-[#FF5252]" />
                <span className="text-sm font-bold uppercase tracking-wide text-black">
                  {formatNumber(profile?.currentStreak ?? 0)} day streak
                </span>
              </div>
            </div>
            <NeobrutalProgressBar
              value={xpProgress}
              max={100}
              label={`XP ${formatNumber(profile?.xpTotal ?? 0)} / ${formatNumber(profile?.nextLevelXp ?? 0)}`}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border-3 border-black bg-white/70 p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.12)]">
                <Trophy className="h-10 w-10 text-[#6C63FF]" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-black/60">Prestige</p>
                  <p className="text-lg font-black">{profile?.prestigeLevel ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border-3 border-black bg-white/70 p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.12)]">
                <Sparkles className="h-10 w-10 text-[#FFAF00]" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-black/60">Badges</p>
                  <p className="text-lg font-black">{badges.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border-3 border-black bg-white/70 p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.12)]">
              <p className="text-xs font-black uppercase tracking-widest text-black/60">Recent Activity</p>
              <div className="mt-3 space-y-2 text-sm">
                {recentActions.slice(0, 5).map((action) => (
                  <div key={`${action.actionType}-${action.awardedAt}`} className="flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wide text-black/70">
                      {action.actionType.replace('.', ' › ')}
                    </span>
                    <span className="font-bold text-black">
                      +{formatNumber(action.xp)} XP · {new Date(action.awardedAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                ))}
                {recentActions.length === 0 ? (
                  <p className="text-sm font-medium text-black/60">Complete an action to start filling your activity feed.</p>
                ) : null}
              </div>
            </div>
          </div>
        </NeobrutalCard>
        <NeobrutalCard className="flex h-full flex-col gap-4 bg-[#FFFBEB]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-widest text-black">Leaderboard</h3>
            <TrendingUp className="h-6 w-6 text-[#FF5252]" />
          </div>
          <div className="space-y-3">
            {leaderboardEntries.slice(0, 5).map((entry) => (
              <div
                key={entry.profileId}
                className="flex items-center justify-between rounded-xl border-3 border-black bg-white px-3 py-2 shadow-[3px_3px_0px_rgba(0,0,0,0.12)]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#6C63FF]/90 text-white font-black">
                    {entry.rank}
                  </span>
                  <div>
                    <p className="text-sm font-black leading-tight">{entry.displayName}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/60">
                      Lv {entry.level} · {formatNumber(entry.xp)} XP
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF5252]">
                  {formatNumber(entry.streak)} streak
                </span>
              </div>
            ))}
            {leaderboardEntries.length === 0 ? (
              <p className="text-sm font-medium text-black/60">Leaderboard data is being generated. Check back soon!</p>
            ) : null}
          </div>
        </NeobrutalCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <NeobrutalCard className="col-span-2 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-widest text-black">Badge Showcase</h3>
            <Award className="h-6 w-6 text-[#6C63FF]" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topBadges.length > 0 ? (
              topBadges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)
            ) : (
              <p className="text-sm font-medium text-black/60">Earn badges by joining challenges and sharing your work.</p>
            )}
          </div>
        </NeobrutalCard>
        <NeobrutalCard className="bg-[#E9F5FF]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-widest text-black">Active Challenges</h3>
            <Target className="h-6 w-6 text-[#1B9AAA]" />
          </div>
          <div className="mt-4 space-y-3">
            {challenges.slice(0, 3).map((challenge) => (
              <div
                key={challenge.id}
                className="rounded-xl border-3 border-black bg-white/80 p-3 shadow-[3px_3px_0px_rgba(0,0,0,0.12)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-wide text-black">{challenge.title}</p>
                  <span className="text-xs font-semibold uppercase tracking-widest text-black/60">
                    {challenge.cadence}
                  </span>
                </div>
                {challenge.description ? (
                  <p className="mt-1 text-xs text-black/70">{challenge.description}</p>
                ) : null}
                <div className="mt-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-black/70">
                  <span>Status: {challenge.status}</span>
                  <span>{formatNumber(challenge.rewardPoints)} pts</span>
                </div>
              </div>
            ))}
            {challenges.length === 0 ? (
              <p className="text-sm font-medium text-black/60">
                Challenges rotate weekly. Subscribe to notifications to be first in line.
              </p>
            ) : null}
          </div>
        </NeobrutalCard>
      </div>

      {error ? (
        <NeobrutalCard tone="warning" className="bg-[#FFD166] text-black">
          <p className="font-bold">{error}</p>
        </NeobrutalCard>
      ) : null}
    </section>
  )
}
