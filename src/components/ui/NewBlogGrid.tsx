import React from 'react';
import { NewBlogCard } from './NewBlogCard';

export interface BlogGridItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryLabel: string;
  dateLabel: string;
  views: number;
  accentColor: string | null;
  authorId: string | null;
  authorName: string | null;
}

interface BlogGridProps {
  blogs: BlogGridItem[];
  onHidePost?: (blog: BlogGridItem) => void;
  onToggleFollow?: (authorId: string, action: 'follow' | 'unfollow', authorName: string | null) => void;
  onToggleMute?: (authorId: string, action: 'mute' | 'unmute', authorName: string | null) => void;
  followingAuthorIds?: string[];
  mutedAuthorIds?: string[];
}

export function NewBlogGrid({
  blogs,
  onHidePost,
  onToggleFollow,
  onToggleMute,
  followingAuthorIds = [],
  mutedAuthorIds = [],
}: BlogGridProps) {
  const followingSet = new Set(followingAuthorIds.filter(Boolean));
  const mutedSet = new Set(mutedAuthorIds.filter(Boolean));

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      {blogs.length > 0 ? (
        blogs.map((blog) => (
          <NewBlogCard
            key={blog.slug}
            id={blog.id}
            title={blog.title}
            categoryLabel={blog.categoryLabel}
            accentColor={blog.accentColor}
            date={blog.dateLabel}
            views={blog.views}
            excerpt={blog.excerpt}
            slug={blog.slug}
            author={{ id: blog.authorId, displayName: blog.authorName }}
            onHide={onHidePost ? () => onHidePost(blog) : undefined}
            onToggleFollow={
              blog.authorId && onToggleFollow
                ? (action) => onToggleFollow(blog.authorId as string, action, blog.authorName)
                : undefined
            }
            onToggleMute={
              blog.authorId && onToggleMute
                ? (action) => onToggleMute(blog.authorId as string, action, blog.authorName)
                : undefined
            }
            isAuthorFollowed={Boolean(blog.authorId && followingSet.has(blog.authorId))}
            isAuthorMuted={Boolean(blog.authorId && mutedSet.has(blog.authorId))}
          />
        ))
      ) : (
        <div className="col-span-2 rounded-xl border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
          <p className="text-xl font-bold">No blog posts found.</p>
          <p className="mt-2 text-gray-600">Adjust your filters or check back later for new content.</p>
        </div>
      )}
    </div>
  );
}
