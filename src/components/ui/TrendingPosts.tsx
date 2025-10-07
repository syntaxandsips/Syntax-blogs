"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Flame, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { BlogListPost } from '@/lib/posts';

interface TrendingState {
  posts: BlogListPost[];
  status: 'idle' | 'loading' | 'error' | 'ready';
  error?: string;
}

export function TrendingPosts() {
  const [{ posts, status, error }, setState] = useState<TrendingState>({
    posts: [],
    status: 'idle',
  });

  const loadTrending = useCallback(async () => {
    setState((previous) => ({ ...previous, status: 'loading', error: undefined }));

    try {
      const response = await fetch('/api/posts/trending?limit=6', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Unable to load trending posts.');
      }

      const payload = (await response.json()) as { posts?: BlogListPost[] };
      setState({
        posts: payload.posts ?? [],
        status: 'ready',
      });
    } catch (loadError) {
      setState({
        posts: [],
        status: 'error',
        error:
          loadError instanceof Error ? loadError.message : 'Unable to load trending posts.',
      });
    }
  }, []);

  useEffect(() => {
    void loadTrending();
  }, [loadTrending]);

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5252] text-white">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Hot right now</p>
              <h2 className="text-3xl font-black tracking-tight">Trending on Syntax &amp; Sips</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadTrending()}
            className="inline-flex items-center gap-2 rounded-md border-2 border-black px-4 py-2 text-sm font-semibold transition hover:-translate-y-[1px] hover:border-[#6C63FF] hover:text-[#6C63FF]"
          >
            Refresh
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {status === 'loading' &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`trending-skeleton-${index}`}
                className="h-44 animate-pulse rounded-xl border-4 border-black bg-gray-100"
              />
            ))}

          {status === 'error' && (
            <div className="rounded-xl border-4 border-red-400 bg-red-50 p-6 text-red-600 md:col-span-2 lg:col-span-3">
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                className="mt-3 text-sm font-bold uppercase tracking-wide underline"
                onClick={() => void loadTrending()}
              >
                Try again
              </button>
            </div>
          )}

          {status === 'ready' && posts.length === 0 && (
            <div className="rounded-xl border-4 border-black bg-[#f8f8f8] p-8 md:col-span-2 lg:col-span-3">
              <p className="text-lg font-semibold text-gray-600">
                Trending picks will appear once articles start gaining traction. Check back soon!
              </p>
            </div>
          )}

          {status === 'ready' &&
            posts.map((post) => (
              <article
                key={post.id}
                className="group flex h-full flex-col justify-between rounded-xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(108,99,255,0.25)]"
              >
                <div className="space-y-3">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide text-white"
                    style={{ backgroundColor: post.accentColor ?? '#6C63FF' }}
                  >
                    {post.category?.name ?? 'Uncategorized'}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                  {post.excerpt && (
                    <p
                      className="text-sm text-gray-600"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <span>{post.views.toLocaleString()} views</span>
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="inline-flex items-center gap-1 text-[#6C63FF] transition group-hover:translate-x-1"
                  >
                    Read now
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
