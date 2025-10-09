'use client'

import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'

interface BookmarkButtonProps {
  postId: string
  initialBookmarkId?: string | null
  className?: string
}

export function BookmarkButton({ postId, initialBookmarkId = null, className }: BookmarkButtonProps) {
  const [bookmarkId, setBookmarkId] = useState<string | null>(initialBookmarkId ?? null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBookmarkId(initialBookmarkId ?? null)
  }, [initialBookmarkId])

  const isBookmarked = Boolean(bookmarkId)

  const toggleBookmark = async () => {
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

      const payload = (await response.json()) as { bookmark: { id: string } }
      setBookmarkId(payload.bookmark.id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to update bookmark')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void toggleBookmark()}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-[24px] border-4 border-black px-4 py-2 font-bold transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] ${isBookmarked ? 'bg-[#9723C9] text-white' : 'bg-white text-black'}`}
        aria-pressed={isBookmarked}
      >
        {isBookmarked ? <BookmarkCheck className="h-5 w-5" aria-hidden="true" /> : <Bookmark className="h-5 w-5" aria-hidden="true" />}
        {isBookmarked ? 'Bookmarked' : 'Save for later'}
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-[#B91C1C]">{error}</p> : null}
    </div>
  )
}
