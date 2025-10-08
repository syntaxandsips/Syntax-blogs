'use client';

import { motion } from 'framer-motion';
import { AlarmClock, CheckCircle2 } from 'lucide-react';

interface ChallengeListProps {
  challenges: {
    slug: string;
    status: string;
    progressValue: number;
    progressTarget: number;
    endsAt: string;
  }[];
}

export const ChallengeList = ({ challenges }: ChallengeListProps) => {
  return (
    <section className="rounded-[32px] border-4 border-black bg-[#F5F5F5] p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Daily and weekly quests</p>
          <h3 className="text-2xl font-black text-gray-900">Keep the streak alive</h3>
        </div>
        <AlarmClock className="h-10 w-10 text-[#FF6B6B]" aria-hidden="true" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {challenges.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-black/40 bg-white p-6 text-sm font-semibold text-gray-600">
            No challenges yet—check back after your first quest or explore seasonal events from the community tab.
          </div>
        ) : (
          challenges.map((challenge) => {
            const isCompleted = challenge.status === 'completed';
            const endDate = challenge.endsAt ? new Date(challenge.endsAt) : null;
            const endsLabel = endDate ? endDate.toLocaleString() : 'Soon';

            const target = challenge.progressTarget > 0 ? challenge.progressTarget : undefined;
            const percent = target ? Math.min(100, Math.round((challenge.progressValue / target) * 100)) : challenge.progressValue;

            return (
              <motion.article
                key={challenge.slug}
                className={`rounded-3xl border-2 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)] ${isCompleted ? 'opacity-75' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">{challenge.slug.replace(/-/g, ' ')}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Ends {endsLabel}</p>
                  </div>
                  {isCompleted ? <CheckCircle2 className="h-6 w-6 text-[#3DC35B]" aria-hidden="true" /> : null}
                </div>
                <div className="mt-4 h-3 rounded-full border-2 border-black bg-[#F0F0F0]">
                  <div
                    className="h-full rounded-full bg-[#6C63FF]"
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-gray-600">
                  Status: {isCompleted ? 'Completed' : 'In progress'} · Progress: {challenge.progressValue.toFixed(1)}
                  {target ? ` / ${target}` : ''}
                </p>
              </motion.article>
            );
          })
        )}
      </div>
    </section>
  );
};
