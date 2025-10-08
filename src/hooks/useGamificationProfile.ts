'use client'

import { useEffect, useState } from 'react'
import type { GamificationProfileSummary, OwnedBadge } from '@/lib/gamification/types'

interface GamificationProfileState {
  profile: GamificationProfileSummary | null
  badges: OwnedBadge[]
  streakHistory: Array<{ date: string; xp: number }>
  recentActions: Array<{ actionType: string; awardedAt: string; xp: number; points: number }>
  isLoading: boolean
  error: string | null
}

export const useGamificationProfile = (profileId?: string) => {
  const [state, setState] = useState<GamificationProfileState>({
    profile: null,
    badges: [],
    streakHistory: [],
    recentActions: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const params = new URLSearchParams()
      if (profileId) {
        params.set('profileId', profileId)
      }

      const response = await fetch(`/api/gamification/profile?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      })

      const payload = await response.json()

      if (!isMounted) {
        return
      }

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: typeof payload.error === 'string' ? payload.error : 'Unable to load gamification profile.',
        }))
        return
      }

      setState({
        profile: payload.profile ?? null,
        badges: Array.isArray(payload.badges) ? payload.badges : [],
        streakHistory: Array.isArray(payload.streakHistory) ? payload.streakHistory : [],
        recentActions: Array.isArray(payload.recentActions) ? payload.recentActions : [],
        isLoading: false,
        error: null,
      })
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [profileId])

  return state
}
