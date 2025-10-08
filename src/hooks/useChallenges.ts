'use client';

import { useCallback, useEffect, useState } from 'react';

interface ChallengeProgressItem {
  slug: string;
  status: string;
  progressValue: number;
  progressTarget: number;
  endsAt: string;
}

interface ChallengesState {
  items: ChallengeProgressItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useChallenges = (): ChallengesState => {
  const [items, setItems] = useState<ChallengeProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gamification/profile', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load challenges.');
      }

      const challengeProgress = Array.isArray(payload.challengeProgress)
        ? (payload.challengeProgress as ChallengeProgressItem[])
        : [];

      setItems(challengeProgress);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load challenges.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    items,
    isLoading,
    error,
    refresh: load,
  };
};
