"use client";

import React from 'react';
import { FileText, NotebookPen, Rocket, Users } from 'lucide-react';

const topicCards = [
  {
    icon: NotebookPen,
    title: 'Build notes',
    description: 'Short updates about what we shipped, what broke, and what we are learning.',
  },
  {
    icon: FileText,
    title: 'Living documentation',
    description: 'Drafts of our internal docs become public references as soon as they are useful.',
  },
  {
    icon: Rocket,
    title: 'Release recaps',
    description: 'Track the changelog and roadmap decisions that shape the Syntax & Sips platform.',
  },
  {
    icon: Users,
    title: 'Community feedback',
    description: 'Requests, questions, and experiments shared by readers influence what we build next.',
  },
];

export const TopicsSection = () => {
  return (
    <section className="py-16 bg-[#118AB2] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            <span className="bg-white text-[#118AB2] px-3 py-1 inline-block transform -rotate-1">
              Follow the work
            </span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto">
            Everything we publish ties back to building Syntax &amp; Sips in public. These are the themes you will see the most.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {topicCards.map((card, index) => (
            <TopicCard
              key={card.title}
              icon={<card.icon className="h-7 w-7" aria-hidden="true" />}
              title={card.title}
              description={card.description}
              color={['#FF5252', '#06D6A0', '#FFD166', '#6C63FF'][index % 4]}
              rotation={index % 2 === 0 ? '-rotate-2' : 'rotate-1'}
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
  description: string;
  color: string;
  rotation: string;
}

const TopicCard = ({ icon, title, description, color, rotation }: TopicCardProps) => {
  return (
    <div
      className={`bg-white text-black border-4 border-black p-6 rounded-xl transform ${rotation} transition-all hover:scale-105 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]`}
    >
      <div className="flex flex-col items-start gap-3 text-left" style={{ color }}>
        <div className="text-3xl">{icon}</div>
        <h3 className="font-bold text-lg text-black">{title}</h3>
        <p className="text-sm text-black/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
