"use client";

import { useState, useEffect } from 'react';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import ChangelogTimeline from '@/components/ui/ChangelogTimeline';

interface ChangelogViewProps {
  content: string;
}

export default function ChangelogView({ content }: ChangelogViewProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'original'>('timeline');
  const isDev = process.env.NODE_ENV !== 'production';

  // Make sure content is properly passed
  const processedContent = content || '';

  if (isDev) {
    // Log content length to verify it's being passed correctly
    console.info('ChangelogView received content length:', processedContent.length);
    console.info('ChangelogView content preview:', processedContent.substring(0, 100));
  }

  // Force view mode to original if there's an issue with the content
  useEffect(() => {
    if (processedContent.length > 0 && !processedContent.includes('## [')) {
      if (isDev) {
        console.info('Content does not contain version headers, switching to original view');
      }
      setViewMode('original');
    }
  }, [isDev, processedContent]);

  // Handle view mode toggle
  const handleViewModeToggle = (mode: 'timeline' | 'original') => {
    if (isDev) {
      console.info('Switching to view mode:', mode);
    }
    setViewMode(mode);
  };

  return (
    <>
      {/* Toggle between timeline and original view */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex border-4 border-black overflow-hidden">
          <button
            type="button"
            className={`py-2 px-4 font-bold border-r-4 border-black toggle-button ${viewMode === 'timeline' ? 'active' : 'inactive'}`}
            onClick={() => handleViewModeToggle('timeline')}
          >
            Timeline View
          </button>
          <button
            type="button"
            className={`py-2 px-4 font-bold toggle-button ${viewMode === 'original' ? 'active' : 'inactive'}`}
            onClick={() => handleViewModeToggle('original')}
          >
            Original View
          </button>
        </div>
      </div>

      {/* Content view based on selected mode */}
      <div className="relative z-10">
        {viewMode === 'timeline' ? (
          <ChangelogTimeline content={processedContent} />
        ) : (
          <div className="prose prose-lg max-w-none changelog-content">
            <MarkdownRenderer content={processedContent} />
          </div>
        )}
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm text-gray-700">Debug: Content length: {processedContent.length}</p>
          <p className="text-sm text-gray-700">View Mode: {viewMode}</p>
          <p className="text-sm text-gray-700">Has version headers: {processedContent.includes('## [') ? 'Yes' : 'No'}</p>
        </div>
      )}
    </>
  );
}
