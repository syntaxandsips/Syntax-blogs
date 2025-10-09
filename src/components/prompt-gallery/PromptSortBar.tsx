'use client'

import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { PromptFilters, PromptSortOption } from '@/lib/prompt-gallery/types'
import { cn } from '@/lib/utils'

interface PromptSortBarProps {
  filters: PromptFilters
  onSortChange: (sort: PromptSortOption) => void
  onSearchChange: (value: string) => void
  searchValue?: string
  onOpenFilters?: () => void
}

const sortOptions: Array<{ label: string; value: PromptSortOption }> = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Newest', value: 'newest' },
  { label: 'Top rated', value: 'top-rated' },
  { label: 'Most downloaded', value: 'most-downloaded' },
  { label: 'Most copied', value: 'most-copied' },
  { label: 'Most commented', value: 'most-commented' },
  { label: 'Featured', value: 'featured' },
]

export function PromptSortBar({ filters, onSortChange, onSearchChange, searchValue, onOpenFilters }: PromptSortBarProps) {
  const activeSort = filters.sort ?? 'relevance'

  const selectedLabel = useMemo(
    () => sortOptions.find((option) => option.value === activeSort)?.label ?? 'Relevance',
    [activeSort],
  )

  return (
    <div className="flex flex-col gap-4 rounded-3xl border-4 border-black bg-white p-4 shadow-[6px_6px_0_rgba(0,0,0,0.12)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <input
          type="search"
          defaultValue={searchValue}
          placeholder="Search prompts, tags, creators..."
          className="w-full rounded-2xl border-2 border-black bg-[#F5F3FF] px-4 py-3 text-sm font-semibold text-black shadow-[3px_3px_0_rgba(0,0,0,0.12)] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/40 lg:max-w-sm"
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <button
          type="button"
          onClick={() => onSortChange(activeSort)}
          className="hidden rounded-2xl border-2 border-black bg-[#6C63FF] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 lg:inline-flex lg:items-center lg:gap-2"
          aria-label="Current sort"
        >
          {selectedLabel}
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
        {onOpenFilters ? (
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-[#FFCA3A] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 lg:hidden"
          >
            Filters
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSortChange(option.value)}
            className={cn(
              'rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase transition-colors hover:bg-[#FFEE88]',
              option.value === activeSort && 'bg-[#FFEE88] shadow-[3px_3px_0_rgba(0,0,0,0.2)]',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

