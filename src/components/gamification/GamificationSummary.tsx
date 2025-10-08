'use client';

import { motion } from 'framer-motion';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import type { FullGamificationProfile } from '@/lib/gamification/profile-service';

interface GamificationSummaryProps {
  data: FullGamificationProfile;
  onOpenSettings?: () => void;
}

const getLevelThresholds = (levels: { level: number; minXp: number }[], currentLevel: number) => {
  const sorted = [...levels].sort((a, b) => a.level - b.level);
  const current = sorted.find((entry) => entry.level === currentLevel) ?? sorted[0];
  const next = sorted.find((entry) => entry.level === currentLevel + 1) ?? sorted[sorted.length - 1];
  return {
    currentMin: current?.minXp ?? 0,
    nextMin: next?.minXp ?? current?.minXp ?? 0,
  };
};

export const GamificationSummary = ({ data, onOpenSettings }: GamificationSummaryProps) => {
  const { profile, badges, challengeProgress, levels } = data;
  const { currentMin, nextMin } = getLevelThresholds(levels, profile.level);
  const xpProgressRange = Math.max(nextMin - currentMin, 1);
  const xpIntoLevel = Math.max(0, profile.xpTotal - currentMin);
  const xpProgressPercent = Math.min(100, Math.round((xpIntoLevel / xpProgressRange) * 100));
  const activeChallenges = challengeProgress.filter((challenge) => challenge.status !== 'completed');
  const completedChallenges = challengeProgress.filter((challenge) => challenge.status === 'completed');

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border-4 border-black bg-gradient-to-br from-[#F5F1FF] to-[#FFFFFF] p-8 shadow-[14px_14px_0px_0px_rgba(0,0,0,0.2)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFE066] px-4 py-1 text-xs font-black uppercase tracking-[0.3em] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Level {profile.level}
            </span>
            <h2 className="mt-3 text-3xl font-black text-gray-900">Your Syntax &amp; Sips journey</h2>
            <p className="mt-2 max-w-xl text-sm font-medium text-gray-600">
              Earn XP from posts, comments, and challenges to unlock perks, badges, and fresh community privileges.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 text-right">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-wider text-gray-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)]">
              <Trophy className="h-4 w-4 text-[#6C63FF]" aria-hidden="true" />
              {badges.length} Badges
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-wider text-gray-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)]">
              <Flame className="h-4 w-4 text-[#FF6B6B]" aria-hidden="true" />
              {profile.currentStreak} day streak
            </div>
            {onOpenSettings ? (
              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFBE0B] px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5"
              >
                Manage settings
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.25em] text-gray-600">
              <span>XP progress</span>
              <span>
                {profile.xpTotal.toLocaleString()} XP · Next level at {nextMin.toLocaleString()} XP
              </span>
            </div>
            <div className="mt-4 h-4 rounded-full border-2 border-black bg-[#F9F5FF]">
              <motion.div
                className="h-full rounded-full bg-[#6C63FF]"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgressPercent}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-black bg-[#E6F4FF] p-4 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-700">Total XP</p>
                <p className="mt-2 text-xl font-black text-gray-900">{profile.xpTotal.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border-2 border-black bg-[#FFF1E6] p-4 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-700">Longest streak</p>
                <p className="mt-2 text-xl font-black text-gray-900">{profile.longestStreak} days</p>
              </div>
              <div className="rounded-2xl border-2 border-black bg-[#E8FFEA] p-4 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-700">Completed challenges</p>
                <p className="mt-2 text-xl font-black text-gray-900">{completedChallenges.length}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border-2 border-black bg-white p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.15)]">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-600">Active challenges</h3>
            {activeChallenges.length > 0 ? (
              <ul className="space-y-3">
                {activeChallenges.map((challenge) => {
                  const endDate = challenge.endsAt ? new Date(challenge.endsAt) : null;
                  const endsLabel = endDate ? endDate.toLocaleDateString() : 'Soon';

                  return (
                    <li
                      key={challenge.slug}
                      className="rounded-2xl border-2 border-black bg-[#F4F4F5] px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)]"
                    >
                      <p className="text-sm font-black text-gray-900">{challenge.slug.replace(/-/g, ' ')}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Progress: {Math.round(challenge.progressValue)} · Ends {endsLabel}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm font-semibold text-gray-600">Complete your current quests to unlock seasonal missions.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
