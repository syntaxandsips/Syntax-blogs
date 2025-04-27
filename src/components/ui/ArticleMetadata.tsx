"use client";

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Share, Sparkles } from 'lucide-react';

interface ArticleMetadataProps {
  date: string;
  views: number;
}

export function ArticleMetadata({ date, views }: ArticleMetadataProps) {
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const shareArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator.share({
        title: 'Check out this article',
        text: 'I found this interesting article',
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((error) => console.log('Error copying to clipboard', error));
    }

    setShowOptions(false);
  };

  const generatePost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alert('Generating post with AI...');
    // Implement AI post generation functionality
    setShowOptions(false);
  };

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <div className="flex items-center space-x-4">
        <div className="flex items-center group">
          <Sparkles className="w-4 h-4 text-yellow-500 mr-1 group-hover:text-orange-600 transition-colors" />
          <span className="group-hover:text-orange-600 transition-colors">{date}</span>
        </div>
        <div className="flex items-center group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:text-orange-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="group-hover:text-orange-600 transition-colors">{views}</span>
        </div>
      </div>

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-label="More options"
          title="More options"
          onClick={toggleOptions}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {showOptions && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border-2 border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                type="button"
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-100 transition-colors"
                onClick={shareArticle}
              >
                <Share className="w-4 h-4 mr-2" />
                Share link
              </button>
              <button
                type="button"
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-100 transition-colors"
                onClick={generatePost}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
