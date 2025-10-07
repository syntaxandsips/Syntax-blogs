"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AuthenticatedProfileSummary } from '@/utils/types'
import { createBrowserClient } from '@/lib/supabase/client'

interface UseAuthenticatedProfileResult {
  profile: AuthenticatedProfileSummary | null
  isLoading: boolean
  refresh: () => Promise<void>
}

export const useAuthenticatedProfile = (): UseAuthenticatedProfileResult => {
  const supabase = useMemo(() => createBrowserClient(), [])
  const mountedRef = useRef(true)
  const [profile, setProfile] = useState<AuthenticatedProfileSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => () => {
    mountedRef.current = false
  }, [])

  const loadProfile = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      })

      if (!mountedRef.current) {
        return
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          setProfile(null)
          setIsLoading(false)
          return
        }

        console.error('Failed to resolve authenticated profile', await response.text())
        setProfile(null)
        setIsLoading(false)
        return
      }

      const { profile: payload } = (await response.json()) as {
        profile: AuthenticatedProfileSummary
      }

      setProfile(payload)
    } catch (error) {
      if (mountedRef.current) {
        console.error('Failed to resolve authenticated profile', error)
        setProfile(null)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadProfile, supabase])

  const refresh = useCallback(async () => {
    await loadProfile()
  }, [loadProfile])

  return { profile, isLoading, refresh }
}
