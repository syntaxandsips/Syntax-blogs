"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Calendar, Clock } from 'lucide-react';

interface BlogCardProps {
  title: string;
  categoryLabel: string;
  accentColor?: string | null;
  date: string;
  views: number;
  excerpt: string;
  slug: string;
}

const colorPalette = ['#6C63FF', '#FF5252', '#06D6A0', '#FFD166', '#118AB2'];

const getFallbackColor = (label: string) => {
  if (!label) {
    return colorPalette[0];
  }

  const normalized = label.toLowerCase();
  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash + normalized.charCodeAt(index)) % colorPalette.length;
  }

  return colorPalette[hash];
};

export function NewBlogCard({
  title,
  categoryLabel,
  accentColor,
  date,
  views,
  excerpt,
  slug,
}: BlogCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: excerpt,
        url: window.location.origin + '/blogs/' + slug,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.origin + '/blogs/' + slug)
        .then(() => alert('Link copied to clipboard!'))
        .catch(console.error);
    }
    setMenuOpen(false);
  };

  const handleGenerateWithAI = () => {
    // This would be implemented with your AI generation functionality
    alert('Generate with AI functionality would go here');
    setMenuOpen(false);
  };

  const badgeColor = accentColor ?? getFallbackColor(categoryLabel);

  return (
    <article className="bg-white border-4 border-black rounded-lg overflow-hidden transform transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0)] hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span
            className="px-3 py-1 text-white font-bold rounded-md transform -rotate-2"
            style={{
              backgroundColor: badgeColor,
            }}
          >
            {categoryLabel}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Open menu"
            >
              <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0)] z-50">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-100"
                >
                  Share
                </button>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-100"
                >
                  Generate Post
                </button>
              </div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-black mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{excerpt}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
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
      </div>
    </article>
  );
}
