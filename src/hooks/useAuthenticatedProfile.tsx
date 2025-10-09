"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AuthenticatedProfileSummary } from '@/utils/types'
import { createBrowserClient } from '@/lib/supabase/client'

interface UseAuthenticatedProfileResult {
  profile: AuthenticatedProfileSummary | null
  isLoading: boolean
  refresh: () => Promise<void>
}

interface AuthenticatedProfileProviderProps {
  children: ReactNode
  initialProfile?: AuthenticatedProfileSummary | null
}

const AuthenticatedProfileContext = createContext<UseAuthenticatedProfileResult | null>(null)

const useProvideAuthenticatedProfile = (
  initialProfile: AuthenticatedProfileProviderProps['initialProfile'],
): UseAuthenticatedProfileResult => {
  const supabase = useMemo(() => createBrowserClient(), [])
  const mountedRef = useRef(true)
  const hasInitialProfile = typeof initialProfile !== 'undefined'
  const [profile, setProfile] = useState<AuthenticatedProfileSummary | null>(
    hasInitialProfile ? initialProfile ?? null : null,
  )
  const [isLoading, setIsLoading] = useState(!hasInitialProfile)

  useEffect(
    () => () => {
      mountedRef.current = false
    },
    [],
  )

  useEffect(() => {
    if (hasInitialProfile) {
      setProfile(initialProfile ?? null)
      setIsLoading(false)
    }
  }, [hasInitialProfile, initialProfile])

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

export const AuthenticatedProfileProvider = ({
  children,
  initialProfile,
}: AuthenticatedProfileProviderProps) => {
  const value = useProvideAuthenticatedProfile(initialProfile)

  return (
    <AuthenticatedProfileContext.Provider value={value}>
      {children}
    </AuthenticatedProfileContext.Provider>
  )
}

export const useAuthenticatedProfile = (): UseAuthenticatedProfileResult => {
  const context = useContext(AuthenticatedProfileContext)

  if (!context) {
    throw new Error('useAuthenticatedProfile must be used within an AuthenticatedProfileProvider')
  }

  return context
}
