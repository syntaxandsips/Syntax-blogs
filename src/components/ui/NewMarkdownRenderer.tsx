"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { ComponentPropsWithoutRef } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { NewCodeBlock } from './NewCodeBlock';
import { NewVideoEmbed } from './NewVideoEmbed';

interface MarkdownRendererProps {
  content: string;
}

export function NewMarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) {
    return (
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <p className="text-red-500">No content provided to render.</p>
      </div>
    );
  }

  // Process YouTube embeds
  const processedContent = content.replace(
    /{youtube:([a-zA-Z0-9_-]+)}/g,
    (match, videoId) => `<div class="youtube-embed" data-video-id="${videoId}"></div>`
  );

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & {
            inline?: boolean;
          }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (!inline && language) {
              return (
                <NewCodeBlock
                  code={String(children).replace(/\n$/, '')}
                  language={language}
                />
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Custom component for YouTube embeds
          div({ className, ...props }: ComponentPropsWithoutRef<'div'> & {
            'data-video-id'?: string;
          }) {
            if (className === 'youtube-embed' && props['data-video-id']) {
              return <NewVideoEmbed videoId={props['data-video-id']} />;
            }

            return <div className={className} {...props} />;
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
