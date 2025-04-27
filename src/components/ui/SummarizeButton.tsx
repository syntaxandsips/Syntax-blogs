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
  const [isOpen, setIsOpen] = useState(false);

  const handleSummarize = async () => {
    // Start the summarize loader animation
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
      setIsOpen(true);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSummarize}
        className="neo-button flex items-center space-x-2 py-2 px-4"
      >
        <Sparkles size={16} />
        <span>Summarize with AI</span>
      </button>

      {isOpen && summary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neo-container bg-white p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">AI Summary</h3>
            <p className="mb-6">{summary}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="neo-button py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
