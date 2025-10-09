'use client'

import { FormEvent, useState } from 'react'
import { PromptCommentTreeNode } from '@/lib/prompt-gallery/types'

interface PromptCommentsSectionProps {
  promptSlug: string
  comments: PromptCommentTreeNode[]
  canComment: boolean
}

const renderComment = (comment: PromptCommentTreeNode) => {
  return (
    <li key={comment.id} className="space-y-3 rounded-3xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-black">{comment.author?.display_name ?? 'Anonymous'}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-black/60">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-black/80">{comment.content}</p>
      {comment.replies.length ? (
        <ul className="ml-4 space-y-3 border-l-2 border-dashed border-black/20 pl-4">
          {comment.replies.map((reply) => renderComment(reply))}
        </ul>
      ) : null}
    </li>
  )
}

export function PromptCommentsSection({ promptSlug, comments, canComment }: PromptCommentsSectionProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!content.trim()) {
      setMessage('Please enter a comment before submitting.')
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/prompts/${promptSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error ?? 'Unable to post comment')
      }

      setContent('')
      setMessage('Thanks! Your comment is pending moderation.')
    } catch (error) {
      console.error(error)
      setMessage(error instanceof Error ? error.message : 'Unable to post comment right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border-4 border-black bg-white p-6 shadow-[10px_10px_0_rgba(0,0,0,0.08)]">
      <header>
        <h2 className="text-lg font-black uppercase tracking-[0.3em] text-black/70">Comments</h2>
        <p className="mt-2 text-sm text-black/70">Share feedback, variations, or how you used this prompt.</p>
      </header>

      {message ? (
        <div className="rounded-2xl border-2 border-black bg-[#FFEE88] px-4 py-2 text-sm font-semibold text-black">
          {message}
        </div>
      ) : null}

      {canComment ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add your comment (supports Markdown)."
            className="w-full min-h-[120px] rounded-2xl border-2 border-black bg-[#F5F3FF] px-4 py-3 text-sm text-black shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/40"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-[#6C63FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[5px_5px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Post comment'}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-black/30 bg-white px-4 py-3 text-sm text-black/70">
          Sign in to share your prompt remix or feedback.
        </div>
      )}

      <ul className="space-y-4">
        {comments.length ? comments.map((comment) => renderComment(comment)) : (
          <li className="rounded-2xl border-2 border-dashed border-black/40 px-4 py-3 text-sm text-black/60">
            No comments yet. Be the first to contribute insights.
          </li>
        )}
      </ul>
    </section>
  )
}

