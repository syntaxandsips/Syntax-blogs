"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import { NewMarkdownRenderer } from '@/components/ui/NewMarkdownRenderer';
import { NewSummarizeButton } from '@/components/ui/NewSummarizeButton';
// import { NewSidebar } from '@/components/ui/NewSidebar';
import { SocialFollowItem } from '@/components/ui/SocialFollowItem';

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

export default function NewBlogPostClient({ slug }: BlogPostClientProps) {
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
      <div className="w-full bg-[#f0f0f0]">
        <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading post...</h2>
            <p>Please wait while we fetch the blog post.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (notFound || !clientBlogData) {
    return (
      <div className="w-full bg-[#f0f0f0]">
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <div className="mb-8">
            <Link href="/blogs" className="inline-flex items-center gap-2 mb-8 font-bold hover:text-[#6C63FF] transition">
              <ArrowLeft size={18} /> BACK TO BLOGS
            </Link>
          </div>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="mb-8">The blog post you&apos;re looking for doesn&apos;t exist or hasn&apos;t been published yet.</p>
            <Link href="/blogs" className="bg-black text-white px-4 py-2 font-bold rounded-md transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)]">
              BROWSE ALL BLOGS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show blog post
  return (
    <div className="w-full bg-[#f0f0f0]">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 mb-8 font-bold hover:text-[#6C63FF] transition"
        >
          <ArrowLeft size={18} /> BACK TO BLOGS
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <article className="bg-white border-4 border-black rounded-lg overflow-hidden">
              {/* Article header */}
              <div className="p-6 border-b-4 border-black">
                <div className="bg-[#FF5252] text-white px-3 py-1 text-sm font-bold inline-block mb-4">
                  {clientBlogData.category.toUpperCase()}
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4">
                  {clientBlogData.title.toUpperCase()}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                      {clientBlogData.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{clientBlogData.author}</div>
                      <div className="text-sm text-gray-600">{clientBlogData.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {clientBlogData.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      {clientBlogData.views} views
                    </div>
                  </div>
                </div>
                {/* AI Summary section */}
                <div className="mb-6">
                  <NewSummarizeButton content={clientBlogData.content} />
                </div>
              </div>
              {/* Article content */}
              <div className="p-6">
                <NewMarkdownRenderer content={clientBlogData.content} />
                
                <div className="flex flex-wrap gap-2 mt-8">
                  {clientBlogData.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-[#6C63FF]/10 text-[#6C63FF] font-bold rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* AI and ML Insights */}
            <div className="border-4 border-black bg-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">AI and ML Insights</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 border-2 border-black rounded-md bg-white hover:bg-black hover:text-white transition">
                  Artificial Intelligence
                </button>
                <button className="px-3 py-1 border-2 border-black rounded-md bg-white hover:bg-black hover:text-white transition">
                  Machine Learning
                </button>
                <button className="px-3 py-1 border-2 border-black rounded-md bg-white hover:bg-black hover:text-white transition">
                  Neural Networks
                </button>
                <button className="px-3 py-1 border-2 border-black rounded-md bg-white hover:bg-black hover:text-white transition">
                  Data Science
                </button>
                <button className="px-3 py-1 border-2 border-black rounded-md bg-white hover:bg-black hover:text-white transition">
                  Computer Vision
                </button>
                <button className="px-3 py-1 border-2 border-black rounded-md bg-white hover:bg-black hover:text-white transition">
                  Reinforcement Learning
                </button>
              </div>
              <button className="text-[#6C63FF] font-bold hover:underline mt-4">
                See more topics
              </button>
            </div>
            {/* Where to follow */}
            <div className="border-4 border-black bg-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Where to follow</h3>
              <div className="space-y-4">
                <SocialFollowItem
                  platform="YouTube"
                  handle="SyntaxAndSips"
                  icon={
                    <div className="w-8 h-8 bg-[#FF5252] rounded-md flex items-center justify-center text-white">
                      YT
                    </div>
                  }
                />
                <SocialFollowItem
                  platform="X (Twitter)"
                  handle="SyntaxAndSips"
                  icon={
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                      X
                    </div>
                  }
                />
                <SocialFollowItem
                  platform="Instagram"
                  handle="SyntaxAndSips"
                  icon={
                    <div className="w-8 h-8 bg-[#6C63FF] rounded-md flex items-center justify-center text-white">
                      IG
                    </div>
                  }
                />
                <SocialFollowItem
                  platform="Spotify"
                  handle="SyntaxAndSips"
                  icon={
                    <div className="w-8 h-8 bg-[#06D6A0] rounded-full flex items-center justify-center text-white">
                      SP
                    </div>
                  }
                />
                <SocialFollowItem
                  platform="Medium"
                  handle="SyntaxAndSips"
                  icon={
                    <div className="w-8 h-8 bg-[#FFD166] rounded-md flex items-center justify-center text-white">
                      M
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
