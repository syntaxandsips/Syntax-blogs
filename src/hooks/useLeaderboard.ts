'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/lib/gamification/types';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  scope: 'global' | 'weekly' | 'monthly' | 'seasonal';
  refresh: (scope?: string) => Promise<void>;
}

export const useLeaderboard = (initialScope: 'global' | 'weekly' | 'monthly' | 'seasonal' = 'global'): LeaderboardState => {
  const [currentScope, setCurrentScope] = useState(initialScope);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (requestedScope: string = currentScope) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/gamification/leaderboards?scope=${encodeURIComponent(requestedScope)}`, {
          method: 'GET',
          cache: 'no-store',
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load leaderboard.');
        }

        setCurrentScope(requestedScope as typeof currentScope);
        setEntries(Array.isArray(payload.entries) ? payload.entries : []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unable to load leaderboard.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentScope],
  );

  useEffect(() => {
    void load(currentScope);
  }, [load, currentScope]);

  return {
    entries,
    isLoading,
    error,
    scope: currentScope,
    refresh: async (nextScope?: string) => {
      await load(nextScope ?? currentScope);
    },
  };
};
