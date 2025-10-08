import React from 'react';

import { NeobrutalTogglePill } from '@/components/neobrutal/toggle-pill';

interface TopicFiltersProps {
  categories: { slug: string; label: string }[];
  selectedCategories: string[];
  onToggleCategory: (categorySlug: string) => void;
  onReset: () => void;
}

export function NewTopicFilters({
  categories,
  selectedCategories,
  onToggleCategory,
  onReset,
}: TopicFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black mb-6">
        <span className="bg-black text-white px-3 py-1 inline-block transform rotate-1">
          Filter by Topic
        </span>
      </h3>
      <div className="flex flex-wrap gap-3">
        <NeobrutalTogglePill
          onClick={onReset}
          selected={selectedCategories.length === 0}
          rotation="left"
        >
          All
        </NeobrutalTogglePill>
        {categories.map((category, index) => {
          const isActive = selectedCategories.includes(category.slug);
          const rotation = index % 2 === 0 ? 'none' : 'right';

          return (
            <NeobrutalTogglePill
              key={category.slug}
              onClick={() => onToggleCategory(category.slug)}
              selected={isActive}
              rotation={rotation}
            >
              {category.label}
            </NeobrutalTogglePill>
          );
        })}
      </div>
    </div>
  );
}
