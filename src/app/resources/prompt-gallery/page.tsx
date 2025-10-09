import { Metadata } from 'next'
import { Suspense } from 'react'
import { getPrompts, getPromptFilters } from '@/lib/prompt-gallery/queries'
import { parsePromptFilters } from '@/lib/prompt-gallery/search'
import { PromptGalleryClient } from '@/components/prompt-gallery/PromptGalleryClient'
import { PageShell, PageHero } from '@/components/ui/PageLayout'

export const metadata: Metadata = {
  title: 'Prompt Gallery | Syntax & Sips',
  description:
    'Discover AI prompts curated by the Syntax & Sips community. Filter by media type, model, monetization, and difficulty to find the perfect inspiration.',
}

interface PromptGalleryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const PAGE_SIZE = 12

export default async function PromptGalleryPage({ searchParams }: PromptGalleryPageProps) {
  const params = await searchParams
  const filters = parsePromptFilters(params)
  const page = typeof params.page === 'string' ? Math.max(1, Number.parseInt(params.page, 10) || 1) : 1

  const [promptList, metadata] = await Promise.all([
    getPrompts(filters, page, PAGE_SIZE),
    getPromptFilters(),
  ])

  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Prompt Gallery"
          title="Share, remix, and discover world-class prompts"
          description="Browse prompts across Midjourney, GPT-4o, Claude, Stable Diffusion, and more. Filter by media type, monetization, and difficulty to find exactly what you need."
        />
      }
    >
      <Suspense fallback={<div className="rounded-3xl border-4 border-black bg-white p-10 text-center">Loading prompt gallery…</div>}>
        <PromptGalleryClient
          prompts={promptList.prompts}
          metadata={metadata}
          total={promptList.total}
          page={promptList.page}
          pageSize={promptList.pageSize}
          initialFilters={filters}
        />
      </Suspense>
    </PageShell>
  )
}

