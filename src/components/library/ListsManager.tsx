'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import slugify from '@sindresorhus/slugify'
import { Loader2, Trash2, Eye, PlusCircle } from 'lucide-react'
import type { UserList } from '@/utils/types'

interface ListsManagerProps {
  initialLists: UserList[]
}

interface FormState {
  title: string
  description: string
  isPublic: boolean
  slug: string
  coverImageUrl: string
}

const defaultFormState: FormState = {
  title: '',
  description: '',
  isPublic: false,
  slug: '',
  coverImageUrl: '',
}

export function ListsManager({ initialLists }: ListsManagerProps) {
  const [lists, setLists] = useState<UserList[]>(initialLists)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [submitting, setSubmitting] = useState(false)

  const loadLists = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/library/lists?limit=50', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error ?? 'Unable to load lists')
      }

      const payload = (await response.json()) as { items: UserList[] }
      setLists(payload.items ?? [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load lists')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialLists.length === 0) {
      void loadLists()
    }
  }, [initialLists.length, loadLists])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim().length > 0 ? form.description.trim() : undefined,
      slug: (form.slug.trim() || slugify(form.title)).toLowerCase(),
      isPublic: form.isPublic,
      coverImageUrl: form.coverImageUrl.trim().length > 0 ? form.coverImageUrl.trim() : undefined,
    }

    try {
      const response = await fetch('/api/library/lists', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? 'Unable to create list')
      }

      const body = (await response.json()) as { list: UserList }
      setLists((previous) => [body.list, ...previous])
      setForm(defaultFormState)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create list')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this list? This cannot be undone.')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/library/lists/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? 'Unable to delete list')
      }

      setLists((previous) => previous.filter((list) => list.id !== id))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to delete list')
    }
  }

  const totalItems = useMemo(
    () => lists.reduce((sum, list) => sum + list.itemCount, 0),
    [lists],
  )

  return (
    <div className="space-y-6">
      <header className="border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black text-black">Your custom lists</h1>
        <p className="mt-2 text-sm text-black/70">
          Organize saved posts into themed collections. Share public lists with the community or keep them private for your own learning path.
        </p>
      </header>

      <section aria-labelledby="create-list" className="rounded-[32px] border-4 border-black bg-[#87CEEB]/40 p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-black" aria-hidden="true" />
          <h2 id="create-list" className="text-2xl font-black text-black">
            Create a new list
          </h2>
        </div>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="md:col-span-1">
            <span className="text-sm font-bold uppercase text-black/70">Title</span>
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value, slug: slugify(event.target.value) }))
              }
              className="mt-1 w-full rounded-[16px] border-4 border-black px-3 py-2 font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
              placeholder="React reading list"
            />
          </label>
          <label className="md:col-span-1">
            <span className="text-sm font-bold uppercase text-black/70">Slug</span>
            <input
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              className="mt-1 w-full rounded-[16px] border-4 border-black px-3 py-2 font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
              placeholder="react-reading-list"
            />
          </label>
          <label className="md:col-span-2">
            <span className="text-sm font-bold uppercase text-black/70">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-[16px] border-4 border-black px-3 py-2 font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
              placeholder="Curated tutorials and guides for modern React developers."
            />
          </label>
          <label className="md:col-span-1">
            <span className="text-sm font-bold uppercase text-black/70">Cover image URL</span>
            <input
              value={form.coverImageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
              className="mt-1 w-full rounded-[16px] border-4 border-black px-3 py-2 font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
              placeholder="https://..."
            />
          </label>
          <label className="flex items-center gap-3 md:col-span-1">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(event) => setForm((prev) => ({ ...prev, isPublic: event.target.checked }))}
              className="h-5 w-5 rounded border-4 border-black"
            />
            <span className="text-sm font-semibold text-black">Make this list public</span>
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-[24px] border-4 border-black bg-white px-5 py-2 font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
              disabled={submitting}
            >
              {submitting ? 'Saving…' : 'Save list'}
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <div className="rounded-[24px] border-4 border-black bg-[#FFB347] px-4 py-3 font-semibold text-black">{error}</div>
      ) : null}

      <section aria-labelledby="your-lists" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="your-lists" className="text-2xl font-black text-black">
              Your lists ({lists.length})
            </h2>
            <p className="text-sm text-black/70">{totalItems} posts organized so far.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadLists()}
            className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-white px-4 py-2 font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-black">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading lists…
          </div>
        ) : null}

        {lists.length === 0 && !loading ? (
          <div className="rounded-[32px] border-4 border-dashed border-black/40 bg-[#FDF7FF] px-6 py-10 text-center font-semibold text-black/70">
            No lists yet. Create your first collection to start organizing saved posts.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {lists.map((list) => (
            <article
              key={list.id}
              className="flex flex-col gap-4 rounded-[32px] border-4 border-black bg-white p-5 text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]"
            >
              <div>
                <h3 className="text-xl font-black">{list.title}</h3>
                <p className="text-sm text-black/70">{list.description ?? 'No description yet.'}</p>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm font-semibold">
                <div>
                  <dt className="text-black/60">Items</dt>
                  <dd>{list.itemCount}</dd>
                </div>
                <div>
                  <dt className="text-black/60">Visibility</dt>
                  <dd>{list.isPublic ? 'Public' : 'Private'}</dd>
                </div>
                <div>
                  <dt className="text-black/60">Created</dt>
                  <dd>{new Date(list.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-black/60">Updated</dt>
                  <dd>{new Date(list.updatedAt).toLocaleDateString()}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/me/lists/${list.id}`}
                  className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-[#87CEEB] px-4 py-2 font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" /> View list
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(list.id)}
                  className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-white px-4 py-2 font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
