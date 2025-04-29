"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import SummarizeButton from '@/components/ui/SummarizeButton';
import { NewSidebar } from '@/components/ui/NewSidebar';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  views: number;
  content: string;
  status?: string;
}

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const [clientBlogData, setClientBlogData] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Fetch post from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoading(true);
      const savedPosts = localStorage.getItem('blogPosts');

      if (savedPosts) {
        try {
          const posts = JSON.parse(savedPosts);
          const foundPost = posts.find((post: BlogPost) => post.slug === slug && post.status === 'published');

          if (foundPost) {
            // Format the post data to match our expected structure
            setClientBlogData({
              slug: foundPost.slug,
              title: foundPost.title,
              date: new Date(foundPost.publishDate || foundPost.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }),
              author: foundPost.author || 'Developer',
              category: foundPost.category || 'Uncategorized',
              tags: foundPost.tags || [foundPost.category || 'Uncategorized'],
              views: foundPost.views || 0,
              content: foundPost.content
            });
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        } catch (error) {
          console.error('Error loading blog post:', error);
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }

      setLoading(false);
    }
  }, [slug]);

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading post...</h2>
          <p>Please wait while we fetch the blog post.</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (notFound || !clientBlogData) {
    return (
      <div className="container mx-auto px-6 py-8 min-h-screen">
        <div className="mb-8">
          <Link href="/blogs" className="back-button">
            ← BACK TO BLOGS
          </Link>
        </div>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="mb-8">The blog post you&apos;re looking for doesn&apos;t exist or hasn&apos;t been published yet.</p>
          <Link href="/blogs" className="neo-button py-2 px-4">
            BROWSE ALL BLOGS
          </Link>
        </div>
      </div>
    );
  }

  // Show blog post
  return (
    <div className="container mx-auto px-6 py-8 min-h-screen relative">
      <div className="mb-8">
        <Link href="/blogs" className="back-button">
          ← BACK TO BLOGS
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <article className="lg:col-span-3 border-2 border-black p-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute top-0 right-0 w-0 h-0 border-style: solid; border-width: 0 20px 20px 0; border-color: transparent var(--accent-purple) transparent transparent;"></div>
          <div className="mb-8">
            <div className="category-tag ai">
              {clientBlogData.category}
            </div>
            <h1 className="text-4xl font-bold mt-4 mb-2">
              {clientBlogData.title}
            </h1>

            <div className="flex items-center mt-4 mb-4">
              <div className="author-avatar mr-4">
                {clientBlogData.author.split(' ').map((word: string) => word[0]).join('')}
              </div>
              <div>
                <p className="font-medium">{clientBlogData.author}</p>
                <p className="text-sm text-gray-600">{clientBlogData.date}</p>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500 mt-4">
              <span className="flex items-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {clientBlogData.date}
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {clientBlogData.views}
              </span>
            </div>

            <div className="mt-6 mb-8">
              <SummarizeButton content={clientBlogData.content} />
            </div>
          </div>

          <div className="text-gray-800 leading-relaxed">
            <MarkdownRenderer content={clientBlogData.content} />
          </div>

          <div className="mt-12 pt-6 border-t-2 border-black">
            <div className="flex flex-wrap gap-2 mb-4">
              {clientBlogData.tags.map((tag: string) => (
                <span key={tag} className="topic-pill">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm">
              Published in <span className="font-bold">AI & ML Insights</span>
            </p>
          </div>
        </article>

        <aside className="lg:col-span-1">
          <NewSidebar />
        </aside>
      </div>
    </div>
  );
}
