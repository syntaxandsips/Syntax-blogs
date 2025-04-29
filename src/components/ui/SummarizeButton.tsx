"use client";

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLoader } from '@/context/LoaderContext';

interface SummarizeButtonProps {
  content: string;
}

export default function SummarizeButton({ content }: SummarizeButtonProps) {
  const { startLoading, stopLoading } = useLoader();
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    // Start the summarize loader animation
    setIsLoading(true);
    startLoading('summarize');

    try {
      // In a real app, this would be an API call to an AI service
      // For demo purposes, we'll simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate a simple summary based on the first few sentences
      const firstParagraph = content.split('\n\n')[0];
      const sentences = firstParagraph.split(/[.!?]+/).filter(Boolean);
      const simpleSummary = sentences.slice(0, 2).join('. ') + '.';

      // Add a generic AI-generated summary prefix
      const aiSummary = `This article discusses ${simpleSummary} The content covers key concepts and practical applications in this domain.`;

      setSummary(aiSummary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  return (
    <div>
      {!summary && !isLoading && (
        <button
          type="button"
          onClick={handleSummarize}
          className="neo-button flex items-center space-x-2 py-2 px-4"
        >
          <Sparkles size={16} />
          <span>Summarize with AI</span>
        </button>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 my-4">
          <div className="h-4 w-4 bg-[#6C63FF] rounded-full animate-pulse"></div>
          <div className="h-4 w-4 bg-[#FF5252] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-4 w-4 bg-[#FFD166] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <span className="font-bold">AI is summarizing...</span>
        </div>
      )}

      {summary && (
        <div className="my-6 p-6 border-4 border-black rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-[#6C63FF]" />
            <h3 className="font-bold text-lg">AI Summary</h3>
          </div>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
