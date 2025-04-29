"use client";

import Link from 'next/link';
import { Youtube, Twitter, Instagram, Headphones, BookOpen, Github } from 'lucide-react';

// Recommended topics data
const topics = [
  { name: 'Artificial Intelligence', slug: '/topics/artificial-intelligence' },
  { name: 'Machine Learning', slug: '/topics/machine-learning' },
  { name: 'Neural Networks', slug: '/topics/neural-networks' },
  { name: 'Data Science', slug: '/topics/data-science' },
  { name: 'Computer Vision', slug: '/topics/computer-vision' },
  { name: 'Reinforcement Learning', slug: '/topics/reinforcement-learning' },
];

// Social media platform data
const platforms = [
  {
    id: 'youtube',
    name: 'SyntaxAndSips',
    platform: 'YouTube',
    username: '@syntaxandsips',
    link: 'https://youtube.com/@syntaxandsips',
    icon: <Youtube className="text-red-600" />,
  },
  {
    id: 'twitter',
    name: 'SyntaxAndSips',
    platform: 'X (Twitter)',
    username: '@syntaxandsips',
    link: 'https://twitter.com/syntaxandsips',
    icon: <Twitter className="text-black" />,
  },
  {
    id: 'instagram',
    name: 'SyntaxAndSips',
    platform: 'Instagram',
    username: '@syntaxandsips',
    link: 'https://instagram.com/syntaxandsips',
    icon: <Instagram className="text-pink-600" />,
  },
  {
    id: 'spotify',
    name: 'SyntaxAndSips',
    platform: 'Spotify',
    username: 'SyntaxAndSips',
    link: 'https://open.spotify.com/show/syntaxandsips',
    icon: <Headphones className="text-green-600" />,
  },
  {
    id: 'medium',
    name: 'SyntaxAndSips',
    platform: 'Medium',
    username: '@syntaxandsips',
    link: 'https://medium.com/@syntaxandsips',
    icon: <BookOpen className="text-black" />,
  },
  {
    id: 'github',
    name: 'SyntaxAndSips',
    platform: 'GitHub',
    username: '@syntaxandsips',
    link: 'https://github.com/syntaxandsips',
    icon: <Github className="text-black" />,
  },
];

export function NewSidebar() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">AI and ML Insights</h2>
        <div className="flex flex-wrap gap-3">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={topic.slug}
              className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-medium transition-colors border border-gray-200"
            >
              {topic.name}
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/topics"
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            See more topics
          </Link>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Where to follow</h2>
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-medium">{platform.name}</h3>
                  <p className="text-sm text-gray-600">{platform.platform}</p>
                </div>
              </div>
              <a
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-1 px-4 text-sm font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white hover:bg-[#fff0e6] hover:text-orange-600"
              >
                FOLLOW
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
