"use client";

import React from 'react';
import Link from 'next/link';
import { Youtube, Twitter, Instagram, BookOpen, Music, MessageSquare } from 'lucide-react';

interface NewFollowSectionProps {
  topics: string[];
}

export function NewFollowSection({ topics }: NewFollowSectionProps) {
  const displayedTopics = topics.slice(0, 7);

  return (
    <div className="space-y-8">
      <div className="bg-white border-4 border-black p-6 rounded-lg transform rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
        <h3 className="text-xl font-black mb-4">Recommended topics</h3>
        {displayedTopics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {displayedTopics.map((topic) => (
              <TopicTag key={topic}>{topic}</TopicTag>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Published posts will automatically populate recommended topics.
          </p>
        )}
        <Link href="/topics" className="mt-4 inline-block text-sm font-bold text-[#6C63FF] hover:underline">
          See more topics
        </Link>
      </div>
      <div className="bg-white border-4 border-black p-6 rounded-lg transform -rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
        <h3 className="text-xl font-black mb-4">Where to follow</h3>
        <div className="space-y-4">
          <SocialFollowButton
            platform="YouTube"
            handle="SyntaxAndSips"
            color="bg-[#FF5252]"
            icon={<Youtube className="w-5 h-5 text-white" />}
            link="https://youtube.com/@syntaxandsips"
          />
          <SocialFollowButton
            platform="X (Twitter)"
            handle="SyntaxAndSips"
            color="bg-black"
            icon={<Twitter className="w-5 h-5 text-white" />}
            link="https://twitter.com/syntaxandsips"
          />
          <SocialFollowButton
            platform="Instagram"
            handle="SyntaxAndSips"
            color="bg-[#6C63FF]"
            icon={<Instagram className="w-5 h-5 text-white" />}
            link="https://instagram.com/syntaxandsips"
          />
          <SocialFollowButton
            platform="Medium"
            handle="SyntaxAndSips"
            color="bg-[#FFD166]"
            icon={<BookOpen className="w-5 h-5 text-white" />}
            link="https://medium.com/@syntaxandsips"
          />
          <SocialFollowButton
            platform="Spotify"
            handle="SyntaxAndSips"
            color="bg-[#06D6A0]"
            icon={<Music className="w-5 h-5 text-white" />}
            link="https://open.spotify.com/show/syntaxandsips"
          />
          <SocialFollowButton
            platform="Discord"
            handle="SyntaxAndSips"
            color="bg-[#6C63FF]"
            icon={<MessageSquare className="w-5 h-5 text-white" />}
            link="https://discord.gg/syntaxandsips"
          />
        </div>
      </div>
    </div>
  );
}

const TopicTag = ({ children }: { children: React.ReactNode }) => (
  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md border-2 border-black text-sm font-bold">
    {children}
  </span>
);

interface SocialFollowButtonProps {
  platform: string;
  handle: string;
  color: string;
  icon: React.ReactNode;
  link: string;
}

const SocialFollowButton = ({
  platform,
  handle,
  color,
  icon,
  link,
}: SocialFollowButtonProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 ${color} rounded-md border-2 border-black flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <p className="font-bold">{handle}</p>
        <p className="text-sm text-gray-600">{platform}</p>
      </div>
    </div>
    <a 
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="border-2 border-black px-4 py-1 font-bold hover:bg-black hover:text-white transition-colors"
    >
      FOLLOW
    </a>
  </div>
);
