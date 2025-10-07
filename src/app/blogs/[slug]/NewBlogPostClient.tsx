"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Eye,
  Twitter,
  Linkedin,
  Github,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import { NewMarkdownRenderer } from '@/components/ui/NewMarkdownRenderer';
import { NewSummarizeButton } from '@/components/ui/NewSummarizeButton';
import { SocialFollowItem } from '@/components/ui/SocialFollowItem';
import { CommentsSection } from '@/components/ui/CommentsSection';
import type { BlogListPost, BlogPostDetail } from '@/lib/posts';

interface BlogPostClientProps {
  post: BlogPostDetail;
  relatedPosts: BlogListPost[];
}

const formatDisplayDate = (publishedAt: string | null) =>
  publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unscheduled';

export default function NewBlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  useEffect(() => {
    fetch(`/api/posts/${post.slug}/view`, { method: 'POST' }).catch(() => {
      // Intentionally swallow errors so UI rendering is unaffected.
    });
  }, [post.slug]);

  const categoryBadge = (post.category.name ?? post.category.slug ?? 'Uncategorized')
    .replace(/[-\s]+/g, ' ')
    .toUpperCase();

  const authorInitial = (post.author.displayName ?? 'Admin').charAt(0).toUpperCase();
  const formattedDate = formatDisplayDate(post.publishedAt);
  const tags = post.tags.length > 0 ? post.tags : [categoryBadge];

  const [shareUrl, setShareUrl] = useState(`https://syntaxandsips.com/blogs/${post.slug}`);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [post.slug]);

  useEffect(() => {
    if (copyState === 'copied') {
      const timeout = window.setTimeout(() => setCopyState('idle'), 2500);
      return () => window.clearTimeout(timeout);
    }
    return () => undefined;
  }, [copyState]);

  const handleCopyLink = useCallback(() => {
    if (navigator?.clipboard) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => setCopyState('copied'))
        .catch(() => setCopyState('idle'));
      return;
    }

    if (typeof window !== 'undefined') {
      window.prompt('Copy this link', shareUrl);
      setCopyState('copied');
    }
  }, [shareUrl]);

  const shareTargets = useMemo<
    { name: string; href?: string; icon: JSX.Element; styles: string; onClick?: () => void }[]
  >(
    () => [
      {
        name: 'X (Twitter)',
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`,
        icon: <Twitter className="h-4 w-4" aria-hidden="true" />,
        styles: 'bg-[#1DA1F2] text-white',
      },
      {
        name: 'LinkedIn',
        href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`,
        icon: <Linkedin className="h-4 w-4" aria-hidden="true" />,
        styles: 'bg-[#0A66C2] text-white',
      },
      {
        name: 'Copy link',
        href: '#',
        icon: copyState === 'copied' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />,
        styles: 'bg-white text-[#6C63FF] border-2 border-[#6C63FF]',
        onClick: handleCopyLink,
      },
    ],
    [copyState, handleCopyLink, post.title, shareUrl],
  );

  return (
    <div className="w-full bg-[#f0f0f0]">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 mb-8 font-bold hover:text-[#6C63FF] transition"
        >
          <ArrowLeft size={18} /> BACK TO BLOGS
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <article className="bg-white border-4 border-black rounded-lg overflow-hidden">
              <div className="p-6 border-b-4 border-black">
                <div className="bg-[#FF5252] text-white px-3 py-1 text-sm font-bold inline-block mb-4">
                  {categoryBadge}
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4">
                  {post.title.toUpperCase()}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                      {authorInitial}
                    </div>
                    <div>
                      <div className="font-bold">{post.author.displayName ?? 'Admin'}</div>
                      <div className="text-sm text-gray-600">{formattedDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formattedDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      {post.views} views
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <NewSummarizeButton content={post.content} />
                </div>
              </div>
              <div className="p-6">
                <NewMarkdownRenderer content={post.content} />

                <div className="mt-10 space-y-4 border-t-4 border-dashed border-black/20 pt-6">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
                    <h2 className="text-lg font-black">Share this article</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {shareTargets.map((target) =>
                      target.onClick ? (
                        <button
                          key={target.name}
                          type="button"
                          onClick={target.onClick}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#6C63FF] ${target.styles}`}
                        >
                          {target.icon}
                          {copyState === 'copied' ? 'Copied!' : target.name}
                        </button>
                      ) : (
                        <a
                          key={target.name}
                          href={target.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#6C63FF] ${target.styles}`}
                        >
                          {target.icon}
                          {target.name}
                        </a>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-8">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-[#6C63FF]/10 text-[#6C63FF] font-bold rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>

                {relatedPosts.length > 0 && (
                  <div className="mt-12 border-t-4 border-black/10 pt-8">
                    <h2 className="text-2xl font-black mb-6">Related reads</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.id}
                          href={`/blogs/${related.slug}`}
                          className="group flex flex-col gap-3 rounded-xl border-4 border-black bg-white p-5 transition hover:-translate-y-[2px] hover:border-[#6C63FF] hover:shadow-[6px_6px_0px_0px_rgba(108,99,255,0.25)]"
                        >
                          <span
                            className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide text-white"
                            style={{ backgroundColor: related.accentColor ?? '#6C63FF' }}
                          >
                            {related.category.name ?? 'Uncategorized'}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{related.title}</h3>
                          {related.excerpt && (
                            <p
                              className="text-sm text-gray-600"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {related.excerpt}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#6C63FF]">
                            Continue reading
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <CommentsSection postSlug={post.slug} />
              </div>
            </article>
          </div>
          <div className="lg:col-span-1 space-y-8">
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
            <div className="border-4 border-black bg-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Follow Syntax &amp; Sips</h3>
              <div className="space-y-4">
                <SocialFollowItem
                  platform="Twitter"
                  handle="@syntaxandsips"
                  icon={<Twitter className="h-6 w-6 text-[#1DA1F2]" />}
                />
                <SocialFollowItem
                  platform="LinkedIn"
                  handle="/company/syntaxandsips"
                  icon={<Linkedin className="h-6 w-6 text-[#0A66C2]" />}
                />
                <SocialFollowItem
                  platform="GitHub"
                  handle="syntaxandsips"
                  icon={<Github className="h-6 w-6 text-black" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
