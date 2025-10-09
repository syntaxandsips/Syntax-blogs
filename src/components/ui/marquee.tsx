"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps {
  items: string[]
  className?: string
}

export default function Marquee({ items, className }: MarqueeProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full border-2 border-black bg-white text-xs font-black uppercase tracking-[0.25em]",
        className,
      )}
    >
      <div className="flex items-center gap-10 whitespace-nowrap py-2 pl-6 will-change-transform" style={{ animation: "var(--animate-marquee)" }}>
        {items.map((item, index) => (
          <span key={`marquee-${item}-${index}`} className="flex items-center gap-2 text-black/70">
            <span className="h-2 w-2 rounded-full bg-[#6C63FF]" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent" aria-hidden="true" />
      <div className="absolute top-0 flex items-center gap-10 whitespace-nowrap py-2 pl-6 will-change-transform" style={{ animation: "var(--animate-marquee2)" }}>
        {items.map((item, index) => (
          <span key={`marquee-shadow-${item}-${index}`} className="flex items-center gap-2 text-black/70">
            <span className="h-2 w-2 rounded-full bg-[#FFCA3A]" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
