"use client";

import React from 'react';
import Link from 'next/link';
import {
  Brain,
  Database,
  Atom,
  Code,
  FileText,
  Star,
  Youtube,
  Gamepad2,
} from 'lucide-react';
import { homeSpotlightTopics } from '@/data/topic-catalog';

export const TopicsSection = () => {
  const icons = [
    <Brain key="brain" />,
    <Database key="database" />,
    <Atom key="atom" />,
    <Code key="code" />,
    <FileText key="file" />,
    <Star key="star" />,
    <Youtube key="youtube" />,
    <Gamepad2 key="game" />,
  ];

  const colors = ['#FF5252', '#06D6A0', '#FFD166', '#6C63FF', '#118AB2', '#FF5252', '#06D6A0', '#FFD166'];
  const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-1', '-rotate-2', 'rotate-2', '-rotate-1'];

  return (
    <section className="py-16 bg-[#118AB2] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            <span className="bg-white text-[#118AB2] px-3 py-1 inline-block transform -rotate-1">
              Explore Our Topics
            </span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto">
            Dive into our diverse range of content spanning from cutting-edge tech to casual entertainment
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {homeSpotlightTopics.map((topic, index) => (
            <TopicCard
              key={topic.slug}
              icon={icons[index % icons.length]}
              title={topic.label}
              color={colors[index % colors.length]}
              rotation={rotations[index % rotations.length]}
              href={`/topics?topic=${encodeURIComponent(topic.slug)}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface TopicCardProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  rotation: string;
  href: string;
}

const TopicCard = ({ icon, title, color, rotation, href }: TopicCardProps) => {
  return (
    <Link href={href} className="group block focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60">
      <div
        className={`bg-white text-black border-4 border-black p-4 rounded-lg transform ${rotation} transition-all group-hover:scale-105 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] group-focus:scale-105`}
      >
        <div
          className="flex flex-col items-center text-center"
          style={{
            color,
          }}
        >
          <div className="mb-3 text-3xl">{icon}</div>
          <h3 className="font-bold text-lg text-black">{title}</h3>
        </div>
      </div>
    </Link>
  );
};
