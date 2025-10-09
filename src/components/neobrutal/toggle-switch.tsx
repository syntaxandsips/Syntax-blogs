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
    {
      checked,
      onCheckedChange,
      label,
      onLabel = 'On',
      offLabel = 'Off',
      className,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const handleClick = () => {
      onCheckedChange?.(!checked)
    }

    const accessibleLabel = ariaLabel ?? (checked ? onLabel : offLabel)

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
          aria-label={accessibleLabel}
          onClick={handleClick}
          className={cn(
            'relative grid h-10 w-36 grid-cols-2 items-center rounded-full border-4 border-black bg-white text-[11px] font-black uppercase tracking-wide transition-shadow duration-200 ease-out',
            checked
              ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.16)]'
              : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)]',
          )}
          {...rest}
        >
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-1 left-1 z-0 rounded-full border-2 border-black bg-[#6C63FF] transition-transform duration-200 ease-out',
              'w-[calc(50%-0.375rem)]',
              checked ? 'translate-x-[calc(100%+0.75rem)]' : 'translate-x-0',
            )}
          />
          <span
            aria-hidden
            className={cn(
              'relative z-10 text-center transition-colors duration-200 ease-out',
              checked ? 'text-black' : 'text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,0.45)]',
            )}
          >
            {offLabel}
          </span>
          <span
            aria-hidden
            className={cn(
              'relative z-10 text-center transition-colors duration-200 ease-out',
              checked ? 'text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,0.45)]' : 'text-black',
            )}
          >
            {onLabel}
          </span>
        </button>
      </div>
    )
  },
)

NeobrutalToggleSwitch.displayName = 'NeobrutalToggleSwitch'
