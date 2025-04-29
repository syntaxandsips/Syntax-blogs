"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Calendar, Clock } from 'lucide-react';

interface BlogCardProps {
  title: string;
  category: string;
  date: string;
  views: number;
  excerpt: string;
  slug: string;
}

export function NewBlogCard({
  title,
  category,
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
    }
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

  const getCategoryColor = (cat: string) => {
    const colors: {
      [key: string]: string
    } = {
      'REINFORCEMENT LEARNING': '#FF5252',
      'MACHINE LEARNING': '#6C63FF',
      'QUANTUM COMPUTING': '#FFD166',
      'CODING': '#06D6A0',
      'AI ETHICS': '#FF5252',
      'DATA SCIENCE': '#6C63FF',
      'ARTIFICIAL INTELLIGENCE': '#FF5252',
      'DEEP LEARNING': '#6C63FF',
    };
    
    // Normalize the category by replacing underscores with spaces and converting to uppercase
    const normalizedCategory = cat.replace(/_/g, ' ').toUpperCase();
    return colors[normalizedCategory] || '#6C63FF';
  };

  return (
    <article className="bg-white border-4 border-black rounded-lg overflow-hidden transform transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0)] hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span
            className="px-3 py-1 text-white font-bold rounded-md transform -rotate-2"
            style={{
              backgroundColor: getCategoryColor(category),
            }}
          >
            {category.replace(/_/g, ' ')}
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
