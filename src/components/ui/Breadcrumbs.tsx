import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-600">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition hover:text-[#6C63FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-400">{item.label}</span>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
