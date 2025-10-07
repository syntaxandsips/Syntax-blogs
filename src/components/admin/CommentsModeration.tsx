"use client"

import { useMemo } from 'react'
import { Check, Loader2, MessageSquareWarning, RefreshCcw, Trash2, XCircle } from 'lucide-react'
import { CommentStatus, type AdminCommentSummary } from '@/utils/types'

interface CommentsModerationProps {
  comments: AdminCommentSummary[]
  isLoading: boolean
  activeFilter: CommentStatus | 'all'
  onChangeFilter: (filter: CommentStatus | 'all') => void
  onRefresh: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string) => void
}

const FILTER_OPTIONS: { label: string; value: CommentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: CommentStatus.PENDING },
  { label: 'Approved', value: CommentStatus.APPROVED },
  { label: 'Rejected', value: CommentStatus.REJECTED },
]

export const CommentsModeration = ({
  comments,
  isLoading,
  activeFilter,
  onChangeFilter,
  onRefresh,
  onApprove,
  onReject,
  onDelete,
}: CommentsModerationProps) => {
  const filtered = useMemo(() => {
    if (activeFilter === 'all') {
      return comments
    }

    return comments.filter((comment) => comment.status === activeFilter)
  }, [activeFilter, comments])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#2A2A2A]">Comment moderation</h1>
          <p className="text-sm text-[#2A2A2A]/70">
            Approve, reject, or remove reader feedback across the blog.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRefresh()}
          className="inline-flex items-center gap-2 rounded-md border-2 border-[#6C63FF] px-4 py-2 font-semibold text-[#6C63FF] transition hover:-translate-y-[1px] hover:bg-[#6C63FF]/10"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChangeFilter(option.value)}
            className={`rounded-full border-2 px-4 py-1 text-sm font-semibold transition ${
              activeFilter === option.value
                ? 'border-black bg-black text-white'
                : 'border-black/20 bg-white text-[#2A2A2A] hover:border-black/40'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border-4 border-black bg-white">
        <div className="border-b-4 border-black bg-[#f3f3ff] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#2A2A2A]/80">
          {isLoading ? 'Loading comments…' : `${filtered.length} ${filtered.length === 1 ? 'comment' : 'comments'}`}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 px-6 py-8 text-[#2A2A2A]/80">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading comment feed…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-[#2A2A2A]/70">
            <MessageSquareWarning className="h-10 w-10 text-[#6C63FF]" aria-hidden="true" />
            <p className="text-base font-semibold">No comments match this filter yet.</p>
            <p className="text-sm">Try selecting another status or check back after readers chime in.</p>
          </div>
        ) : (
          <ul className="divide-y-4 divide-black/5">
            {filtered.map((comment) => (
              <li key={comment.id} className="grid gap-3 px-6 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[#2A2A2A]/70">
                    <span className="rounded-full border border-[#6C63FF]/40 bg-[#6C63FF]/10 px-2 py-0.5 font-semibold text-[#6C63FF]">
                      {comment.status}
                    </span>
                    <span className="font-semibold text-[#2A2A2A]">
                      {comment.authorDisplayName ?? 'Community member'}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[#2A2A2A]">{comment.content}</p>
                  <p className="text-xs text-[#2A2A2A]/60">
                    On <span className="font-semibold">{comment.postTitle}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onApprove(comment.id)}
                    className="inline-flex items-center gap-1 rounded-md border-2 border-green-500/40 px-3 py-1 text-sm font-semibold text-green-600 transition hover:bg-green-50"
                    disabled={comment.status === CommentStatus.APPROVED}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(comment.id)}
                    className="inline-flex items-center gap-1 rounded-md border-2 border-amber-500/40 px-3 py-1 text-sm font-semibold text-amber-600 transition hover:bg-amber-50"
                    disabled={comment.status === CommentStatus.REJECTED}
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" /> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(comment.id)}
                    className="inline-flex items-center gap-1 rounded-md border-2 border-red-500/40 px-3 py-1 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
