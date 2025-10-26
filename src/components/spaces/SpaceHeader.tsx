'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { SpaceRolePill } from '@/components/spaces/SpaceRolePill'

interface SpaceHeaderProps {
  name: string
  slug: string
  description?: string | null
  visibility: 'public' | 'private' | 'unlisted'
  membershipStatus: 'pending' | 'active' | 'banned' | null
  membershipRole: string | null
  onJoinRequest?: () => Promise<void>
  canModerate?: boolean
}

export const SpaceHeader = ({
  name,
  slug,
  description,
  visibility,
  membershipStatus,
  membershipRole,
  onJoinRequest,
  canModerate = false,
}: SpaceHeaderProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const handleJoin = async () => {
    if (!onJoinRequest) return
    setIsSubmitting(true)
    setFlash(null)
    try {
      await onJoinRequest()
      setFlash('Join request submitted!')
    } catch (error) {
      console.error('[SpaceHeader] join request failed', error)
      setFlash('Unable to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const joinDisabled = membershipStatus === 'pending' || membershipStatus === 'active'

  return (
    <section className="rounded-3xl border-4 border-black bg-white px-6 py-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black uppercase tracking-wide text-black">{name}</h1>
            {membershipRole ? <SpaceRolePill role={membershipRole} /> : null}
          </div>
          <p className="text-sm uppercase tracking-wider text-black/70">slug: {slug}</p>
          <p className="max-w-2xl text-base text-black/80">{description ?? 'No description provided yet.'}</p>
          <p
            className={clsx('inline-flex w-fit rounded-full border-2 border-black px-3 py-1 text-xs font-bold uppercase', {
              'bg-[#06D6A0] text-black': visibility === 'public',
              'bg-[#FFD166] text-black': visibility === 'private',
              'bg-[#118AB2] text-white': visibility === 'unlisted',
            })}
          >
            {visibility} space
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          {flash ? (
            <span className="inline-flex rounded-md border-2 border-black bg-[#FCFC9E] px-3 py-1 text-xs font-semibold uppercase text-black">
              {flash}
            </span>
          ) : null}
          {onJoinRequest ? (
            <button
              type="button"
              onClick={handleJoin}
              disabled={joinDisabled || isSubmitting}
              className={clsx(
                'inline-flex items-center justify-center rounded-md border-2 border-black px-4 py-2 text-sm font-extrabold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] transition',
                joinDisabled
                  ? 'cursor-not-allowed bg-gray-300 text-gray-600'
                  : 'bg-[#FF6B6B] text-white hover:-translate-y-[1px]',
              )}
              aria-disabled={joinDisabled || isSubmitting}
            >
              {membershipStatus === 'pending'
                ? 'Request pending'
                : membershipStatus === 'active'
                ? 'Already a member'
                : isSubmitting
                ? 'Submitting…'
                : 'Request to join'}
            </button>
          ) : null}
          {canModerate ? (
            <span className="text-xs uppercase tracking-wide text-black/70">
              You can manage membership and rules for this space.
            </span>
          ) : null}
        </div>
      </div>
    </section>
  )
}
