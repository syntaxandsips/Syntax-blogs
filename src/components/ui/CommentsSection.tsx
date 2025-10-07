"use client";

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Loader2, MessageCircle, Send } from 'lucide-react';

interface CommentAuthor {
  id: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  primaryRoleSlug: string | null;
  primaryRoleName: string | null;
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}

interface CommentsSectionProps {
  postSlug: string;
}

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

const ANON_ADJECTIVES = [
  'Curious',
  'Thoughtful',
  'Inquisitive',
  'Bold',
  'Inventive',
  'Insightful',
  'Clever',
  'Pensive',
  'Creative',
  'Fearless',
];

const ANON_NOUNS = [
  'Reader',
  'Thinker',
  'Explorer',
  'Strategist',
  'Coder',
  'Dreamer',
  'Analyst',
  'Scholar',
  'Visionary',
  'Trailblazer',
];

const STAFF_ROLES = new Set(['admin', 'editor', 'author']);

const hashString = (input: string) => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const getAnonymousAlias = (seed: string) => {
  const hash = hashString(seed);
  const adjective = ANON_ADJECTIVES[hash % ANON_ADJECTIVES.length];
  const noun = ANON_NOUNS[(hash >> 3) % ANON_NOUNS.length];
  const number = (hash % 900) + 100;
  return `${adjective} ${noun} #${number}`;
};

export function CommentsSection({ postSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setHasError(null);

    try {
      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await response.json().catch(() => ({
        comments: [],
        error: 'Unable to load comments.',
      }))) as { comments?: CommentItem[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load comments.');
      }

      setComments(payload.comments ?? []);
    } catch (error) {
      setHasError(
        error instanceof Error ? error.message : 'Unable to load comments right now.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [postSlug]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submissionState === 'loading') {
      return;
    }

    setSubmissionState('loading');
    setSubmissionMessage('');

    try {
      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to submit your comment right now.');
      }

      setSubmissionState('success');
      setSubmissionMessage(
        payload?.message ??
          'Thanks for sharing! Your comment is pending review before it appears publicly.',
      );
      setContent('');
      await loadComments();
    } catch (error) {
      setSubmissionState('error');
      setSubmissionMessage(
        error instanceof Error ? error.message : 'Unable to submit your comment right now.',
      );
    }
  };

  const emptyState = !isLoading && comments.length === 0;
  const isSubmitDisabled = content.trim().length < 10 || submissionState === 'loading';

  return (
    <section className="mt-12 rounded-xl border-4 border-black bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-[#6C63FF]" aria-hidden="true" />
        <h2 className="text-2xl font-black">Join the discussion</h2>
      </div>

      {hasError && (
        <div className="mb-4 rounded-md border-2 border-red-300 bg-red-50 p-4 text-red-700" role="alert">
          {hasError}
        </div>
      )}

      <form className="mb-6 space-y-3" onSubmit={handleSubmit}>
        <label htmlFor="comment-body" className="block text-sm font-semibold text-gray-700">
          Share your thoughts
        </label>
        <textarea
          id="comment-body"
          name="comment"
          required
          minLength={10}
          rows={4}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="w-full rounded-md border-4 border-black px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
          placeholder="What resonated with you?"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            No account required—comments publish after a quick moderation pass to keep things welcoming.
          </p>
          <button
            type="submit"
            className="inline-flex items-center gap-2 self-start rounded-md bg-black px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            disabled={isSubmitDisabled}
          >
            {submissionState === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Post comment
              </>
            )}
          </button>
        </div>
        {submissionMessage && (
          <p
            className={`rounded-md border px-3 py-2 text-sm ${
              submissionState === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}
            role="status"
          >
            {submissionMessage}
          </p>
        )}
      </form>

      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading comments…
        </div>
      ) : emptyState ? (
        <p className="text-sm text-gray-600">
          Be the first to start the conversation. We love hearing how these ideas land with you!
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const roleSlug = comment.author.primaryRoleSlug ?? undefined;
            const isStaff =
              comment.author.isAdmin || (roleSlug ? STAFF_ROLES.has(roleSlug) : false);
            const displayName = isStaff
              ? comment.author.displayName ?? 'Team member'
              : getAnonymousAlias(comment.id);
            const badgeLabel = isStaff
              ? comment.author.primaryRoleName ?? (comment.author.isAdmin ? 'Admin' : 'Team')
              : 'Anonymous';

            return (
              <li
                key={comment.id}
                className="rounded-lg border-2 border-black/10 bg-[#f9f9f9] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#2A2A2A]">{displayName}</p>
                      <span className="inline-flex items-center rounded-full border border-black/20 bg-black/80 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                        {badgeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-gray-700">
                  {comment.content}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
