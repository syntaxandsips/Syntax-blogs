'use client'

import { useEffect } from 'react'

interface MeErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function MeError({ error, reset }: MeErrorProps) {
  useEffect(() => {
    console.error('Library dashboard error', error)
  }, [error])

  return (
    <div className="rounded-[32px] border-4 border-black bg-[#FFB347] p-6 text-black shadow-[16px_16px_0px_0px_rgba(0,0,0,0.2)]">
      <h2 className="text-2xl font-black">Something went wrong</h2>
      <p className="mt-2 text-lg">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex rounded-[24px] border-4 border-black bg-white px-5 py-2 font-bold transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
      >
        Try again
      </button>
    </div>
  )
}
