'use client'

import clsx from 'clsx'
import { getRoleBadge } from '@/lib/rbac/permissions'

interface SpaceRolePillProps {
  role: string | null | undefined
}

export const SpaceRolePill = ({ role }: SpaceRolePillProps) => {
  const badge = getRoleBadge(role)

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border-2 border-black px-2 py-0.5 text-xs font-bold uppercase',
        {
          'bg-[#FFD166] text-black': badge.tone === 'warning',
          'bg-[#06D6A0] text-black': badge.tone === 'success',
          'bg-[#EF476F] text-white': badge.tone === 'critical',
          'bg-[#118AB2] text-white': badge.tone === 'info',
          'bg-white text-black': badge.tone === 'neutral',
        },
      )}
      aria-label={`Role: ${badge.label}`}
    >
      {badge.label}
    </span>
  )
}
