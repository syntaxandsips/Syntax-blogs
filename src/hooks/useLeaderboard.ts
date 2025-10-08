'use client'

import { useEffect, useState } from 'react'
import type { LeaderboardEntry } from '@/lib/gamification/types'

interface LeaderboardState {
  entries: LeaderboardEntry[]
  capturedAt: string | null
  isLoading: boolean
  error: string | null
}

export const useLeaderboard = (scope: 'global' | 'seasonal' | 'category' = 'global', category?: string) => {
  const [state, setState] = useState<LeaderboardState>({
    entries: [],
    capturedAt: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const params = new URLSearchParams({ scope })
      if (category) {
        params.set('category', category)
      }

      const response = await fetch(`/api/gamification/leaderboards?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      })

      const payload = await response.json()

      if (!isMounted) return

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: typeof payload.error === 'string' ? payload.error : 'Unable to load leaderboard.',
        }))
        return
      }

      setState({
        entries: Array.isArray(payload.entries) ? payload.entries : [],
        capturedAt: typeof payload.capturedAt === 'string' ? payload.capturedAt : null,
        isLoading: false,
        error: null,
      })
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [scope, category])

  return state
}
