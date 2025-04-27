"use client";

import Link from 'next/link';
import '@/styles/neo-brutalism.css';
import { Sidebar } from '@/components/ui/Sidebar';
import { ReadArticleButton } from '@/components/ui/ReadArticleButton';
import { ArticleMetadata } from '@/components/ui/ArticleMetadata';
import { useEffect, useState } from 'react';

// No preset blogs - we'll only show dynamically published posts
const blogs: BlogPost[] = [];

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

export default function BlogsClientPage() {
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>(blogs);
  const accentClasses = ['', 'accent-secondary', 'accent-tertiary'];

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

  return (
    <div className="neo-brutalism container mx-auto p-8 min-h-screen relative">
      <div className="mb-12 text-center">
        <h1 className="neo-title text-4xl font-bold inline-block font-sans">AI & ML Insights</h1>
        <p className="text-xl mt-4 font-sans max-w-2xl mx-auto">
          Exploring the cutting edge of artificial intelligence, machine learning, and deep learning
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          {allBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allBlogs.map((blog, index) => {
                // Use provided accent or assign randomly based on index
                const accentClass = blog.accent || accentClasses[index % accentClasses.length];

                return (
                  <div key={blog.slug} className="block transform transition-transform hover:-translate-y-1">
                    <div className={`neo-card ${accentClass} p-6 h-full flex flex-col`}>
                      <div className="mb-2">
                        <span className="neo-tag text-xs">{blog.category}</span>
                      </div>
                      <Link href={`/blogs/${blog.slug}`}>
                        <h2 className="mb-3 text-2xl font-bold font-sans hover:underline">{blog.title}</h2>
                      </Link>
                      <p className="font-normal mb-4 flex-grow font-sans">{blog.excerpt}</p>
                      <ArticleMetadata date={blog.date || 'No date'} views={blog.views || 0} />
                      <div className="mt-4 flex justify-between items-center">
                        <Link href={`/blogs/${blog.slug}`}>
                          <ReadArticleButton />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 border-2 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <p className="text-xl">No blog posts found.</p>
              <p className="mt-2">Check back later for new content!</p>
            </div>
          )}
        </div>

        <div className="lg:w-1/4 mt-8 lg:mt-0">
          <div className="neo-container p-6 border-2 border-black">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
