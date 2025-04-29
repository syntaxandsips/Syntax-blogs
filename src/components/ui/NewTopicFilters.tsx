import React from 'react';

interface TopicFiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function NewTopicFilters({
  selectedCategory,
  onSelectCategory,
}: TopicFiltersProps) {
  const categories = [
    {
      id: 'all',
      name: 'All',
    },
    {
      id: 'MACHINE_LEARNING',
      name: 'Machine Learning',
    },
    {
      id: 'REINFORCEMENT_LEARNING',
      name: 'Reinforcement Learning',
    },
    {
      id: 'DATA_SCIENCE',
      name: 'Data Science',
    },
    {
      id: 'QUANTUM_COMPUTING',
      name: 'Quantum Computing',
    },
    {
      id: 'CODING',
      name: 'Coding',
    },
    {
      id: 'AI_ETHICS',
      name: 'AI Ethics',
    },
    {
      id: 'ARTIFICIAL_INTELLIGENCE',
      name: 'Artificial Intelligence',
    },
    {
      id: 'DEEP_LEARNING',
      name: 'Deep Learning',
    },
  ];

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-black mb-6">
        <span className="bg-black text-white px-3 py-1 inline-block transform rotate-1">
          Filter by Topic
        </span>
      </h3>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() =>
              onSelectCategory(category.id === 'all' ? null : category.id)
            }
            className={`px-4 py-2 font-bold rounded-md border-4 border-black transition-all hover:-translate-y-1 ${
              (category.id === 'all' && selectedCategory === null) || 
              category.id === selectedCategory
                ? 'bg-[#6C63FF] text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]'
                : 'bg-white hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)]'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
