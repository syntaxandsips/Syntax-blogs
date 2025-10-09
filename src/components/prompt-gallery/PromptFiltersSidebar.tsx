'use client'

import { useMemo } from 'react'
import { X } from 'lucide-react'
import { PromptFilterMetadata, PromptFilters } from '@/lib/prompt-gallery/types'
import { cn } from '@/lib/utils'

interface PromptFiltersSidebarProps {
  metadata: PromptFilterMetadata
  filters: PromptFilters
  onChange: (filters: PromptFilters) => void
  onClose?: () => void
  mobile?: boolean
}

const sectionTitleClasses = 'text-xs font-black uppercase tracking-[0.2em] text-black/70'

const toggleArrayValue = <T extends string>(current: T[] | undefined, value: T): T[] => {
  const next = new Set(current ?? [])
  if (next.has(value)) {
    next.delete(value)
  } else {
    next.add(value)
  }
  return Array.from(next)
}

export function PromptFiltersSidebar({ metadata, filters, onChange, onClose, mobile = false }: PromptFiltersSidebarProps) {
  const hasActiveFilters = useMemo(() => {
    return (
      (filters.mediaTypes?.length ?? 0) > 0 ||
      (filters.modelIds?.length ?? 0) > 0 ||
      (filters.monetization?.length ?? 0) > 0 ||
      (filters.difficulties?.length ?? 0) > 0 ||
      (filters.languages?.length ?? 0) > 0 ||
      (filters.tags?.length ?? 0) > 0 ||
      (filters.visibility?.length ?? 0) > 0 ||
      !!filters.query
    )
  }, [filters])

  return (
    <aside
      className={cn(
        'flex w-full flex-col gap-6 rounded-3xl border-4 border-black bg-[#F9F7FF] p-6 shadow-[8px_8px_0_rgba(0,0,0,0.1)]',
        mobile ? 'max-w-full' : 'lg:sticky lg:top-24 lg:max-w-xs',
      )}
      aria-label="Prompt gallery filters"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-black/60">Filters</p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  mediaTypes: [],
                  modelIds: [],
                  monetization: [],
                  difficulties: [],
                  languages: [],
                  tags: [],
                  visibility: [],
                  query: undefined,
                })
              }
              className="text-xs font-semibold uppercase text-[#6C63FF] hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </div>
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="space-y-5">
        <section>
          <h3 className={sectionTitleClasses}>Model families</h3>
          <ul className="mt-3 space-y-2">
            {metadata.models.map((model) => {
              const isActive = filters.modelIds?.includes(model.value)
              return (
                <li key={model.value}>
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, modelIds: toggleArrayValue(filters.modelIds, model.value) })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-2xl border-2 border-black bg-white px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-[#FFCA3A]/50',
                      isActive && 'bg-[#FFCA3A] shadow-[4px_4px_0_rgba(0,0,0,0.25)]',
                    )}
                  >
                    <span>{model.label}</span>
                    <span className="text-xs uppercase text-black/60">{model.count}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section>
          <h3 className={sectionTitleClasses}>Media types</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {metadata.mediaTypes.map((media) => {
              const isActive = filters.mediaTypes?.includes(media.value)
              return (
                <button
                  type="button"
                  key={media.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      mediaTypes: toggleArrayValue(filters.mediaTypes, media.value),
                    })
                  }
                  className={cn(
                    'rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase transition-colors hover:bg-[#FFD6FF]',
                    isActive && 'bg-[#FFD6FF] shadow-[3px_3px_0_rgba(0,0,0,0.25)]',
                  )}
                >
                  {media.label} ({media.count})
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className={sectionTitleClasses}>Monetization</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {metadata.monetization.map((option) => {
              const isActive = filters.monetization?.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      monetization: toggleArrayValue(filters.monetization, option.value),
                    })
                  }
                  className={cn(
                    'rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase transition-colors hover:bg-[#A0C4FF]',
                    isActive && 'bg-[#A0C4FF] shadow-[3px_3px_0_rgba(0,0,0,0.25)]',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className={sectionTitleClasses}>Difficulty</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {metadata.difficulties.map((difficulty) => {
              const isActive = filters.difficulties?.includes(difficulty.value)
              return (
                <button
                  key={difficulty.value}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      difficulties: toggleArrayValue(filters.difficulties, difficulty.value),
                    })
                  }
                  className={cn(
                    'rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase transition-colors hover:bg-[#FFADAD]',
                    isActive && 'bg-[#FFADAD] shadow-[3px_3px_0_rgba(0,0,0,0.25)]',
                  )}
                >
                  {difficulty.label}
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className={sectionTitleClasses}>Languages</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {metadata.languages.map((language) => {
              const isActive = filters.languages?.includes(language.value)
              return (
                <button
                  key={language.value}
                  type="button"
                  onClick={() => onChange({ ...filters, languages: toggleArrayValue(filters.languages, language.value) })}
                  className={cn(
                    'rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase transition-colors hover:bg-[#B9FBC0]',
                    isActive && 'bg-[#B9FBC0] shadow-[3px_3px_0_rgba(0,0,0,0.25)]',
                  )}
                >
                  {language.label}
                </button>
              )
            })}
          </div>
        </section>

        {metadata.tags.length ? (
          <section>
            <h3 className={sectionTitleClasses}>Popular tags</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {metadata.tags.map((tag) => {
                const isActive = filters.tags?.includes(tag.value)
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => onChange({ ...filters, tags: toggleArrayValue(filters.tags, tag.value) })}
                    className={cn(
                      'rounded-full border border-dashed border-black/40 px-3 py-1 text-xs font-semibold uppercase text-black/70 transition-colors hover:border-black hover:bg-white',
                      isActive && 'border-black bg-white shadow-[3px_3px_0_rgba(0,0,0,0.2)]',
                    )}
                  >
                    #{tag.label}
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  )
}

