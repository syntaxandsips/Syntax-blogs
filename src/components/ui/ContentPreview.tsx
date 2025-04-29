"use client";

import React from 'react';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

export const ContentPreview = () => {
  return (
    <section className="py-16 bg-[#f0f0f0]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4 md:mb-0">
            <span className="bg-black text-white px-3 py-1 inline-block transform rotate-1">
              Latest Content
            </span>
          </h2>
          <div className="flex gap-4">
            <FilterButton isActive>All</FilterButton>
            <FilterButton>Blogs</FilterButton>
            <FilterButton>Podcasts</FilterButton>
            <FilterButton>Videos</FilterButton>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ContentCard
            title="Building a Neural Network From Scratch"
            category="Machine Learning"
            categoryColor="#FF5252"
            image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80"
            date="June 15, 2023"
            readTime="8 min read"
          />
          <ContentCard
            title="The Future of Quantum Computing Explained"
            category="Quantum Computing"
            categoryColor="#FFD166"
            image="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            date="May 28, 2023"
            readTime="12 min read"
          />
          <ContentCard
            title="React 18: What's New and Exciting"
            category="Coding"
            categoryColor="#6C63FF"
            image="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            date="June 2, 2023"
            readTime="6 min read"
          />
        </div>
        <div className="mt-10 text-center">
          <Link href="/blogs">
            <button
              type="button"
              className="group bg-black text-white px-6 py-3 text-lg font-bold rounded-md inline-flex items-center gap-2 transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)]"
            >
              View All Content
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

interface FilterButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
}

const FilterButton = ({ children, isActive }: FilterButtonProps) => {
  return (
    <button
      type="button"
      className={`px-4 py-2 font-bold rounded-md transition ${isActive ? 'bg-black text-white' : 'bg-white border-2 border-black hover:bg-black/5'}`}
    >
      {children}
    </button>
  );
};

interface ContentCardProps {
  title: string;
  category: string;
  categoryColor: string;
  image: string;
  date: string;
  readTime: string;
}

const ContentCard = ({
  title,
  category,
  categoryColor,
  image,
  date,
  readTime,
}: ContentCardProps) => {
  return (
    <article className="bg-white border-4 border-black rounded-lg overflow-hidden transform transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0)] hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div
          className="absolute top-4 left-4 px-3 py-1 text-sm font-bold text-white rounded-md"
          style={{
            backgroundColor: categoryColor,
          }}
        >
          {category}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <div className="flex items-center mr-4">
            <Calendar className="w-4 h-4 mr-1" />
            {date}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {readTime}
          </div>
        </div>
        <button
          type="button"
          className="font-bold flex items-center gap-1 text-[#6C63FF] hover:underline"
        >
          Read More <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
