'use client'

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';

import { NeobrutalCard } from '@/components/neobrutal/card';
import { BlogEngagementToolbar } from './BlogEngagementToolbar';

interface BlogCardProps {
  id: string;
  title: string;
  categoryLabel: string;
  accentColor?: string | null;
  date: string;
  views: number;
  excerpt: string;
  slug: string;
  author?: {
    id: string | null;
    displayName: string | null;
  };
  onHide?: () => void;
  onToggleFollow?: (nextAction: 'follow' | 'unfollow') => void;
  onToggleMute?: (nextAction: 'mute' | 'unmute') => void;
  isAuthorFollowed?: boolean;
  isAuthorMuted?: boolean;
}

const colorPalette = ['#6C63FF', '#FF5252', '#06D6A0', '#FFD166', '#118AB2']

const getFallbackColor = (label: string) => {
  if (!label) {
    return colorPalette[0]
  }

  const normalized = label.toLowerCase()
  let hash = 0

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash + normalized.charCodeAt(index)) % colorPalette.length
  }

  return colorPalette[hash]
}

export function NewBlogCard({
  id,
  title,
  categoryLabel,
  accentColor,
  date,
  views,
  excerpt,
  slug,
  author,
  onHide,
  onToggleFollow,
  onToggleMute,
  isAuthorFollowed = false,
  isAuthorMuted = false,
}: BlogCardProps) {
  const badgeColor = accentColor ?? getFallbackColor(categoryLabel);

  return (
    <NeobrutalCard as="article" className="overflow-hidden p-0">
      <div className="space-y-4 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <span
            className="px-3 py-1 text-white font-bold rounded-md transform -rotate-2"
            style={{
              backgroundColor: badgeColor,
            }}
          >
            {categoryLabel}
          </span>
        </div>
        <h3 className="text-xl font-black mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {date}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {views} views
            </div>
          </div>
          <Link
            href={`/blogs/${slug}`}
            className="bg-black text-white px-4 py-2 font-bold rounded-md transform transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)]"
          >
            READ POST
          </Link>
        </div>
        <BlogEngagementToolbar
          postId={id}
          slug={slug}
          title={title}
          excerpt={excerpt}
          initialViews={views}
          authorId={author?.id ?? null}
          authorName={author?.displayName ?? null}
          isFollowingAuthor={isAuthorFollowed}
          isAuthorMuted={isAuthorMuted}
          onHide={onHide}
          onToggleFollow={onToggleFollow}
          onToggleMute={onToggleMute}
        />
      </div>
    </NeobrutalCard>
  )
}
