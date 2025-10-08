import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type Rotation = 'none' | 'left' | 'right'

export interface NeobrutalTogglePillProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  rotation?: Rotation
}

const rotationClasses: Record<Rotation, string> = {
  none: '',
  left: '-rotate-1',
  right: 'rotate-1',
}

export const NeobrutalTogglePill = forwardRef<
  HTMLButtonElement,
  NeobrutalTogglePillProps
>(({ selected = false, rotation = 'none', className, children, ...rest }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'rounded-md border-4 border-black px-4 py-2 font-bold transition-all duration-200',
        'transform hover:-translate-y-1',
        selected
          ? 'bg-[#6C63FF] text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]'
          : 'bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(108,99,255,0.35)]',
        rotationClasses[rotation],
        className,
      )}
      aria-pressed={selected}
      {...rest}
    >
      {children}
    </button>
  )
})

NeobrutalTogglePill.displayName = 'NeobrutalTogglePill'
