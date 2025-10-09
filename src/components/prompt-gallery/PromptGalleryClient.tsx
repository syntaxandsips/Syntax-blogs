'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PromptSummary, PromptFilterMetadata, PromptFilters } from '@/lib/prompt-gallery/types'
import { serializePromptFilters } from '@/lib/prompt-gallery/search'
import { PromptFiltersSidebar } from './PromptFiltersSidebar'
import { PromptSortBar } from './PromptSortBar'
import { PromptCard } from './PromptCard'
import { PromptPagination } from './PromptPagination'

interface PromptGalleryClientProps {
  prompts: PromptSummary[]
  metadata: PromptFilterMetadata
  total: number
  page: number
  pageSize: number
  initialFilters: PromptFilters
}

export function PromptGalleryClient({ prompts, metadata, total, page, pageSize, initialFilters }: PromptGalleryClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [filters, setFilters] = useState<PromptFilters>(initialFilters)
  const [searchTerm, setSearchTerm] = useState(initialFilters.query ?? '')
  const [isFiltersOpen, setFiltersOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setFilters(initialFilters)
    setSearchTerm(initialFilters.query ?? '')
  }, [initialFilters])

  useEffect(() => {
    if (!statusMessage) return
    const timeout = window.setTimeout(() => setStatusMessage(null), 2500)
    return () => window.clearTimeout(timeout)
  }, [statusMessage])

  useEffect(() => {
    if ((filters.query ?? '') === (searchTerm ?? '')) {
      return undefined
    }

    const handler = window.setTimeout(() => {
      updateFilters({ ...filters, query: searchTerm || undefined }, 1)
    }, 400)

    return () => window.clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  const updateFilters = (nextFilters: PromptFilters, nextPage = 1) => {
    setFilters(nextFilters)
    const params = serializePromptFilters(nextFilters, nextPage)
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const handleSortChange = (sort: PromptFilters['sort']) => {
    updateFilters({ ...filters, sort }, 1)
  }

  const handleCopy = async (prompt: PromptSummary) => {
    try {
      await navigator.clipboard.writeText(prompt.preview)
      setStatusMessage('Prompt copied to clipboard!')
    } catch (error) {
      console.error('Unable to copy prompt', error)
      setStatusMessage('Unable to copy prompt. Try again.')
    }
  }

  const handleBookmark = (prompt: PromptSummary) => {
    console.info('Bookmark prompt', prompt.id)
    setStatusMessage('Prompt saved to your reading list (coming soon).')
  }

  const hasResults = prompts.length > 0

  return (
    <div className="flex flex-col gap-6">
      {statusMessage ? (
        <div className="rounded-3xl border-4 border-black bg-[#B9FBC0] px-6 py-3 text-sm font-semibold text-black shadow-[6px_6px_0_rgba(0,0,0,0.15)]">
          {statusMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PromptSortBar
          filters={filters}
          onSortChange={(sort) => handleSortChange(sort)}
          onSearchChange={(value) => setSearchTerm(value)}
          searchValue={searchTerm}
          onOpenFilters={() => setFiltersOpen(true)}
        />
        <Link
          href="/resources/prompt-gallery/upload"
          className="inline-flex items-center justify-center rounded-2xl border-2 border-black bg-[#6C63FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
        >
          Upload prompt
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="hidden lg:block">
          <PromptFiltersSidebar metadata={metadata} filters={filters} onChange={(next) => updateFilters(next, 1)} />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-[0.3em] text-black/70">
              {total} prompts • Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
            </h2>
            {isPending ? <span className="text-xs font-semibold uppercase text-[#6C63FF]">Refreshing…</span> : null}
          </div>
          {hasResults ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} onCopy={handleCopy} onBookmark={handleBookmark} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-4 border-dashed border-black/40 bg-white p-10 text-center shadow-[8px_8px_0_rgba(0,0,0,0.08)]">
              <p className="text-lg font-black text-black">No prompts match your filters yet.</p>
              <p className="mt-2 text-sm text-black/70">Try removing a filter or explore a different media type.</p>
            </div>
          )}

          <PromptPagination filters={filters} page={page} pageSize={pageSize} total={total} />
        </div>
      </div>

      {isFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur">
          <div className="mx-auto max-w-lg">
            <PromptFiltersSidebar
              metadata={metadata}
              filters={filters}
              onChange={(next) => updateFilters(next, 1)}
              onClose={() => setFiltersOpen(false)}
              mobile
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

