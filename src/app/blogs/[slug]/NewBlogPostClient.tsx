"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Eye,
  Twitter,
  Linkedin,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import { NewMarkdownRenderer } from '@/components/ui/NewMarkdownRenderer';
import { NewSummarizeButton } from '@/components/ui/NewSummarizeButton';
import { CommentsSection } from '@/components/ui/CommentsSection';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { NewFollowSection } from '@/components/ui/NewFollowSection';
import type { BlogListPost, BlogPostDetail } from '@/lib/posts';
import { BookmarkButton } from '@/components/library/BookmarkButton';
import { HighlightSelector } from '@/components/library/HighlightSelector';
import { useAuthenticatedProfile } from '@/hooks/useAuthenticatedProfile';
import type { Bookmark, ReadingHistoryEntry } from '@/utils/types';
import {
  buildReadingHistoryPayload,
  computeScrollProgress,
  shouldPersistReadingHistory,
} from '@/lib/library/reading-utils';

interface BlogPostClientProps {
  post: BlogPostDetail;
  relatedPosts: BlogListPost[];
  canonicalUrl: string;
  breadcrumbs: BreadcrumbItem[];
}

const formatDisplayDate = (publishedAt: string | null) =>
  publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unscheduled';

export default function NewBlogPostClient({ post, relatedPosts, canonicalUrl, breadcrumbs }: BlogPostClientProps) {
  useEffect(() => {
    fetch(`/api/posts/${post.slug}/view`, { method: 'POST' }).catch(() => {
      // Intentionally swallow errors so UI rendering is unaffected.
    });
  }, [post.slug]);

  const { profile, isLoading: profileLoading } = useAuthenticatedProfile();
  const [initialBookmarkId, setInitialBookmarkId] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [libraryStateReady, setLibraryStateReady] = useState(false);
  const historyIdRef = useRef<string | null>(null);
  const readSecondsRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const lastPositionRef = useRef<number>(0);
  const lastResumeRef = useRef<number | null>(null);
  const flushTimeoutRef = useRef<number | null>(null);
  const isFlushingRef = useRef(false);

  useEffect(() => {
    if (profileLoading) {
      return;
    }

    if (!profile) {
      setInitialBookmarkId(null);
      setLibraryError(null);
      setLibraryStateReady(true);
      historyIdRef.current = null;
      readSecondsRef.current = 0;
      maxScrollRef.current = 0;
      lastPositionRef.current = 0;
      return;
    }

    let cancelled = false;
    setLibraryError(null);
    setLibraryStateReady(false);

    const loadLibraryState = async () => {
      try {
        const [bookmarkResponse, historyResponse] = await Promise.all([
          fetch(`/api/library/bookmarks?postId=${post.id}&limit=1`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch(`/api/library/history?postId=${post.id}&limit=1`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }),
        ]);

        if (cancelled) {
          return;
        }

        if (bookmarkResponse.ok) {
          const { items } = (await bookmarkResponse.json()) as { items: Bookmark[] };
          const [bookmark] = items;
          setInitialBookmarkId(bookmark?.id ?? null);
        } else if (bookmarkResponse.status !== 404) {
          try {
            const payload = (await bookmarkResponse.json()) as { error?: string };
            setLibraryError(payload.error ?? 'Unable to sync your bookmarks right now.');
          } catch (error) {
            console.error('Failed to parse bookmark response', error);
            setLibraryError('Unable to sync your bookmarks right now.');
          }
        }

        if (historyResponse.ok) {
          const { items } = (await historyResponse.json()) as { items: ReadingHistoryEntry[] };
          const [entry] = items;

          if (entry) {
            historyIdRef.current = entry.id;
            readSecondsRef.current = entry.readDurationSeconds ?? 0;
            maxScrollRef.current = entry.scrollPercentage ?? 0;
            lastPositionRef.current = entry.lastPosition ?? 0;
          } else {
            historyIdRef.current = null;
            readSecondsRef.current = 0;
            maxScrollRef.current = 0;
            lastPositionRef.current = 0;
          }
        } else if (historyResponse.status !== 404) {
          try {
            const payload = (await historyResponse.json()) as { error?: string };
            setLibraryError(
              payload.error ?? 'Unable to sync your reading history at the moment.',
            );
          } catch (error) {
            console.error('Failed to parse history response', error);
            setLibraryError('Unable to sync your reading history at the moment.');
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load library metadata', error);
          setLibraryError('Unable to reach the library service. Try refreshing the page.');
        }
      } finally {
        if (!cancelled) {
          setLibraryStateReady(true);
        }
      }
    };

    void loadLibraryState();

    return () => {
      cancelled = true;
    };
  }, [post.id, profile, profileLoading]);

  useEffect(() => {
    if (!profile || !libraryStateReady) {
      return;
    }

    let disposed = false;

    const accumulateDuration = () => {
      if (lastResumeRef.current === null) {
        return;
      }

      const now = Date.now();
      const deltaMs = Math.max(0, now - lastResumeRef.current);
      readSecondsRef.current += deltaMs / 1000;
      lastResumeRef.current = now;
    };

    const scheduleFlush = () => {
      if (disposed) {
        return;
      }

      if (flushTimeoutRef.current) {
        window.clearTimeout(flushTimeoutRef.current);
      }

      flushTimeoutRef.current = window.setTimeout(() => {
        void flushReading();
      }, 20000);
    };

    const flushReading = async ({
      immediate = false,
      force = false,
      shouldAccumulate = true,
    }: {
      immediate?: boolean;
      force?: boolean;
      shouldAccumulate?: boolean;
    } = {}) => {
      if (isFlushingRef.current || (disposed && !force)) {
        return;
      }

      isFlushingRef.current = true;

      if (shouldAccumulate) {
        accumulateDuration();
      }

      const payload = buildReadingHistoryPayload({
        historyId: historyIdRef.current,
        postId: post.id,
        readDurationSeconds: readSecondsRef.current,
        scrollPercentage: maxScrollRef.current,
        lastPosition: lastPositionRef.current,
      });

      const shouldPersist =
        force ||
        shouldPersistReadingHistory(
          {
            readDurationSeconds: payload.readDurationSeconds,
            scrollPercentage: payload.scrollPercentage,
            lastPosition: payload.lastPosition,
          },
          Boolean(historyIdRef.current),
        );

      if (!shouldPersist) {
        isFlushingRef.current = false;
        if (!immediate) {
          scheduleFlush();
        }
        return;
      }

      const body = JSON.stringify(payload);

      if (immediate && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        navigator.sendBeacon('/api/library/history', new Blob([body], { type: 'application/json' }));
        isFlushingRef.current = false;
        return;
      }

      try {
        const response = await fetch('/api/library/history', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body,
        });

        if (!response.ok) {
          if (response.status === 401) {
            disposed = true;
          }

          console.warn('Failed to persist reading history', await response.text());
          return;
        }

        const { history } = (await response.json()) as { history: ReadingHistoryEntry };
        historyIdRef.current = history.id;

        if (typeof history.scrollPercentage === 'number') {
          maxScrollRef.current = Math.max(maxScrollRef.current, history.scrollPercentage);
        }

        if (typeof history.readDurationSeconds === 'number') {
          readSecondsRef.current = Math.max(readSecondsRef.current, history.readDurationSeconds);
        }

        if (typeof history.lastPosition === 'number') {
          lastPositionRef.current = Math.max(lastPositionRef.current, history.lastPosition);
        }
      } catch (error) {
        console.error('Failed to record reading history', error);
      } finally {
        isFlushingRef.current = false;
        if (!immediate && !disposed) {
          scheduleFlush();
        }
      }
    };

    const handleScroll = () => {
      const documentElement = document.documentElement;
      const scrollTop = Math.max(documentElement.scrollTop, document.body.scrollTop);
      const scrollHeight = Math.max(documentElement.scrollHeight, document.body.scrollHeight);
      const clientHeight = documentElement.clientHeight || window.innerHeight;
      const percentage = computeScrollProgress(scrollTop, scrollHeight, clientHeight);

      if (percentage > maxScrollRef.current) {
        maxScrollRef.current = percentage;
      }

      lastPositionRef.current = scrollTop;
      scheduleFlush();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        accumulateDuration();
        void flushReading({ immediate: true, shouldAccumulate: false });
        lastResumeRef.current = null;
      } else {
        lastResumeRef.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      accumulateDuration();
      void flushReading({ immediate: true, force: true, shouldAccumulate: false });
    };

    lastResumeRef.current = Date.now();
    handleScroll();
    scheduleFlush();

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      disposed = true;
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (flushTimeoutRef.current) {
        window.clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }

      void flushReading({ immediate: true, force: true });
    };
  }, [libraryStateReady, post.id, profile]);

  const categoryBadge = (post.category.name ?? post.category.slug ?? 'Uncategorized')
    .replace(/[-\s]+/g, ' ')
    .toUpperCase();

  const authorInitial = (post.author.displayName ?? 'Admin').charAt(0).toUpperCase();
  const formattedDate = formatDisplayDate(post.publishedAt);
  const tags = post.tags.length > 0 ? post.tags : [categoryBadge];

  const [shareUrl, setShareUrl] = useState(canonicalUrl);

  useEffect(() => {
    setShareUrl(canonicalUrl);
  }, [canonicalUrl]);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [post.slug]);

  useEffect(() => {
    if (copyState === 'copied') {
      const timeout = window.setTimeout(() => setCopyState('idle'), 2500);
      return () => window.clearTimeout(timeout);
    }
    return () => undefined;
  }, [copyState]);

  const handleCopyLink = useCallback(() => {
    if (navigator?.clipboard) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => setCopyState('copied'))
        .catch(() => setCopyState('idle'));
      return;
    }

    if (typeof window !== 'undefined') {
      window.prompt('Copy this link', shareUrl);
      setCopyState('copied');
    }
  }, [shareUrl]);

  const shareTargets = useMemo<
    { name: string; href?: string; icon: ReactNode; styles: string; onClick?: () => void }[]
  >(
    () => [
      {
        name: 'X (Twitter)',
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`,
        icon: <Twitter className="h-4 w-4" aria-hidden="true" />,
        styles: 'bg-[#1DA1F2] text-white',
      },
      {
        name: 'LinkedIn',
        href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`,
        icon: <Linkedin className="h-4 w-4" aria-hidden="true" />,
        styles: 'bg-[#0A66C2] text-white',
      },
      {
        name: 'Copy link',
        href: '#',
        icon: copyState === 'copied' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />,
        styles: 'bg-white text-[#6C63FF] border-2 border-[#6C63FF]',
        onClick: handleCopyLink,
      },
    ],
    [copyState, handleCopyLink, post.title, shareUrl],
  );

  const recommendedTopics = useMemo(() => {
    const unique = new Set<string>();
    const register = (value: string | null | undefined) => {
      if (!value) {
        return;
      }

      const trimmed = value.trim();
      if (trimmed.length > 0) {
        unique.add(trimmed);
      }
    };

    register(post.category.name ?? post.category.slug ?? null);
    post.tags.forEach((tag) => register(tag));
    relatedPosts.forEach((related) => {
      register(related.category.name ?? related.category.slug ?? null);
    });

    return Array.from(unique);
  }, [post.category.name, post.category.slug, post.tags, relatedPosts]);

  return (
    <div className="w-full bg-[#f0f0f0]">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbs} />
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 mb-8 font-bold hover:text-[#6C63FF] transition"
        >
          <ArrowLeft size={18} /> BACK TO BLOGS
        </Link>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2 lg:overflow-y-auto">
            <article className="bg-white border-4 border-black rounded-lg overflow-hidden">
              <div className="p-6 border-b-4 border-black">
                <div className="bg-[#FF5252] text-white px-3 py-1 text-sm font-bold inline-block mb-4">
                  {categoryBadge}
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4">
                  {post.title.toUpperCase()}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                      {authorInitial}
                    </div>
                    <div>
                      <div className="font-bold">{post.author.displayName ?? 'Admin'}</div>
                      <div className="text-sm text-gray-600">{formattedDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formattedDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      {post.views} views
                    </div>
                  </div>
                </div>
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
                  <NewSummarizeButton content={post.content} />
                  {profileLoading ? (
                    <div className="inline-flex w-full items-center justify-center rounded-[24px] border-4 border-dashed border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] md:w-auto">
                      Loading your account…
                    </div>
                  ) : profile ? (
                    libraryStateReady ? (
                      <BookmarkButton
                        postId={post.id}
                        initialBookmarkId={initialBookmarkId ?? null}
                        className="inline-flex w-full justify-center md:w-auto"
                      />
                    ) : (
                      <div className="inline-flex w-full items-center justify-center rounded-[24px] border-4 border-dashed border-black bg-[#87CEEB]/40 px-4 py-2 text-sm font-bold text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] md:w-auto">
                        Syncing your library…
                      </div>
                    )
                  ) : (
                    <Link
                      href={`/login?redirect=/blogs/${post.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-[24px] border-4 border-black bg-[#9723C9] px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black md:w-auto"
                    >
                      Sign in to save
                    </Link>
                  )}
                </div>
                {libraryError ? (
                  <p className="mb-4 rounded-[24px] border-4 border-black bg-[#FF69B4]/20 px-4 py-2 text-sm font-semibold text-[#B91C1C] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]" aria-live="polite">
                    {libraryError}
                  </p>
                ) : null}
              </div>
              <div className="p-6">
                {post.featuredImageUrl && (
                  <div className="mb-6 overflow-hidden rounded-md border-4 border-black/10">
                    <Image
                      src={post.featuredImageUrl}
                      alt={`${post.title} featured illustration`}
                      width={1200}
                      height={630}
                      priority
                      className="h-auto w-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 60vw"
                    />
                  </div>
                )}
                {profile ? (
                  <HighlightSelector postId={post.id}>
                    <NewMarkdownRenderer content={post.content} />
                  </HighlightSelector>
                ) : (
                  <NewMarkdownRenderer content={post.content} />
                )}

                {!profile && !profileLoading ? (
                  <div className="mt-6 rounded-[32px] border-4 border-dashed border-black bg-white px-5 py-4 text-sm font-semibold text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.12)]">
                    <p className="text-lg font-black">Highlight what inspires you.</p>
                    <p className="mt-2 text-sm">
                      Create highlights, track your reading journey, and build personal lists once you sign in.
                    </p>
                    <Link
                      href={`/login?redirect=/blogs/${post.slug}`}
                      className="mt-3 inline-flex items-center justify-center rounded-[24px] border-4 border-black bg-[#87CEEB] px-4 py-2 text-sm font-black uppercase tracking-wide text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black"
                    >
                      Sign in to start highlighting
                    </Link>
                  </div>
                ) : null}

                <div className="mt-10 space-y-4 border-t-4 border-dashed border-black/20 pt-6">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
                    <h2 className="text-lg font-black">Share this article</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {shareTargets.map((target) =>
                      target.onClick ? (
                        <button
                          key={target.name}
                          type="button"
                          onClick={target.onClick}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#6C63FF] ${target.styles}`}
                        >
                          {target.icon}
                          {copyState === 'copied' ? 'Copied!' : target.name}
                        </button>
                      ) : (
                        <a
                          key={target.name}
                          href={target.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#6C63FF] ${target.styles}`}
                        >
                          {target.icon}
                          {target.name}
                        </a>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-8">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-[#6C63FF]/10 text-[#6C63FF] font-bold rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>

                {relatedPosts.length > 0 && (
                  <div className="mt-12 border-t-4 border-black/10 pt-8">
                    <h2 className="text-2xl font-black mb-6">Related reads</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.id}
                          href={`/blogs/${related.slug}`}
                          className="group flex flex-col gap-3 rounded-xl border-4 border-black bg-white p-5 transition hover:-translate-y-[2px] hover:border-[#6C63FF] hover:shadow-[6px_6px_0px_0px_rgba(108,99,255,0.25)]"
                        >
                          <span
                            className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide text-white"
                            style={{ backgroundColor: related.accentColor ?? '#6C63FF' }}
                          >
                            {related.category.name ?? 'Uncategorized'}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{related.title}</h3>
                          {related.excerpt && (
                            <p
                              className="text-sm text-gray-600"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {related.excerpt}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#6C63FF]">
                            Continue reading
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <CommentsSection postSlug={post.slug} />
              </div>
            </article>
          </div>
          <aside className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            <div className="px-2 lg:px-0">
              <NewFollowSection topics={recommendedTopics} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
