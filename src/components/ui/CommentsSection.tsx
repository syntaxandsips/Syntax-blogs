"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface CommentAuthor {
  id: string | null;
  displayName: string | null;
  avatarUrl: string | null;
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

export function CommentsSection({ postSlug }: CommentsSectionProps) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(Boolean(session));
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    void checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated || submissionState === 'loading') {
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

      {isAuthenticated ? (
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
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Comments go live after a quick moderation pass to keep the community welcoming.
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
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
      ) : (
        <div className="mb-6 rounded-md border-2 border-dashed border-black/20 bg-[#f8f9ff] p-4 text-sm text-[#2A2A2A]">
          <p className="font-semibold">Want to add your perspective?</p>
          <p className="mt-1">
            <Link href="/me" className="font-bold text-[#6C63FF] hover:underline">
              Sign in to your Syntax &amp; Sips account
            </Link>{' '}
            to join the conversation.
          </p>
        </div>
      )}

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
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-lg border-2 border-black/10 bg-[#f9f9f9] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#2A2A2A]">
                    {comment.author.displayName ?? 'Community member'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
