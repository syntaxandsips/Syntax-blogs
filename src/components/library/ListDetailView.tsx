'use client'

import { useState } from 'react'
import { Loader2, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import type { ListItem, UserList } from '@/utils/types'

interface ListDetailViewProps {
  list: UserList
  items: ListItem[]
}

interface NewItemState {
  postId: string
  note: string
}

export function ListDetailView({ list, items: initialItems }: ListDetailViewProps) {
  const [items, setItems] = useState(initialItems)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<NewItemState>({ postId: '', note: '' })

  const refreshList = async () => {
    const response = await fetch(`/api/library/lists/${list.id}/items?limit=100`, {
      credentials: 'include',
      cache: 'no-store',
    })
    if (!response.ok) return
    const payload = (await response.json()) as { items: ListItem[] }
    setItems(payload.items ?? [])
  }

  const handleRemove = async (itemId: string) => {
    const confirmed = window.confirm('Remove this post from the list?')
    if (!confirmed) return

    const response = await fetch(`/api/library/lists/${list.id}/items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      setMessage('Unable to remove item. Please try again.')
      return
    }

    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleReorder = async (itemId: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex((item) => item.id === itemId)
    if (currentIndex === -1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const updated = [...items]
    const [moved] = updated.splice(currentIndex, 1)
    updated.splice(targetIndex, 0, moved)

    setItems(updated)

    await fetch(`/api/library/lists/${list.id}/items/${itemId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: targetIndex }),
    })
  }

  const handleNoteSave = async (itemId: string, note: string) => {
    setUpdating(true)
    const response = await fetch(`/api/library/lists/${list.id}/items/${itemId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })

    if (!response.ok) {
      setMessage('Unable to update note.')
    }
    setUpdating(false)
  }

  const handleAddItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newItem.postId) return
    setUpdating(true)
    setMessage(null)
    const response = await fetch(`/api/library/lists/${list.id}/items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: newItem.postId, note: newItem.note }),
    })

    if (!response.ok) {
      const body = (await response.json()) as { error?: string }
      setMessage(body.error ?? 'Unable to add post to list.')
      setUpdating(false)
      return
    }

    setNewItem({ postId: '', note: '' })
    await refreshList()
    setUpdating(false)
  }

  return (
    <div className="space-y-6">
      <header className="border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black text-black">{list.title}</h1>
        <p className="text-sm text-black/70">{list.description ?? 'No description yet.'}</p>
        <p className="mt-1 text-xs uppercase text-black/60">{list.isPublic ? 'Public list' : 'Private list'}</p>
      </header>

      <section className="rounded-[32px] border-4 border-black bg-[#FF69B4]/30 p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
        <h2 className="text-xl font-black text-black">Add a post by ID</h2>
        <p className="text-sm text-black/70">
          Paste the post ID from the admin dashboard to add it to this list. We&apos;re shipping a friendlier picker soon!
        </p>
        <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={handleAddItem}>
          <input
            value={newItem.postId}
            onChange={(event) => setNewItem((prev) => ({ ...prev, postId: event.target.value }))}
            placeholder="Post ID"
            className="rounded-[16px] border-4 border-black px-3 py-2 font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
            required
          />
          <input
            value={newItem.note}
            onChange={(event) => setNewItem((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Optional note"
            className="rounded-[16px] border-4 border-black px-3 py-2 font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
          />
          <button
            type="submit"
            className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-[24px] border-4 border-black bg-white px-4 py-2 font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
          >
            {updating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Add post
          </button>
        </form>
      </section>

      {message ? (
        <div className="rounded-[24px] border-4 border-black bg-[#FFB347] px-4 py-3 font-semibold text-black">{message}</div>
      ) : null}

      <section aria-labelledby="list-items" className="space-y-4">
        <h2 id="list-items" className="text-2xl font-black text-black">
          Posts in this list ({items.length})
        </h2>
        {items.length === 0 ? (
          <div className="rounded-[32px] border-4 border-dashed border-black/40 bg-[#FDF7FF] px-6 py-10 text-center font-semibold text-black/70">
            No posts added yet. Use the form above to start curating!
          </div>
        ) : null}
        <div className="space-y-4">
          {items.map((item, index) => (
            <article
              key={item.id}
              className="rounded-[32px] border-4 border-black bg-white p-5 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-black text-black">{item.postTitle}</p>
                  <p className="text-sm text-black/70">{item.postExcerpt ?? 'No excerpt available.'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleReorder(item.id, 'up')}
                    className="inline-flex items-center gap-1 rounded-[24px] border-4 border-black bg-white px-3 py-1 text-sm font-bold text-black disabled:opacity-50"
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReorder(item.id, 'down')}
                    className="inline-flex items-center gap-1 rounded-[24px] border-4 border-black bg-white px-3 py-1 text-sm font-bold text-black disabled:opacity-50"
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRemove(item.id)}
                    className="inline-flex items-center gap-1 rounded-[24px] border-4 border-black bg-[#FF69B4] px-3 py-1 text-sm font-bold text-black"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase text-black/60">Personal note</span>
                  <textarea
                    defaultValue={item.note ?? ''}
                    onBlur={(event) => void handleNoteSave(item.id, event.target.value)}
                    rows={2}
                    className="rounded-[16px] border-4 border-black px-3 py-2 font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
