'use client'

import { useMemo } from 'react'
import { useGamificationProfile } from './useGamificationProfile'

export const useBadges = (profileId?: string) => {
  const { badges, isLoading, error } = useGamificationProfile(profileId)

  return useMemo(
    () => ({
      badges,
      isLoading,
      error,
    }),
    [badges, isLoading, error],
  )
}
