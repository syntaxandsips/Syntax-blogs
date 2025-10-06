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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const allBlogs = useMemo(
    () =>
      posts.map((post) => {
        const categoryIdentifier = (post.category?.slug ?? post.category?.name ?? 'uncategorized')
          .replace(/[-\s]+/g, '_')
          .toUpperCase();

        return {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt ?? '',
          category: categoryIdentifier,
          date: post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Unscheduled',
          views: post.views ?? 0,
        };
      }),
    [posts]
  );

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <NewBlogsHeader />
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="w-full lg:w-8/12">
          <NewTopicFilters
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
          <NewBlogGrid category={selectedCategory} blogs={allBlogs} />
        </div>
        <div className="w-full lg:w-4/12">
          <NewFollowSection />
        </div>
      </div>
    </div>
  );
}
