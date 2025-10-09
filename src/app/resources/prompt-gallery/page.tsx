import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getPrompts, getPromptFilters } from '@/lib/prompt-gallery/queries'
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

  const [promptList, metadata] = await Promise.all([
    getPrompts(filters, page, PAGE_SIZE),
    getPromptFilters(),
  ])

  const breadcrumbs = [
    { label: 'Resources', href: '/resources' },
    { label: 'Prompt Gallery' },
  ]

  const trendingItems = metadata.tags
    .filter((tag) => tag.count > 0)
    .slice(0, 12)
    .map((tag) => `#${tag.label}`)

  return (
    <PageShell
      hero={
        <section className="border-b-4 border-black bg-[#f0f0f0] py-10">
          <div className="container mx-auto flex flex-col gap-6 px-4">
            <Breadcrumbs items={breadcrumbs} />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-black">Prompt Gallery</h1>
                {trendingItems.length ? (
                  <Marquee items={trendingItems} className="max-w-xl" />
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/docs/prompt-gallery"
                  className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5"
                >
                  Read the gallery guide
                </Link>
                <Link
                  href="/resources/prompt-gallery/upload"
                  className="inline-flex items-center justify-center rounded-full border-2 border-black bg-[#6C63FF] px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5"
                >
                  Upload prompt
                </Link>
              </div>
            </div>
          </div>
        </section>
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

