'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Trash2, Palette, Copy } from 'lucide-react'
import type { Highlight } from '@/utils/types'

interface HighlightsViewerProps {
  initialHighlights: Highlight[]
}

export function HighlightsViewer({ initialHighlights }: HighlightsViewerProps) {
  const [highlights, setHighlights] = useState(initialHighlights)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterColor, setFilterColor] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const colors = useMemo(() => {
    const set = new Set(highlights.map((highlight) => highlight.color))
    return Array.from(set)
  }, [highlights])

  const filteredHighlights = useMemo(
    () =>
      filterColor === 'all'
        ? highlights
        : highlights.filter((highlight) => highlight.color === filterColor),
    [filterColor, highlights],
  )

  const loadHighlights = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/library/highlights?limit=100', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? 'Unable to load highlights')
      }

      const body = (await response.json()) as { items: Highlight[] }
      setHighlights(body.items ?? [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load highlights')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialHighlights.length === 0) {
      void loadHighlights()
    }
  }, [initialHighlights.length, loadHighlights])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this highlight?')
    if (!confirmed) return

    const response = await fetch(`/api/library/highlights/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      setError('Unable to delete highlight.')
      return
    }

    setHighlights((prev) => prev.filter((highlight) => highlight.id !== id))
  }

  const handleCopy = async (highlight: Highlight) => {
    try {
      await navigator.clipboard.writeText(`${highlight.highlightedText}\n\n— ${highlight.postTitle}`)
      setCopiedId(highlight.id)
      window.setTimeout(() => setCopiedId(null), 1500)
    } catch {
      setError('Unable to copy highlight to clipboard.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black text-black">Highlights</h1>
        <p className="text-sm text-black/70">
          Everything you&apos;ve highlighted across Syntax &amp; Sips. Filter by color to review what resonates most.
        </p>
      </header>

      {error ? (
        <div className="rounded-[24px] border-4 border-black bg-[#FFB347] px-4 py-3 font-semibold text-black">{error}</div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFilterColor('all')}
          className={`rounded-[24px] border-4 border-black px-4 py-2 text-sm font-bold ${filterColor === 'all' ? 'bg-[#87CEEB]' : 'bg-white text-black'}`}
        >
          All
        </button>
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setFilterColor(color)}
            className={`inline-flex items-center gap-2 rounded-[24px] border-4 border-black px-4 py-2 text-sm font-bold ${filterColor === color ? 'bg-[#9723C9] text-white' : 'bg-white text-black'}`}
          >
            <span className="h-4 w-4 rounded-full border-2 border-black" style={{ backgroundColor: color }} />
            {color}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void loadHighlights()}
          className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-white px-4 py-2 text-sm font-bold text-black"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {filteredHighlights.length === 0 && !loading ? (
          <div className="rounded-[32px] border-4 border-dashed border-black/40 bg-[#FDF7FF] px-6 py-10 text-center font-semibold text-black/70">
            No highlights found. Explore articles and select the passages that inspire you.
          </div>
        ) : null}
        {filteredHighlights.map((highlight) => (
          <article
            key={highlight.id}
            className="space-y-3 rounded-[32px] border-4 border-black bg-white p-6 text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]"
          >
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-black">{highlight.postTitle}</p>
                <p className="text-xs uppercase text-black/60">{new Date(highlight.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-white px-3 py-1 text-sm font-bold text-black">
                  <Palette className="h-4 w-4" aria-hidden="true" />
                  {highlight.color}
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopy(highlight)}
                  className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-[#87CEEB] px-3 py-1 text-sm font-bold text-black"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copiedId === highlight.id ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(highlight.id)}
                  className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-[#FF69B4] px-3 py-1 text-sm font-bold text-black"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                </button>
              </div>
            </header>
            <blockquote className="rounded-[24px] border-4 border-black bg-[#FFFFE0] p-4 text-base font-semibold italic text-black">
              “{highlight.highlightedText}”
            </blockquote>
            {highlight.note ? (
              <p className="text-sm text-black/70">Personal note: {highlight.note}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}
