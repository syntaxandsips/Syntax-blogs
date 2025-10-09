'use client'

import { useMemo } from 'react'
import { PromptFilters } from '@/lib/prompt-gallery/types'
import { serializePromptFilters } from '@/lib/prompt-gallery/search'
import { useRouter, usePathname } from 'next/navigation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={cn(page === 1 && 'pointer-events-none opacity-40')}
            onClick={(event) => {
              event.preventDefault()
              if (page > 1) {
                goToPage(Math.max(1, page - 1))
              }
            }}
          />
        </PaginationItem>
        {pages.map((item, index) => {
          const previous = pages[index - 1]
          const showEllipsis = previous && item - previous > 1
          return (
            <PaginationItem key={item}>
              {showEllipsis ? <PaginationEllipsis /> : null}
              <PaginationLink
                href="#"
                isActive={page === item}
                onClick={(event) => {
                  event.preventDefault()
                  goToPage(item)
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === totalPages}
            className={cn(page === totalPages && 'pointer-events-none opacity-40')}
            onClick={(event) => {
              event.preventDefault()
              if (page < totalPages) {
                goToPage(Math.min(totalPages, page + 1))
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

