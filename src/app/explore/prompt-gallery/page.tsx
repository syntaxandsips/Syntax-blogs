import { Metadata } from 'next'
import { Suspense } from 'react'
import { getPrompts, getPromptFilters, getActiveModels } from '@/lib/prompt-gallery/queries'
import { parsePromptFilters } from '@/lib/prompt-gallery/search'
import { PromptGalleryClient } from '@/components/prompt-gallery/PromptGalleryClient'
import { PageShell } from '@/components/ui/PageLayout'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import Marquee from '@/components/ui/marquee'

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

  const [promptList, metadata, models] = await Promise.all([
    getPrompts(filters, page, PAGE_SIZE),
    getPromptFilters(),
    getActiveModels(),
  ])

  const breadcrumbs = [
    { label: 'Explore', href: '/explore' },
    { label: 'Prompt Gallery' },
  ]

  const trendingItems = metadata.tags
    .filter((tag) => tag.count > 0)
    .slice(0, 12)
    .map((tag) => `#${tag.label}`)

  return (
    <PageShell
      backgroundClassName="bg-gradient-to-br from-[#F7F3FF] via-[#FFF8EC] to-[#E8FBFF]"
      hero={
        <section className="border-b-4 border-black bg-[#F8F5FF] py-12">
          <div className="container mx-auto space-y-8 px-4">
            <Breadcrumbs items={breadcrumbs} />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#0B0B0F] px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
                  Community prompts
                </span>
                <h1 className="text-4xl font-black text-black sm:text-5xl">
                  Remix-worthy prompts for every creative sprint
                </h1>
                <p className="max-w-2xl text-base font-semibold text-black/70">
                  Discover curated prompt recipes, detailed parameters, and media showcases from the Syntax &amp; Sips crew.
                  Filter by model, style, or outcome to jumpstart your next experiment in minutes.
                </p>
              </div>
              {trendingItems.length ? (
                <div className="rounded-3xl border-4 border-black bg-white/85 p-6 shadow-[10px_10px_0_rgba(0,0,0,0.12)]">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-black/60">Trending tags right now</p>
                  <Marquee items={trendingItems} className="mt-3" />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      }
    >
      <Suspense
        fallback={
          <div className="rounded-3xl border-4 border-black bg-white/95 p-10 text-center shadow-[12px_12px_0_rgba(0,0,0,0.12)]">
            Loading prompt gallery…
          </div>
        }
      >
        <PromptGalleryClient
          prompts={promptList.prompts}
          metadata={metadata}
          total={promptList.total}
          page={promptList.page}
          pageSize={promptList.pageSize}
          initialFilters={filters}
          models={models}
        />
      </Suspense>
    </PageShell>
  )
}

