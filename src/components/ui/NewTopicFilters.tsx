import React from 'react';

interface TopicFiltersProps {
  categories: { slug: string; label: string }[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function NewTopicFilters({
  categories,
  selectedCategory,
  onSelectCategory,
}: TopicFiltersProps) {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-black mb-6">
        <span className="bg-black text-white px-3 py-1 inline-block transform rotate-1">
          Filter by Topic
        </span>
      </h3>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 font-bold rounded-md border-4 border-black transition-all hover:-translate-y-1 ${
            selectedCategory === null
              ? 'bg-[#6C63FF] text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]'
              : 'bg-white hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)]'
          }`}
        >
          All
        </button>
        {categories.map((category) => {
          const isActive = selectedCategory === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => onSelectCategory(category.slug)}
              className={`px-4 py-2 font-bold rounded-md border-4 border-black transition-all hover:-translate-y-1 ${
                isActive
                  ? 'bg-[#6C63FF] text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]'
                  : 'bg-white hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)]'
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
