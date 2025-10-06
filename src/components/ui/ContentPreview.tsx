"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calendar, Search } from 'lucide-react';
import Link from 'next/link';
import type { BlogListPost } from '@/lib/posts';

interface EnhancedPost extends BlogListPost {
  readingTime: string;
}

const deriveReadingTime = (content?: string | null) => {
  if (!content) {
    return '5 min read';
  }

  const words = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
};

export const ContentPreview = () => {
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/posts', {
          cache: 'no-store',
          signal,
        });
        const payload = (await response.json()) as {
          posts?: BlogListPost[];
          error?: string;
        };

        if (!response.ok || !payload.posts) {
          throw new Error(payload.error ?? 'Unable to load recent content.');
        }

        if (signal?.aborted) {
          return;
        }

        const enrichedPosts = payload.posts.slice(0, 6).map((post) => ({
          ...post,
          readingTime: deriveReadingTime(post.excerpt),
        }));

        setPosts(enrichedPosts);
      } catch (loadError) {
        if (signal?.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load recent content.',
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const abortController = new AbortController();

    void loadPosts(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [loadPosts]);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, { label: string; accentColor: string }>();

    posts.forEach((post) => {
      if (post.category?.slug) {
        categoryMap.set(post.category.slug, {
          label: post.category.name ?? 'Uncategorized',
          accentColor: post.accentColor ?? '#6C63FF',
        });
      }
    });

    return Array.from(categoryMap.entries());
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === 'all' || post.category?.slug === activeCategory;
      const matchesQuery =
        query.trim().length === 0 ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        (post.excerpt ?? '').toLowerCase().includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [posts, activeCategory, query]);

  return (
    <section className="py-16 bg-[#f0f0f0]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black">
              <span className="bg-black text-white px-3 py-1 inline-block transform rotate-1">
                Latest Content
              </span>
            </h2>
            <p className="text-gray-600 mt-3 max-w-xl">
              Browse the freshest posts from the Syntax and Sips community.
              Filter by category or search for topics that interest you.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="search"
              placeholder="Search articles"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-8">
          <FilterChip
            label="All"
            isActive={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            accent="#2A2A2A"
          />
          {categories.map(([slug, { label, accentColor }]) => (
            <FilterChip
              key={slug}
              label={label}
              isActive={activeCategory === slug}
              onClick={() => setActiveCategory(slug)}
              accent={accentColor}
            />
          ))}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-live="polite">
            {[...Array(3)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="animate-pulse bg-white border-4 border-black rounded-lg p-6 h-64"
              >
                <div className="h-8 w-3/4 bg-gray-200 mb-4" />
                <div className="h-4 w-full bg-gray-200 mb-2" />
                <div className="h-4 w-2/3 bg-gray-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border-4 border-red-500 rounded-lg p-6 text-red-600 font-semibold space-y-4">
            <p>{error}</p>
            <button
              type="button"
              className="underline"
              onClick={() => {
                setQuery('');
                setActiveCategory('all');
                void loadPosts();
              }}
            >
              Try again
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white border-4 border-black rounded-lg p-10 text-center">
            <p className="text-xl font-bold">No results found</p>
            <p className="text-gray-600 mt-2">
              Adjust your filters or search term to discover more content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <ContentCard key={post.id} post={post} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link
            href="/blogs"
            className="group bg-black text-white px-6 py-3 text-lg font-bold rounded-md inline-flex items-center gap-2 transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)]"
          >
            View All Content
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  accent: string;
}

const FilterChip = ({ label, isActive, onClick, accent }: FilterChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 font-bold rounded-md border-2 border-black transition-colors duration-150 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] ${
      isActive ? 'text-white' : 'bg-white hover:bg-black/5'
    }`}
    style={{ backgroundColor: isActive ? accent : undefined }}
  >
    {label}
  </button>
);

const ContentCard = ({ post }: { post: EnhancedPost }) => {
  const categoryLabel = post.category?.name ?? 'Uncategorized';
  const accent = post.accentColor ?? '#6C63FF';

  return (
    <article className="bg-white border-4 border-black rounded-lg overflow-hidden transform transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0)] hover:-translate-y-1">
      <div
        className="h-2"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            {categoryLabel}
          </span>
          {post.publishedAt && (
            <span className="flex items-center gap-1 text-gray-600">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold">{post.title}</h3>
        {post.excerpt && (
          <p
            className="text-gray-600"
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
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{post.readingTime}</span>
          <span>{(post.views ?? 0).toLocaleString()} views</span>
        </div>
        <Link
          href={`/blogs/${post.slug}`}
          className="font-bold inline-flex items-center gap-1 text-[#6C63FF] hover:underline"
        >
          Read More <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
};
