"use client";

import React, { useState, useEffect } from 'react';
import { NewBlogsHeader } from './NewBlogsHeader';
import { NewBlogGrid } from './NewBlogGrid';
import { NewTopicFilters } from './NewTopicFilters';
import { NewFollowSection } from './NewFollowSection';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  accent?: string;
  status?: string;
  publishDate?: string;
  date?: string;
  views?: number;
  comments?: number;
}

export function NewBlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  
  // Load published blogs from localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
      try {
        const publishedBlogs = JSON.parse(savedPosts).filter((post: BlogPost & { status?: string }) => post.status === 'published');
        // Format published blogs to match our blog structure
        const formattedBlogs = publishedBlogs.map((blog: BlogPost & { status?: string; publishDate?: string }) => ({
          slug: blog.slug,
          title: blog.title,
          excerpt: blog.excerpt,
          category: blog.category,
          accent: blog.accent || '',
          date: new Date(blog.publishDate || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          views: blog.views || 0
        }));

        // Set only the dynamically published posts
        setAllBlogs(formattedBlogs);
      } catch (error) {
        console.error('Error loading published blogs:', error);
      }
    }
  }, []);

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
          <NewBlogGrid 
            category={selectedCategory} 
            blogs={allBlogs}
          />
        </div>
        <div className="w-full lg:w-4/12">
          <NewFollowSection />
        </div>
      </div>
    </div>
  );
}
