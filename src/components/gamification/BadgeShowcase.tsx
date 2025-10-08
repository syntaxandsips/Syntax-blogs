'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { GamificationBadge } from '@/lib/gamification/types';

interface BadgeShowcaseProps {
  badges: GamificationBadge[];
}

const rarityPalette: Record<string, string> = {
  common: 'bg-white border-gray-300',
  uncommon: 'bg-[#E8FFEA] border-[#3DC35B]',
  rare: 'bg-[#E5F0FF] border-[#3F51B5]',
  legendary: 'bg-[#FFF4E6] border-[#FF8A00]',
};

export const BadgeShowcase = ({ badges }: BadgeShowcaseProps) => {
  return (
    <section className="rounded-[32px] border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFD6E0] px-4 py-1 text-xs font-black uppercase tracking-[0.28em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Badge showcase
          </span>
          <h3 className="mt-2 text-2xl font-black text-gray-900">Celebrate your highlights</h3>
          <p className="mt-1 text-sm font-medium text-gray-600">
            Pin a badge to your profile to show teammates what you are working on and inspire the community.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-black/40 bg-[#F9F9FB] p-6 text-sm font-semibold text-gray-600">
            Earn badges by completing onboarding, contributing posts, joining events, and maintaining a streak.
          </div>
        ) : (
          badges.map((badge) => {
            const palette = rarityPalette[badge.rarity] ?? rarityPalette.common;
            return (
              <motion.article
                key={badge.id}
                className={`flex h-full flex-col justify-between rounded-3xl border-2 ${palette} p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)]`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <header>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-600">{badge.category}</p>
                  <h4 className="mt-2 text-xl font-black text-gray-900">{badge.name}</h4>
                  {badge.description ? (
                    <p className="mt-2 text-sm font-medium text-gray-700">{badge.description}</p>
                  ) : null}
                </header>
                <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                  Rarity: {badge.rarity}
                </footer>
              </motion.article>
            );
          })
        )}
      </div>
    </section>
  );
};
