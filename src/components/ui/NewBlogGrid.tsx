import React from 'react'
import { NewBlogCard } from './NewBlogCard'

export interface BlogGridItem {
  postId: string
  slug: string
  title: string
  excerpt: string
  categoryLabel: string
  dateLabel: string
  views: number
  accentColor: string | null
}

interface BlogGridProps {
  blogs: BlogGridItem[]
}

export function NewBlogGrid({ blogs }: BlogGridProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      {blogs.length > 0 ? (
        blogs.map((blog) => (
          <NewBlogCard
            key={blog.slug}
            postId={blog.postId}
            title={blog.title}
            categoryLabel={blog.categoryLabel}
            accentColor={blog.accentColor}
            date={blog.dateLabel}
            views={blog.views}
            excerpt={blog.excerpt}
            slug={blog.slug}
          />
        ))
      ) : (
        <div className="col-span-2 rounded-xl border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
          <p className="text-xl font-bold">No blog posts found.</p>
          <p className="mt-2 text-gray-600">Adjust your filters or check back later for new content.</p>
        </div>
      )}
    </div>
  )
}
