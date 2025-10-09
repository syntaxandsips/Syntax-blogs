'use client'

import { useMemo } from 'react'
import { PromptFilters } from '@/lib/prompt-gallery/types'
import { serializePromptFilters } from '@/lib/prompt-gallery/search'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PromptPaginationProps {
  filters: PromptFilters
  page: number
  pageSize: number
  total: number
}

export function PromptPagination({ filters, page, pageSize, total }: PromptPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pages = useMemo(() => {
    const items: number[] = []
    for (let index = 1; index <= totalPages; index += 1) {
      if (index === 1 || index === totalPages || Math.abs(index - page) <= 2) {
        items.push(index)
      }
    }
    return Array.from(new Set(items)).sort((a, b) => a - b)
  }, [page, totalPages])

  if (totalPages <= 1) {
    return null
  }

  const goToPage = (nextPage: number) => {
    const params = serializePromptFilters(filters, nextPage)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => goToPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className={cn(
          'rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase text-black shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40',
          page === 1 && 'hover:translate-y-0',
        )}
      >
        Prev
      </button>
      {pages.map((item, index) => {
        const previous = pages[index - 1]
        const showEllipsis = previous && item - previous > 1
        return (
          <div key={item} className="flex items-center gap-2">
            {showEllipsis ? <span className="text-sm font-semibold text-black/60">…</span> : null}
            <button
              type="button"
              onClick={() => goToPage(item)}
              aria-current={page === item ? 'page' : undefined}
              className={cn(
                'rounded-full border-2 border-black px-3 py-1 text-xs font-semibold uppercase transition-all hover:-translate-y-0.5',
                page === item
                  ? 'bg-[#6C63FF] text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)]'
                  : 'bg-white text-black shadow-[3px_3px_0_rgba(0,0,0,0.15)]',
              )}
            >
              {item}
            </button>
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => goToPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={cn(
          'rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase text-black shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40',
          page === totalPages && 'hover:translate-y-0',
        )}
      >
        Next
      </button>
    </nav>
  )
}

