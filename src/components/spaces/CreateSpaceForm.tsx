'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface CreateSpaceFormProps {
  defaultVisibility: 'public' | 'private'
}

export const CreateSpaceForm = ({ defaultVisibility }: CreateSpaceFormProps) => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>(defaultVisibility)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, visibility }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? 'Unable to create space')
      }

      startTransition(() => {
        router.push(`/spaces/${slug}`)
        router.refresh()
      })
    } catch (caught) {
      console.error('[CreateSpaceForm] submission failed', caught)
      setError(caught instanceof Error ? caught.message : 'Unable to create space')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]"
    >
      <fieldset className="space-y-4" disabled={isPending}>
        <div>
          <label htmlFor="space-name" className="text-sm font-semibold uppercase text-black">
            Space name
          </label>
          <input
            id="space-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-2 w-full rounded-md border-2 border-black px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="space-slug" className="text-sm font-semibold uppercase text-black">
            Slug
          </label>
          <input
            id="space-slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            pattern="[a-z0-9-]+"
            required
            className="mt-2 w-full rounded-md border-2 border-black px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-black/60">Use lowercase letters, numbers, and hyphens only.</p>
        </div>
        <div>
          <label htmlFor="space-description" className="text-sm font-semibold uppercase text-black">
            Description
          </label>
          <textarea
            id="space-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-md border-2 border-black px-3 py-2 text-sm"
          />
        </div>
        <div>
          <span className="text-sm font-semibold uppercase text-black">Visibility</span>
          <div className="mt-2 flex gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-black/80">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
              />
              Public
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-black/80">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
              />
              Private
            </label>
          </div>
        </div>
      </fieldset>
      {error ? (
        <p className="mt-4 rounded-md border-2 border-black bg-[#FFE0E0] px-3 py-2 text-sm text-black">{error}</p>
      ) : null}
      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center rounded-md border-2 border-black bg-[#06D6A0] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
      >
        {isPending ? 'Creating…' : 'Create space'}
      </button>
    </form>
  )
}
