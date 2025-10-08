'use client'

import { useEffect, useState } from 'react'

interface ChallengeState {
  id: string
  slug: string
  title: string
  description: string | null
  cadence: string
  rewardPoints: number
  rewardBadgeId: string | null
  startsAt: string | null
  endsAt: string | null
  requirements: Record<string, unknown>
  status: string
  progress: Record<string, unknown>
  streakCount: number
  completedAt: string | null
}

interface UseChallengesState {
  challenges: ChallengeState[]
  isLoading: boolean
  error: string | null
}

export const useChallenges = () => {
  const [state, setState] = useState<UseChallengesState>({
    challenges: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/gamification/challenges', {
        method: 'GET',
        cache: 'no-store',
      })

      const payload = await response.json()

      if (!isMounted) return

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: typeof payload.error === 'string' ? payload.error : 'Unable to load challenges.',
        }))
        return
      }

      setState({
        challenges: Array.isArray(payload.challenges) ? payload.challenges : [],
        isLoading: false,
        error: null,
      })
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [])

  return state
}
