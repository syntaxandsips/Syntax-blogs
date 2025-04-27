"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CodeBlock from './CodeBlock';
import YouTubeEmbed from './YouTubeEmbed';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Log content length to verify it's being passed correctly
  console.log('MarkdownRenderer received content length:', content?.length || 0);

  if (!content) {
    return (
      <div className="markdown-content p-4 bg-red-50 border border-red-200 rounded">
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
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (!inline && language) {
              return (
                <CodeBlock
                  code={String(children).replace(/\n$/, '')}
                  language={language}
                  availableLanguages={['javascript', 'python', 'typescript', 'jsx', 'bash', 'css', 'html']}
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
          div({ node, className, ...props }) {
            if (className === 'youtube-embed' && props['data-video-id']) {
              return <YouTubeEmbed videoId={props['data-video-id']} />;
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
