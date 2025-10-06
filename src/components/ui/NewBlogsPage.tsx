"use client";

import React, { useMemo, useState } from 'react';
import type { BlogListPost } from '@/lib/posts';
import { NewBlogsHeader } from './NewBlogsHeader';
import { NewBlogGrid } from './NewBlogGrid';
import { NewTopicFilters } from './NewTopicFilters';
import { NewFollowSection } from './NewFollowSection';

interface NewBlogsPageProps {
  posts: BlogListPost[];
}

export function NewBlogsPage({ posts }: NewBlogsPageProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

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

  const allBlogs = useMemo(
    () =>
      posts.map((post) => {
        const slug = post.category?.slug ?? 'uncategorized';
        const label = post.category?.name ?? 'Uncategorized';

        return {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt ?? '',
          categorySlug: slug,
          categoryLabel: label,
          accentColor: post.accentColor ?? null,
          dateLabel: post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Unscheduled',
          views: post.views ?? 0,
        };
      }),
    [posts]
  );

  const recommendedTopics = useMemo(
    () => derivedCategories.map((category) => category.label),
    [derivedCategories],
  );

  const handleCategorySelect = (categorySlug: string | null) => {
    setSelectedCategorySlug(categorySlug);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <NewBlogsHeader />
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="w-full lg:w-8/12">
          <NewTopicFilters
            categories={derivedCategories}
            selectedCategory={selectedCategorySlug}
            onSelectCategory={handleCategorySelect}
          />
          <NewBlogGrid categorySlug={selectedCategorySlug} blogs={allBlogs} />
        </div>
        <div className="w-full lg:w-4/12">
          <NewFollowSection topics={recommendedTopics} />
        </div>
      </div>
    </div>
  );
}
