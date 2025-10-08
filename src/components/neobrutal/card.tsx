import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'primary' | 'success' | 'warning'
type Elevation = 'flat' | 'raised'
type Rotation = 'none' | 'left' | 'right'

export interface NeobrutalCardProps extends HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements
  tone?: Tone
  elevation?: Elevation
  rotate?: Rotation
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-white text-black',
  primary: 'bg-[#6C63FF] text-white',
  success: 'bg-[#06D6A0] text-black',
  warning: 'bg-[#FFD166] text-black',
}

const elevationClasses: Record<Elevation, string> = {
  flat: 'shadow-none',
  raised:
    'shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.18)]',
}

const rotationClasses: Record<Rotation, string> = {
  none: '',
  left: '-rotate-1',
  right: 'rotate-1',
}

export const NeobrutalCard = forwardRef<HTMLElement, NeobrutalCardProps>(
  (
    {
      as: Component = 'div',
      tone = 'neutral',
      elevation = 'raised',
      rotate = 'none',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref as never}
        className={cn(
          'relative border-4 border-black rounded-2xl p-6 transform',
          toneClasses[tone],
          elevationClasses[elevation],
          rotationClasses[rotate],
          className,
        )}
        {...rest}
      >
        {children}
      </Component>
    )
  },
)

NeobrutalCard.displayName = 'NeobrutalCard'
