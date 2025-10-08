import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export interface NeobrutalToggleSwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  onLabel?: string
  offLabel?: string
}

export const NeobrutalToggleSwitch = forwardRef<
  HTMLButtonElement,
  NeobrutalToggleSwitchProps
>(
  (
    { checked, onCheckedChange, label, onLabel = 'On', offLabel = 'Off', className, ...rest },
    ref,
  ) => {
    const handleClick = () => {
      onCheckedChange?.(!checked)
    }

    return (
      <div className={cn('flex items-center gap-3', className)}>
        {label ? (
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            {label}
          </span>
        ) : null}
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={handleClick}
          className={cn(
            'relative flex h-9 w-20 items-center rounded-full border-4 border-black bg-white px-1 transition-transform',
            checked
              ? 'bg-[#6C63FF] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.16)]'
              : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)]',
          )}
          {...rest}
        >
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white font-bold transition-transform',
              checked ? 'translate-x-11 bg-[#FFD166]' : 'translate-x-0',
            )}
          >
            {checked ? '✓' : ''}
          </span>
          <span className="pointer-events-none absolute left-0 right-0 text-center text-xs font-bold uppercase">
            {checked ? onLabel : offLabel}
          </span>
        </button>
      </div>
    )
  },
)

NeobrutalToggleSwitch.displayName = 'NeobrutalToggleSwitch'
