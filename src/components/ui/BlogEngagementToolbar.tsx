"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  BookmarkCheck,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils';

type VoteType = 'upvote' | 'downvote';

interface EngagementStats {
  upvotes: number;
  downvotes: number;
  comments: number;
  bookmarks: number;
  views: number;
}

interface EngagementResponse {
  postId: string;
  stats: EngagementStats;
  viewer: {
    vote: VoteType | null;
    bookmarkId: string | null;
  };
}

interface BlogEngagementToolbarProps {
  postId: string;
  slug: string;
  title: string;
  excerpt: string;
  initialViews: number;
  authorId?: string | null;
  authorName?: string | null;
  isFollowingAuthor?: boolean;
  isAuthorMuted?: boolean;
  onHide?: () => void;
  onToggleFollow?: (nextAction: 'follow' | 'unfollow') => void;
  onToggleMute?: (nextAction: 'mute' | 'unmute') => void;
}

const buildShareFallback = (slug: string) => {
  if (typeof window === 'undefined') {
    return `/blogs/${slug}`;
  }

  return `${window.location.origin}/blogs/${slug}`;
};

export function BlogEngagementToolbar({
  postId,
  slug,
  title,
  excerpt,
  initialViews,
  authorId,
  authorName,
  isFollowingAuthor = false,
  isAuthorMuted = false,
  onHide,
  onToggleFollow,
  onToggleMute,
}: BlogEngagementToolbarProps) {
  const [stats, setStats] = useState<EngagementStats>({
    upvotes: 0,
    downvotes: 0,
    comments: 0,
    bookmarks: 0,
    views: initialViews,
  });
  const [viewerVote, setViewerVote] = useState<VoteType | null>(null);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [loadingVote, setLoadingVote] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = useMemo(() => buildShareFallback(slug), [slug]);

  useEffect(() => {
    let isMounted = true;

    const loadEngagement = async () => {
      try {
        const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/engagement`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const payload = (await response.json()) as EngagementResponse;

        if (!isMounted) {
          return;
        }

        setStats({ ...payload.stats, views: payload.stats.views ?? initialViews });
        setViewerVote(payload.viewer.vote);
        setBookmarkId(payload.viewer.bookmarkId);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.warn('Unable to load engagement for post', slug, error);
        setErrorMessage('Unable to load engagement details right now.');
      }
    };

    void loadEngagement();

    return () => {
      isMounted = false;
    };
  }, [initialViews, slug]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  useEffect(() => {
    if (copyState !== 'copied') {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopyState('idle'), 2500);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const updateEngagementState = (payload: EngagementResponse) => {
    setStats({ ...payload.stats, views: payload.stats.views ?? initialViews });
    setViewerVote(payload.viewer.vote);
    setBookmarkId(payload.viewer.bookmarkId);
  };

  const handleVote = async (voteType: VoteType) => {
    setLoadingVote(true);
    setErrorMessage(null);

    try {
      const method = viewerVote === voteType ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/engagement`, {
        method,
        credentials: 'include',
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: method === 'POST' ? JSON.stringify({ voteType }) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage('Sign in to vote on stories.');
          return;
        }
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as EngagementResponse;
      updateEngagementState(payload);
    } catch (error) {
      console.error('Unable to update vote', error);
      setErrorMessage('Unable to update your vote. Please try again.');
    } finally {
      setLoadingVote(false);
    }
  };

  const handleBookmark = async () => {
    setBookmarkLoading(true);
    setErrorMessage(null);

    try {
      if (bookmarkId) {
        const response = await fetch(`/api/library/bookmarks/${bookmarkId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            setErrorMessage('Sign in to manage your reading list.');
            return;
          }
          throw new Error(await response.text());
        }

        setBookmarkId(null);
        setStats((previous) => ({
          ...previous,
          bookmarks: previous.bookmarks > 0 ? previous.bookmarks - 1 : 0,
        }));
        return;
      }

      const response = await fetch('/api/library/bookmarks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage('Sign in to save stories for later.');
          return;
        }
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to save bookmark');
      }

      const payload = (await response.json()) as { bookmark: { id: string } };
      setBookmarkId(payload.bookmark.id);
      setStats((previous) => ({
        ...previous,
        bookmarks: previous.bookmarks + 1,
      }));
    } catch (error) {
      console.error('Unable to toggle bookmark', error);
      setErrorMessage('Unable to update your bookmark. Please try again.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = async () => {
    setErrorMessage(null);

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: excerpt,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopyState('copied');
        return;
      }

      window.prompt('Copy this link', shareUrl);
      setCopyState('copied');
    } catch (error) {
      console.error('Unable to share story', error);
      setErrorMessage('Unable to share this story right now.');
    }
  };

  const handleFollowToggle = () => {
    if (!authorId || !onToggleFollow) {
      return;
    }

    onToggleFollow(isFollowingAuthor ? 'unfollow' : 'follow');
    setMenuOpen(false);
  };

  const handleMuteToggle = () => {
    if (!authorId || !onToggleMute) {
      return;
    }

    onToggleMute(isAuthorMuted ? 'unmute' : 'mute');
    setMenuOpen(false);
  };

  const handleHide = () => {
    onHide?.();
    setMenuOpen(false);
  };

  const handleReport = () => {
    setMenuOpen(false);
    const subject = encodeURIComponent(`Report story: ${title}`);
    const greeting = authorName ? `Author: ${authorName}\n` : '';
    const body = encodeURIComponent(`${greeting}Slug: /blogs/${slug}\n\nPlease describe the issue:`);
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:editors@syntax-blogs.test?subject=${subject}&body=${body}`;
    }
  };

  const voteButtonClasses = (active: boolean) =>
    `inline-flex items-center gap-1 rounded-full border-2 border-black px-3 py-1 text-xs font-bold transition-transform ${
      active ? 'bg-[#6C63FF] text-white shadow-[4px_4px_0_rgba(0,0,0,0.25)]' : 'bg-white text-black hover:-translate-y-0.5'
    }`;

  const iconButtonClasses = (active: boolean) =>
    `inline-flex items-center gap-1 rounded-full border-2 border-black px-3 py-1 text-xs font-bold transition-transform ${
      active ? 'bg-[#118AB2] text-white shadow-[4px_4px_0_rgba(0,0,0,0.25)]' : 'bg-white text-black hover:-translate-y-0.5'
    }`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleVote('upvote')}
            disabled={loadingVote}
            className={voteButtonClasses(viewerVote === 'upvote')}
            aria-pressed={viewerVote === 'upvote'}
          >
            {loadingVote ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : <ArrowBigUp className="h-3 w-3" aria-hidden="true" />}
            {formatCompactNumber(stats.upvotes)}
          </button>
          <button
            type="button"
            onClick={() => void handleVote('downvote')}
            disabled={loadingVote}
            className={voteButtonClasses(viewerVote === 'downvote')}
            aria-pressed={viewerVote === 'downvote'}
          >
            {loadingVote ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : <ArrowBigDown className="h-3 w-3" aria-hidden="true" />}
            {formatCompactNumber(stats.downvotes)}
          </button>
          <Link
            href={`/blogs/${slug}#comments`}
            className={iconButtonClasses(false)}
            aria-label="View comments"
          >
            <MessageCircle className="h-3 w-3" aria-hidden="true" />
            {formatCompactNumber(stats.comments)}
          </Link>
          <button
            type="button"
            onClick={() => void handleBookmark()}
            disabled={bookmarkLoading}
            className={iconButtonClasses(Boolean(bookmarkId))}
            aria-pressed={Boolean(bookmarkId)}
            aria-label={bookmarkId ? 'Remove bookmark' : 'Save to bookmarks'}
          >
            {bookmarkLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : bookmarkId ? (
              <BookmarkCheck className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Bookmark className="h-3 w-3" aria-hidden="true" />
            )}
            {formatCompactNumber(stats.bookmarks)}
          </button>
        </div>
        <div className="flex items-center gap-2" ref={menuRef}>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold transition-transform hover:-translate-y-0.5"
          >
            <Share2 className="h-3 w-3" aria-hidden="true" />
            {copyState === 'copied' ? 'Copied!' : 'Share'}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white p-2 hover:-translate-y-0.5"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border-4 border-black bg-white p-2 shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
                <button
                  type="button"
                  onClick={handleHide}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100"
                  disabled={!onHide}
                >
                  Show less like this
                </button>
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                  disabled={!authorId || !onToggleFollow}
                >
                  {isFollowingAuthor ? 'Unfollow author' : 'Follow author'}
                </button>
                <button
                  type="button"
                  onClick={handleMuteToggle}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                  disabled={!authorId || !onToggleMute}
                >
                  {isAuthorMuted ? 'Unmute author' : 'Mute author'}
                </button>
                <button
                  type="button"
                  onClick={handleReport}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Report story
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {errorMessage ? <p className="text-xs font-semibold text-red-600" role="status">{errorMessage}</p> : null}
    </div>
  );
}
