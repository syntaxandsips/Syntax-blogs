'use client';

import { useState } from 'react';
import { Crown } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/gamification/types';

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  scope: 'global' | 'weekly' | 'monthly' | 'seasonal';
  onScopeChange?: (scope: 'global' | 'weekly' | 'monthly' | 'seasonal') => void;
  isLoading?: boolean;
}

const scopes: { label: string; value: LeaderboardPanelProps['scope'] }[] = [
  { label: 'Global', value: 'global' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Seasonal', value: 'seasonal' },
];

export const LeaderboardPanel = ({ entries, scope, onScopeChange, isLoading = false }: LeaderboardPanelProps) => {
  const [selectedScope, setSelectedScope] = useState(scope);

  const handleScopeClick = (nextScope: LeaderboardPanelProps['scope']) => {
    setSelectedScope(nextScope);
    onScopeChange?.(nextScope);
  };

  return (
    <section className="rounded-[32px] border-4 border-black bg-[#F1F3FF] p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-black uppercase tracking-[0.28em] text-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
            <Crown className="h-4 w-4 text-[#FF8A00]" aria-hidden="true" />
            Leaderboard
          </span>
          <h3 className="mt-2 text-2xl font-black text-gray-900">Top community catalysts</h3>
        </div>
        <div className="flex gap-2">
          {scopes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleScopeClick(item.value)}
              className={`rounded-full border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wide transition ${
                selectedScope === item.value
                  ? 'bg-[#6C63FF] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)]'
                  : 'bg-white text-gray-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="w-16 border-2 border-black px-3 py-2 text-left text-xs font-black uppercase tracking-[0.3em] text-gray-600">
                Rank
              </th>
              <th className="border-2 border-black px-3 py-2 text-left text-xs font-black uppercase tracking-[0.3em] text-gray-600">
                Profile
              </th>
              <th className="w-24 border-2 border-black px-3 py-2 text-right text-xs font-black uppercase tracking-[0.3em] text-gray-600">
                Level
              </th>
              <th className="w-32 border-2 border-black px-3 py-2 text-right text-xs font-black uppercase tracking-[0.3em] text-gray-600">
                XP
              </th>
              <th className="w-28 border-2 border-black px-3 py-2 text-right text-xs font-black uppercase tracking-[0.3em] text-gray-600">
                Streak
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="border-2 border-black px-4 py-6 text-center text-sm font-semibold text-gray-600">
                  Loading leaderboard...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="border-2 border-black px-4 py-6 text-center text-sm font-semibold text-gray-600">
                  Be the first to land on the leaderboard by completing quests this week.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={`${entry.profileId}-${entry.rank ?? 'rank'}`} className="bg-white odd:bg-[#EEF1FF]">
                  <td className="border-2 border-black px-3 py-3 text-sm font-black text-gray-900">
                    #{entry.rank ?? ''}
                  </td>
                  <td className="border-2 border-black px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[#FFD6E0] text-sm font-black uppercase">
                        {entry.displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{entry.displayName}</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">Profile {entry.profileId.slice(0, 6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="border-2 border-black px-3 py-3 text-right text-sm font-black text-gray-900">{entry.level}</td>
                  <td className="border-2 border-black px-3 py-3 text-right text-sm font-black text-gray-900">{entry.xpTotal.toLocaleString()}</td>
                  <td className="border-2 border-black px-3 py-3 text-right text-sm font-black text-gray-900">{entry.streak}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
