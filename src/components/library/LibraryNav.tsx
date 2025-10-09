'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Library, ListChecks, BookmarkPlus, Highlighter, History, MessageCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LibraryNavProps {
  profileName: string
}

const links = [
  { href: '/me', label: 'Overview', icon: Library },
  { href: '/me/lists', label: 'Your Lists', icon: ListChecks },
  { href: '/me/saved-lists', label: 'Saved Lists', icon: BookmarkPlus },
  { href: '/me/highlights', label: 'Highlights', icon: Highlighter },
  { href: '/me/history', label: 'Reading History', icon: History },
  { href: '/me/responses', label: 'Responses', icon: MessageCircle },
  { href: '/me/accounts', label: 'Account', icon: Settings },
]

export function LibraryNav({ profileName }: LibraryNavProps) {
  const pathname = usePathname()

  return (
    <aside className="w-full max-w-xs rounded-[32px] border-4 border-black bg-[#FF69B4] p-6 text-black shadow-[16px_16px_0px_0px_rgba(0,0,0,0.2)]">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-black/70">Welcome back</p>
        <h2 className="text-2xl font-black leading-tight">{profileName}</h2>
      </div>
      <nav aria-label="Library navigation" className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-[24px] border-4 border-black bg-white px-4 py-3 text-lg font-bold transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50',
                isActive ? 'bg-[#87CEEB]' : 'bg-white',
              )}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
