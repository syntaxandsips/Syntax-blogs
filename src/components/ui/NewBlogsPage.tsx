"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Search, ArrowLeft, ArrowRight, ArrowUpDown } from 'lucide-react';
import type { BlogListPost } from '@/lib/posts';
import { NewBlogsHeader } from './NewBlogsHeader';
import { NewBlogGrid, type BlogGridItem } from './NewBlogGrid';
import { NewTopicFilters } from './NewTopicFilters';
import { NewFollowSection } from './NewFollowSection';
import { NeobrutalCard } from '@/components/neobrutal/card';
import { NeobrutalToggleSwitch } from '@/components/neobrutal/toggle-switch';

interface NewBlogsPageProps {
  posts: BlogListPost[];
}

export function NewBlogsPage({ posts }: NewBlogsPageProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;

  const derivedCategories = useMemo(() => {
    const categoryMap = new Map<string, { slug: string; label: string }>();

    posts.forEach((post) => {
      const slug = post.category?.slug ?? 'uncategorized';
      const label = post.category?.name ?? 'Uncategorized';
      if (!categoryMap.has(slug)) {
        categoryMap.set(slug, {
          slug,
          label,
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [posts]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    [],
  );

  const allBlogs = useMemo(() => {
    return posts.map((post) => {
      const slug = post.category?.slug ?? 'uncategorized';
      const label = post.category?.name ?? 'Uncategorized';
      const publishedAt = post.publishedAt ?? null;

      return {
        postId: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? '',
        categorySlug: slug,
        categoryLabel: label,
        accentColor: post.accentColor ?? null,
        publishedAt,
        dateLabel:
          publishedAt && !Number.isNaN(new Date(publishedAt).getTime())
            ? dateFormatter.format(new Date(publishedAt))
            : 'Unscheduled',
        views: post.views ?? 0,
      };
    });
  }, [dateFormatter, posts]);

  const recommendedTopics = useMemo(
    () => derivedCategories.map((category) => category.label),
    [derivedCategories],
  );

  const filteredBlogs = useMemo(() => {
    const activeCategories = new Set(selectedCategories);
    const normalizedQuery = query.trim().toLowerCase();

    return allBlogs.filter((blog) => {
      const matchesCategory =
        activeCategories.size === 0 || activeCategories.has(blog.categorySlug);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        blog.title.toLowerCase().includes(normalizedQuery) ||
        blog.excerpt.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [allBlogs, query, selectedCategories]);

  const sortedBlogs = useMemo(() => {
    const copy = [...filteredBlogs];

    if (sortBy === 'popular') {
      return copy.sort((a, b) => b.views - a.views);
    }

    return copy.sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredBlogs, sortBy]);

  const totalPages = sortedBlogs.length === 0 ? 1 : Math.ceil(sortedBlogs.length / PAGE_SIZE);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const sortParam = params.get('sort');

    if (sortParam === 'popular') {
      setSortBy('popular');
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedCategories, query, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedBlogs: BlogGridItem[] = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return sortedBlogs.slice(start, end).map((blog) => ({
      postId: blog.postId,
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt,
      categoryLabel: blog.categoryLabel,
      accentColor: blog.accentColor,
      dateLabel: blog.dateLabel,
      views: blog.views,
    }));
  }, [page, sortedBlogs]);

  const handleToggleCategory = (categorySlug: string) => {
    setSelectedCategories((previous) => {
      if (previous.includes(categorySlug)) {
        return previous.filter((slug) => slug !== categorySlug);
      }
      return [...previous, categorySlug];
    });
  };

  const handleResetCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="container mx-auto px-4 pb-14 pt-10">
      <NewBlogsHeader />
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="w-full lg:w-8/12 lg:overflow-y-auto">
          <NeobrutalCard className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <label htmlFor="blogs-search" className="sr-only">
                  Search blog posts
                </label>
                <input
                  id="blogs-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search titles, tags, or keywords"
                  className="w-full rounded-md border-2 border-black bg-[#f7f7f7] py-2 pl-9 pr-3 font-semibold text-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] placeholder:text-gray-400 focus:border-[#6C63FF] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <ArrowUpDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <NeobrutalToggleSwitch
                  label="Sort"
                  aria-label="Toggle between latest and most popular posts"
                  checked={sortBy === 'popular'}
                  onLabel="Popular"
                  offLabel="Latest"
                  onCheckedChange={(checked) => setSortBy(checked ? 'popular' : 'latest')}
                />
              </div>
            </div>

            <NewTopicFilters
              categories={derivedCategories}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              onReset={handleResetCategories}
            />

            <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-gray-600">
              <span>
                Showing {(paginatedBlogs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1).toLocaleString()}-
                {(page - 1) * PAGE_SIZE + paginatedBlogs.length} of {sortedBlogs.length} posts
              </span>
              <span>{selectedCategories.length > 0 ? `${selectedCategories.length} topic filter(s)` : 'All topics'}</span>
            </div>

            <NewBlogGrid blogs={paginatedBlogs} />

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-2 rounded-md border-2 border-black px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              <p className="text-sm font-semibold text-gray-700">
                Page {Math.min(page, totalPages)} of {totalPages}
              </p>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-2 rounded-md border-2 border-black px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </NeobrutalCard>
        </div>
        <aside className="w-full lg:w-4/12 lg:sticky lg:top-24 lg:self-start">
          <div className="px-2 lg:px-0">
            <NewFollowSection topics={recommendedTopics} />
          </div>
        </aside>
      </div>
    </div>
  );
}
