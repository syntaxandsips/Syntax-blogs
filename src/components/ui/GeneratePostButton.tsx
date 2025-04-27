"use client";

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLoader } from '@/context/LoaderContext';

export default function GeneratePostButton() {
  const { startLoading, stopLoading } = useLoader();
  const [isOpen, setIsOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleGenerate = async () => {
    // Start the AI generation loader animation
    startLoading('ai-generate');
    
    try {
      // In a real app, this would be an API call to an AI service
      // For demo purposes, we'll simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Sample generated content
      const aiContent = `# The Future of Machine Learning
      
## Introduction

Machine learning continues to evolve at a rapid pace, transforming industries and creating new possibilities for innovation. This article explores the latest trends and future directions in the field.

## Key Trends

1. **Multimodal Learning**: Systems that can process and understand multiple types of data simultaneously.
2. **Few-Shot Learning**: Models that can learn from minimal examples.
3. **Explainable AI**: Making black-box models more transparent and interpretable.

## Practical Applications

The advancements in machine learning are enabling new applications across healthcare, finance, transportation, and more. Organizations are leveraging these technologies to improve decision-making, automate processes, and create more personalized experiences.

## Conclusion

As machine learning continues to mature, we can expect to see more sophisticated applications that blend seamlessly into our daily lives, augmenting human capabilities rather than replacing them.`;
      
      setGeneratedContent(aiContent);
      setIsOpen(true);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGenerate}
        className="neo-button flex items-center space-x-2 py-2 px-4"
      >
        <Sparkles size={16} />
        <span>Generate Post</span>
      </button>
      
      {isOpen && generatedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neo-container bg-white p-6 max-w-4xl w-full h-[80vh] overflow-auto">
            <h3 className="text-2xl font-bold mb-4">Generated Content</h3>
            <div className="mb-6 whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 border border-gray-200 rounded">
              {generatedContent}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  alert('Content copied to clipboard!');
                }}
                className="neo-button py-2 px-4 bg-green-300"
              >
                Copy to Clipboard
              </button>
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
