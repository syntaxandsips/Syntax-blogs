'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { UploadCloud } from 'lucide-react'
import { PromptSummary, PromptFilterMetadata, PromptFilters, PromptModel } from '@/lib/prompt-gallery/types'
import { serializePromptFilters } from '@/lib/prompt-gallery/search'
import { PromptFiltersSidebar } from './PromptFiltersSidebar'
import { PromptSortBar } from './PromptSortBar'
import { PromptCard } from './PromptCard'
import { PromptPagination } from './PromptPagination'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PromptUploadWizard } from './PromptUploadWizard'
import { toast } from 'sonner'

interface PromptGalleryClientProps {
  prompts: PromptSummary[]
  metadata: PromptFilterMetadata
  total: number
  page: number
  pageSize: number
  initialFilters: PromptFilters
  models: PromptModel[]
}

export function PromptGalleryClient({
  prompts,
  metadata,
  total,
  page,
  pageSize,
  initialFilters,
  models,
}: PromptGalleryClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [filters, setFilters] = useState<PromptFilters>(initialFilters)
  const [searchTerm, setSearchTerm] = useState(initialFilters.query ?? '')
  const [isFiltersOpen, setFiltersOpen] = useState(false)
  const [isUploadOpen, setUploadOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setFilters(initialFilters)
    setSearchTerm(initialFilters.query ?? '')
  }, [initialFilters])

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
      toast.success('Prompt copied to clipboard!')
    } catch (error) {
      console.error('Unable to copy prompt', error)
      toast.error('Unable to copy prompt. Try again.')
    }
  }

  const handleBookmark = (prompt: PromptSummary) => {
    console.info('Bookmark prompt', prompt.id)
    toast.info('Prompt saved to your reading list (coming soon).')
  }

  const hasResults = prompts.length > 0

  const mobileFilters = (
    <Dialog open={isFiltersOpen} onOpenChange={setFiltersOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-[#FFCA3A] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 lg:hidden"
        >
          Filters
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-black text-[0.7rem] font-black">
            {metadata.mediaTypes.length + metadata.models.length}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-black">Filter prompts</DialogTitle>
        </DialogHeader>
        <PromptFiltersSidebar
          metadata={metadata}
          filters={filters}
          onChange={(next) => updateFilters(next, 1)}
          onClose={() => setFiltersOpen(false)}
          mobile
        />
      </DialogContent>
    </Dialog>
  )

  const uploadDialog = (
    <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-[#6C63FF] px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-white shadow-[5px_5px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5"
        >
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          Upload prompt
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl gap-0 p-0">
        <DialogHeader className="space-y-2 border-b-2 border-dashed border-black/10 bg-white/70 px-6 py-4 sm:px-8">
          <DialogTitle className="text-2xl font-black text-black">Share your go-to prompt</DialogTitle>
          <DialogDescription className="text-sm font-medium uppercase tracking-[0.2em] text-black/60">
            Document parameters, models, and media so the community can remix with confidence.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto px-4 pb-6 pt-4 sm:px-8 sm:pb-8">
          <PromptUploadWizard models={models} />
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PromptSortBar
          filters={filters}
          onSortChange={(sort) => handleSortChange(sort)}
          onSearchChange={(value) => setSearchTerm(value)}
          searchValue={searchTerm}
          mobileFiltersTrigger={mobileFilters}
        />
        {uploadDialog}
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

    </div>
  )
}

