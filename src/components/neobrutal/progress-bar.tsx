import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export interface NeobrutalProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  label?: string
  showValue?: boolean
}

export function NeobrutalProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  className,
  ...rest
}: NeobrutalProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), max)
  const percent = max === 0 ? 0 : (clampedValue / max) * 100

  return (
    <div className={cn('space-y-2', className)} {...rest}>
      {label ? (
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-600">
          <span>{label}</span>
          {showValue ? <span>{Math.round(percent)}%</span> : null}
        </div>
      ) : null}
      <div
        className="relative h-3 w-full rounded-full border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)]"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#6C63FF]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
