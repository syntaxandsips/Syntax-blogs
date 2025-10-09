'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Trash2, Clock } from 'lucide-react'
import type { ReadingHistoryEntry } from '@/utils/types'

interface ReadingHistoryProps {
  initialHistory: ReadingHistoryEntry[]
}

const formatDuration = (seconds: number | null) => {
  if (!seconds) return '—'
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return '<1 min'
  return `${minutes} min`
}

export function ReadingHistory({ initialHistory }: ReadingHistoryProps) {
  const [history, setHistory] = useState(initialHistory)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/library/history?limit=50', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? 'Unable to load reading history')
      }

      const body = (await response.json()) as { items: ReadingHistoryEntry[] }
      setHistory(body.items ?? [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load reading history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialHistory.length === 0) {
      void loadHistory()
    }
  }, [initialHistory.length, loadHistory])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Remove this entry from your history?')
    if (!confirmed) return

    const response = await fetch(`/api/library/history/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      setError('Unable to delete history entry.')
      return
    }

    setHistory((prev) => prev.filter((entry) => entry.id !== id))
  }

  const totals = useMemo(() => {
    const time = history.reduce((sum, entry) => sum + (entry.readDurationSeconds ?? 0), 0)
    const completed = history.filter((entry) => entry.completed).length
    return {
      totalMinutes: Math.round(time / 60),
      completed,
    }
  }, [history])

  return (
    <div className="space-y-6">
      <header className="border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black text-black">Reading history</h1>
        <p className="text-sm text-black/70">Track your progress and jump back into stories you care about.</p>
      </header>

      {error ? (
        <div className="rounded-[24px] border-4 border-black bg-[#FFB347] px-4 py-3 font-semibold text-black">{error}</div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[32px] border-4 border-black bg-[#9723C9]/30 p-4 text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
          <p className="text-xs uppercase text-black/60">Total sessions</p>
          <p className="text-3xl font-black">{history.length}</p>
        </article>
        <article className="rounded-[32px] border-4 border-black bg-[#87CEEB]/30 p-4 text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
          <p className="text-xs uppercase text-black/60">Completed reads</p>
          <p className="text-3xl font-black">{totals.completed}</p>
        </article>
        <article className="rounded-[32px] border-4 border-black bg-[#90EE90]/30 p-4 text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
          <p className="text-xs uppercase text-black/60">Minutes logged</p>
          <p className="text-3xl font-black">{totals.totalMinutes}</p>
        </article>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void loadHistory()}
          className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-white px-4 py-2 text-sm font-bold text-black"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {history.length === 0 && !loading ? (
          <div className="rounded-[32px] border-4 border-dashed border-black/40 bg-[#FDF7FF] px-6 py-10 text-center font-semibold text-black/70">
            No reading activity yet. Dive into an article and we&apos;ll track it here.
          </div>
        ) : null}
        {history.map((entry) => (
          <article
            key={entry.id}
            className="rounded-[32px] border-4 border-black bg-white p-6 text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-black">{entry.postTitle}</p>
                <p className="text-sm text-black/70">
                  {entry.completed ? 'Completed' : 'In progress'} · {formatDuration(entry.readDurationSeconds)} ·{' '}
                  {entry.scrollPercentage ?? 0}% scrolled
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-black/70">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {new Date(entry.readAt).toLocaleString()}
                <button
                  type="button"
                  onClick={() => void handleDelete(entry.id)}
                  className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-[#FF69B4] px-3 py-1 text-sm font-bold text-black"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
