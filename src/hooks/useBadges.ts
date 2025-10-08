'use client';

import { useCallback, useEffect, useState } from 'react';
import type { GamificationBadge } from '@/lib/gamification/types';

interface BadgesState {
  badges: GamificationBadge[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useBadges = (): BadgesState => {
  const [badges, setBadges] = useState<GamificationBadge[]>([]);
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
        throw new Error(payload.error ?? 'Unable to load badges.');
      }

      const badgeList = Array.isArray(payload.badges) ? (payload.badges as GamificationBadge[]) : [];
      setBadges(badgeList);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load badges.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    badges,
    isLoading,
    error,
    refresh: load,
  };
};
