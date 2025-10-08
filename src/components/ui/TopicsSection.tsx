"use client";

import React from 'react';
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

export const TopicsSection = () => {
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
            Dive into our diverse range of content spanning from cutting-edge
            tech to casual entertainment
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <TopicCard
            icon={<Brain />}
            title="Machine Learning"
            color="#FF5252"
            rotation="-rotate-2"
          />
          <TopicCard
            icon={<Database />}
            title="Data Science"
            color="#06D6A0"
            rotation="rotate-1"
          />
          <TopicCard
            icon={<Atom />}
            title="Quantum Computing"
            color="#FFD166"
            rotation="-rotate-1"
          />
          <TopicCard
            icon={<Code />}
            title="Coding Tutorials"
            color="#6C63FF"
            rotation="rotate-2"
          />
          <TopicCard
            icon={<FileText />}
            title="Tech Articles"
            color="#118AB2"
            rotation="rotate-1"
          />
          <TopicCard
            icon={<Star />}
            title="Reviews"
            color="#FF5252"
            rotation="-rotate-2"
          />
          <TopicCard
            icon={<Youtube />}
            title="Video Content"
            color="#06D6A0"
            rotation="rotate-2"
          />
          <TopicCard
            icon={<Gamepad2 />}
            title="Gaming"
            color="#FFD166"
            rotation="-rotate-1"
          />
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
}

const TopicCard = ({ icon, title, color, rotation }: TopicCardProps) => {
  return (
    <div
      className={`bg-white text-black border-4 border-black p-4 rounded-lg transform ${rotation} transition-all hover:scale-105 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] cursor-pointer`}
    >
      <div
        className="flex flex-col items-center text-center"
        style={{
          color: color,
        }}
      >
        <div className="mb-3 text-3xl">{icon}</div>
        <h3 className="font-bold text-lg text-black">{title}</h3>
      </div>
    </div>
  );
};
