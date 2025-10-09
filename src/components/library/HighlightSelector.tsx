'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface HighlightSelectorProps {
  postId: string
  children: ReactNode
  onHighlightCreated?: () => void
}

const highlightColors = ['#FFEB3B', '#FF69B4', '#87CEEB', '#90EE90']

interface DraftHighlight {
  text: string
  start: number
  end: number
  rect: DOMRect
}

export function HighlightSelector({ postId, children, onHighlightCreated }: HighlightSelectorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [draft, setDraft] = useState<DraftHighlight | null>(null)
  const [color, setColor] = useState<string>(highlightColors[0])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setDraft(null)
      return
    }

    const range = selection.getRangeAt(0)
    if (!containerRef.current || !containerRef.current.contains(range.commonAncestorContainer)) {
      setDraft(null)
      return
    }

    const selectedText = range.toString()
    if (selectedText.trim().length === 0) {
      setDraft(null)
      return
    }

    const preRange = range.cloneRange()
    preRange.selectNodeContents(containerRef.current)
    preRange.setEnd(range.startContainer, range.startOffset)
    const start = preRange.toString().length
    const end = start + selectedText.length
    const rect = range.getBoundingClientRect()

    setDraft({ text: selectedText, start, end, rect })
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [handleSelectionChange])

  const createHighlight = async () => {
    if (!draft) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/library/highlights', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          highlightedText: draft.text,
          positionStart: draft.start,
          positionEnd: draft.end,
          color,
          note: note.trim().length > 0 ? note.trim() : undefined,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error ?? 'Unable to save highlight')
      }

      setDraft(null)
      setNote('')
      if (onHighlightCreated) onHighlightCreated()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save highlight')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {children}
      {draft ? (
        <div
          className="fixed z-50 flex flex-col gap-2 rounded-[24px] border-4 border-black bg-white p-3 text-sm font-semibold text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
          style={{ top: draft.rect.bottom + window.scrollY + 12, left: draft.rect.left + window.scrollX }}
          role="dialog"
          aria-label="Create highlight"
        >
          <p className="max-w-xs text-xs text-black/70">“{draft.text.slice(0, 120)}{draft.text.length > 120 ? '…' : ''}”</p>
          <div className="flex items-center gap-2">
            {highlightColors.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setColor(hex)}
                className={`h-6 w-6 rounded-full border-2 border-black ${color === hex ? 'ring-4 ring-black/50' : ''}`}
                style={{ backgroundColor: hex }}
                aria-label={`Use color ${hex}`}
              />
            ))}
          </div>
          <textarea
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a personal note"
            className="w-60 rounded-[16px] border-4 border-black px-2 py-1 text-xs font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void createHighlight()}
              className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-[#FF69B4] px-3 py-1 text-xs font-bold text-black"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Save highlight
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="inline-flex items-center rounded-[24px] border-4 border-black bg-white px-3 py-1 text-xs font-bold text-black"
            >
              Cancel
            </button>
          </div>
          {error ? <p className="text-xs text-[#B91C1C]">{error}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
