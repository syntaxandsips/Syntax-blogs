import React from 'react';

export function NewBlogsHeader() {
  return (
    <div className="relative mb-12 overflow-hidden rounded-3xl border-4 border-black bg-white px-6 py-10 text-left shadow-[10px_10px_0px_rgba(0,0,0,0.12)]">
      <div className="pointer-events-none absolute -left-10 top-6 hidden h-24 w-24 rotate-6 rounded-full border-4 border-black bg-[#FFD166] md:block" />
      <div className="pointer-events-none absolute -right-12 -bottom-8 hidden h-28 w-28 -rotate-12 border-4 border-black bg-[#6C63FF] md:block" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="inline-flex items-center rounded-full border-2 border-black bg-[#FFD166] px-3 py-1 text-xs font-black uppercase tracking-[0.3em] text-black shadow-[4px_4px_0px_rgba(0,0,0,0.12)]">
            Explore syntax &amp; sips
          </p>
          <h1 className="text-4xl font-black leading-tight text-gray-900 sm:text-5xl">
            Discover stories, tutorials, and community updates from the Syntax &amp; Sips collective.
          </h1>
          <p className="text-lg font-medium text-gray-700">
            Browse the entire library, search by topic, or filter by interests to find your next read without the clutter.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm font-bold uppercase tracking-wide text-gray-700">
          <span className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-[#FF5252] px-4 py-3 text-white shadow-[6px_6px_0px_rgba(0,0,0,0.16)]">
            Fresh posts weekly
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-[#06D6A0] px-4 py-3 text-black shadow-[6px_6px_0px_rgba(0,0,0,0.16)]">
            Curated by our editors
          </span>
        </div>
      </div>
    </div>
  );
}
