import React from 'react';
import { NewBlogCard } from './NewBlogCard';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date?: string;
  views?: number;
}

interface BlogGridProps {
  category: string | null;
  blogs: BlogPost[];
}

export function NewBlogGrid({ category, blogs }: BlogGridProps) {
  // Filter blogs by category if a category is selected
  const filteredBlogs = category
    ? blogs.filter((blog) => blog.category.toUpperCase() === category.toUpperCase())
    : blogs;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {filteredBlogs.length > 0 ? (
        filteredBlogs.map((blog) => (
          <NewBlogCard
            key={blog.slug}
            title={blog.title}
            category={blog.category}
            date={blog.date || 'No date'}
            views={blog.views || 0}
            excerpt={blog.excerpt}
            slug={blog.slug}
          />
        ))
      ) : (
        <div className="col-span-2 text-center p-12 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
          <p className="text-xl font-bold">No blog posts found.</p>
          <p className="mt-2">Check back later for new content!</p>
        </div>
      )}
    </div>
  );
}
