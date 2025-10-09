'use client'

import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useAuthenticatedProfile } from '@/hooks/useAuthenticatedProfile'

type BookmarkButtonProps = {
  postId: string
  initialBookmarkId?: string | null
  className?: string
}

export function BookmarkButton({ postId, initialBookmarkId, className }: BookmarkButtonProps) {
  const { profile } = useAuthenticatedProfile()
  const [bookmarkId, setBookmarkId] = useState<string | null>(
    typeof initialBookmarkId === 'undefined' ? null : initialBookmarkId ?? null,
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isBookmarked = Boolean(bookmarkId)

  useEffect(() => {
    if (typeof initialBookmarkId !== 'undefined') {
      setBookmarkId(initialBookmarkId ?? null)
    }
  }, [initialBookmarkId])

  useEffect(() => {
    if (!profile) {
      setBookmarkId(null)
      setLoading(false)
    }
    setError(null)
  }, [profile])

  useEffect(() => {
    if (!profile || typeof initialBookmarkId !== 'undefined') {
      return
    }

    let cancelled = false

    const syncBookmarkState = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/library/bookmarks?postId=${postId}&limit=1`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (cancelled) {
          return
        }

        if (response.ok) {
          const payload = (await response.json()) as { items?: { id?: string | null }[] }
          const bookmark = payload.items?.[0]
          setBookmarkId(bookmark?.id ?? null)
          return
        }

        if (response.status === 401 || response.status === 404) {
          setBookmarkId(null)
          return
        }

        console.error('Failed to load bookmark state', await response.text())
        setError('Unable to sync bookmark status. Try again shortly.')
      } catch (syncError) {
        if (!cancelled) {
          console.error('Failed to load bookmark state', syncError)
          setError('Unable to sync bookmark status. Try again shortly.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void syncBookmarkState()

    return () => {
      cancelled = true
    }
  }, [initialBookmarkId, postId, profile])

  const toggleBookmark = async () => {
    if (!profile) {
      setError('Sign in to save posts for later.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isBookmarked && bookmarkId) {
        const response = await fetch(`/api/library/bookmarks/${bookmarkId}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string }
          throw new Error(payload.error ?? 'Unable to remove bookmark')
        }

        setBookmarkId(null)
        return
      }

      const response = await fetch('/api/library/bookmarks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error ?? 'Unable to save bookmark')
      }

      const payload = (await response.json()) as { bookmark?: { id?: string | null } }
      setBookmarkId(payload.bookmark?.id ?? null)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update bookmark')
    } finally {
      setLoading(false)
    }
  }

  const buttonLabel = profile
    ? isBookmarked
      ? 'Bookmarked'
      : 'Save for later'
    : 'Sign in to save'

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void toggleBookmark()}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-[24px] border-4 border-black px-4 py-2 font-bold transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] ${
          isBookmarked ? 'bg-[#9723C9] text-white' : 'bg-white text-black'
        }`}
        aria-pressed={isBookmarked}
      >
        {isBookmarked ? <BookmarkCheck className="h-5 w-5" aria-hidden="true" /> : <Bookmark className="h-5 w-5" aria-hidden="true" />}
        {loading ? 'Saving…' : buttonLabel}
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-[#B91C1C]">{error}</p> : null}
    </div>
  )
}
