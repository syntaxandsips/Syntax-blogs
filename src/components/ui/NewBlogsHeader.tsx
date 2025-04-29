import React from 'react';

export function NewBlogsHeader() {
  return (
    <div className="text-center mb-16 relative">
      <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#FFD166] border-4 border-black rounded-full transform rotate-12"></div>
      <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-[#FF5252] border-4 border-black transform -rotate-12"></div>
      <div className="relative">
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-[#6C63FF] text-white px-4 py-2 inline-block transform rotate-1 border-4 border-black">
            AI & ML
          </span>{' '}
          <span className="bg-[#FF5252] text-white px-4 py-2 inline-block transform -rotate-1 border-4 border-black">
            Insights
          </span>
        </h1>
        <p className="mt-6 text-xl text-center max-w-2xl mx-auto">
          Exploring the cutting edge of artificial intelligence, machine learning, and deep learning
        </p>
      </div>
    </div>
  );
}
