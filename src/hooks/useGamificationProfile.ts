'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FullGamificationProfile } from '@/lib/gamification/profile-service';

interface GamificationState {
  data: FullGamificationProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useGamificationProfile = (): GamificationState => {
  const [data, setData] = useState<FullGamificationProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        throw new Error(payload.error ?? 'Unable to load gamification profile.');
      }

      setData(payload as FullGamificationProfile);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load gamification profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    error,
    isLoading,
    refresh: load,
  };
};
