'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import slugify from '@sindresorhus/slugify'
import {
  Check,
  ListChecks,
  Loader2,
  Plus,
  PlusCircle,
  X,
} from 'lucide-react'
import { useAuthenticatedProfile } from '@/hooks/useAuthenticatedProfile'
import type { UserListWithMembership } from '@/utils/types'

interface SaveToListDrawerProps {
  postId: string
  postTitle: string
  className?: string
}

interface CreateListFormState {
  title: string
  description: string
  isPublic: boolean
}

const initialFormState: CreateListFormState = {
  title: '',
  description: '',
  isPublic: false,
}

type RawListResponse = UserListWithMembership | (Omit<UserListWithMembership, 'membership'> & {
  membership?: UserListWithMembership['membership']
})

export function SaveToListDrawer({ postId, postTitle, className }: SaveToListDrawerProps) {
  const { profile } = useAuthenticatedProfile()
  const [isOpen, setIsOpen] = useState(false)
  const [lists, setLists] = useState<UserListWithMembership[]>([])
  const [isLoadingLists, setIsLoadingLists] = useState(false)
  const [hasLoadedLists, setHasLoadedLists] = useState(false)
  const [listsError, setListsError] = useState<string | null>(null)
  const [formState, setFormState] = useState<CreateListFormState>(initialFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const savedCount = useMemo(
    () => lists.filter((list) => Boolean(list.membership)).length,
    [lists],
  )

  const loadLists = useCallback(async () => {
    if (!profile) {
      setLists([])
      setHasLoadedLists(false)
      return
    }

    setIsLoadingLists(true)
    setListsError(null)

    try {
      const response = await fetch(`/api/library/lists?limit=100&postId=${postId}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })

      const payload = (await response.json().catch(() => null)) as
        | { items?: RawListResponse[]; error?: string }
        | null

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to load your lists')
      }

      const items = payload?.items ?? []

      setLists(
        items.map((item) => ({
          ...item,
          membership: item.membership ?? null,
        })),
      )
      setHasLoadedLists(true)
    } catch (error) {
      console.error('Failed to load library lists', error)
      setListsError(
        error instanceof Error ? error.message : 'Unable to load your lists right now.',
      )
    } finally {
      setIsLoadingLists(false)
    }
  }, [postId, profile])

  useEffect(() => {
    if (!profile) {
      setLists([])
      setHasLoadedLists(false)
      setIsOpen(false)
    }
  }, [profile])

  useEffect(() => {
    if (profile && !hasLoadedLists) {
      void loadLists()
    }
  }, [profile, hasLoadedLists, loadLists])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !profile) {
      return
    }

    void loadLists()
  }, [isOpen, loadLists, profile])

  useEffect(() => {
    if (!statusMessage) {
      return
    }

    const timeout = window.setTimeout(() => setStatusMessage(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [statusMessage])

  const closeDrawer = () => {
    setIsOpen(false)
    setFormError(null)
    setListsError(null)
  }

  const handleToggleList = async (list: UserListWithMembership) => {
    setActiveListId(list.id)
    setListsError(null)

    try {
      if (list.membership) {
        const response = await fetch(`/api/library/lists/${list.id}/items/${list.membership.itemId}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error ?? 'Unable to remove this post from the list')
        }

        setLists((previous) =>
          previous.map((entry) =>
            entry.id === list.id
              ? {
                  ...entry,
                  membership: null,
                  itemCount: entry.itemCount > 0 ? entry.itemCount - 1 : 0,
                }
              : entry,
          ),
        )
        setStatusMessage(`Removed from “${list.title}”.`)
        return
      }

      const response = await fetch(`/api/library/lists/${list.id}/items`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Unable to save this post to the list')
      }

      const { item } = (await response.json()) as { item: { id: string } }

      setLists((previous) =>
        previous.map((entry) =>
          entry.id === list.id
            ? {
                ...entry,
                membership: { itemId: item.id },
                itemCount: entry.itemCount + 1,
              }
            : entry,
        ),
      )
      setStatusMessage(`Saved to “${list.title}”.`)
    } catch (error) {
      console.error('Failed to toggle list membership', error)
      setListsError(
        error instanceof Error
          ? error.message
          : 'Unable to update your list. Please try again shortly.',
      )
    } finally {
      setActiveListId(null)
    }
  }

  const handleCreateList = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const trimmedTitle = formState.title.trim()
    const trimmedDescription = formState.description.trim()

    if (trimmedTitle.length === 0) {
      setFormError('Give your list a title before saving.')
      return
    }

    setIsCreatingList(true)

    try {
      const response = await fetch('/api/library/lists', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription.length > 0 ? trimmedDescription : undefined,
          slug: slugify(trimmedTitle).toLowerCase(),
          isPublic: formState.isPublic,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { list: UserListWithMembership; error?: string }
        | { error?: string }
        | null

      if (!response.ok || !payload || !('list' in payload)) {
        throw new Error(payload?.error ?? 'Unable to create a new list right now')
      }

      const { list } = payload

      setLists((previous) => [{ ...list, membership: null }, ...previous])
      setFormState(initialFormState)
      setStatusMessage(`Created new list “${list.title}”.`)

      await handleToggleList({ ...list, membership: null })
    } catch (error) {
      console.error('Failed to create list', error)
      setFormError(error instanceof Error ? error.message : 'Unable to create list.')
    } finally {
      setIsCreatingList(false)
    }
  }

  const handleOpenDrawer = () => {
    if (!profile) {
      return
    }

    setIsOpen(true)
  }

  const triggerLabel = profile
    ? savedCount > 0
      ? `Saved to ${savedCount} list${savedCount === 1 ? '' : 's'}`
      : 'Save to list'
    : 'Sign in to save'

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleOpenDrawer}
        disabled={!profile}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-[24px] border-4 border-black px-4 py-2 text-sm font-black uppercase tracking-wide transition-transform md:w-auto ${
          savedCount > 0 ? 'bg-[#90EE90] text-black' : 'bg-white text-black'
        } ${profile ? 'hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {profile ? (
          <ListChecks className="h-4 w-4" aria-hidden="true" />
        ) : (
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
        )}
        {triggerLabel}
      </button>
      {statusMessage ? (
        <p className="mt-2 text-xs font-semibold text-[#2563EB]" role="status">
          {statusMessage}
        </p>
      ) : null}
      {listsError ? (
        <p className="mt-2 text-xs font-semibold text-[#B91C1C]" role="alert">
          {listsError}
        </p>
      ) : null}
      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex">
          <div
            className="absolute inset-0 bg-black/40"
            role="presentation"
            onClick={closeDrawer}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-to-list-heading"
            className="relative ml-auto flex h-full w-full max-w-md flex-col border-l-4 border-black bg-[#FDF7FF] shadow-[-12px_0px_0px_0px_rgba(0,0,0,0.2)]"
          >
            <header className="flex items-center justify-between border-b-4 border-black bg-white px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/60">
                  Save post
                </p>
                <h2 id="save-to-list-heading" className="text-xl font-black text-black">
                  Add to your lists
                </h2>
                <p className="mt-1 text-xs font-semibold text-black/60">
                  {postTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-4 border-black bg-white text-black transition-transform hover:-translate-y-0.5"
                aria-label="Close save drawer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <section className="space-y-4 rounded-[24px] border-4 border-black bg-white p-4 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <h3 className="text-lg font-black">Create a new list</h3>
                </div>
                <form className="space-y-3" onSubmit={handleCreateList}>
                  <label className="block text-sm font-semibold">
                    Title
                    <input
                      value={formState.title}
                      onChange={(event) =>
                        setFormState((previous) => ({ ...previous, title: event.target.value }))
                      }
                      className="mt-1 w-full rounded-[16px] border-4 border-black px-3 py-2 font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
                      placeholder="Weekend inspiration"
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Description <span className="text-black/50">(optional)</span>
                    <textarea
                      value={formState.description}
                      onChange={(event) =>
                        setFormState((previous) => ({
                          ...previous,
                          description: event.target.value,
                        }))
                      }
                      rows={3}
                      className="mt-1 w-full rounded-[16px] border-4 border-black px-3 py-2 font-semibold text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
                      placeholder="Notes about why this collection exists"
                    />
                  </label>
                  <label className="flex items-center gap-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={formState.isPublic}
                      onChange={(event) =>
                        setFormState((previous) => ({
                          ...previous,
                          isPublic: event.target.checked,
                        }))
                      }
                      className="h-5 w-5 rounded border-4 border-black"
                    />
                    Make this list public
                  </label>
                  {formError ? (
                    <p className="text-xs font-semibold text-[#B91C1C]" role="alert">
                      {formError}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-[24px] border-4 border-black bg-[#87CEEB] px-4 py-2 text-sm font-black uppercase tracking-wide text-black transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
                    disabled={isCreatingList}
                  >
                    {isCreatingList ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <PlusCircle className="h-4 w-4" aria-hidden="true" />
                    )}
                    {isCreatingList ? 'Creating…' : 'Create list & save post'}
                  </button>
                </form>
              </section>

              <section className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-black">Your lists</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
                    {savedCount} saved
                  </span>
                </div>
                {isLoadingLists ? (
                  <div className="flex items-center gap-3 text-sm font-semibold text-black">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Loading lists…
                  </div>
                ) : null}
                {!isLoadingLists && lists.length === 0 ? (
                  <div className="rounded-[24px] border-4 border-dashed border-black/40 bg-white px-4 py-6 text-sm font-semibold text-black/70">
                    No lists yet. Create a collection to start organizing your saved posts.
                  </div>
                ) : null}
                <ul className="space-y-3">
                  {lists.map((list) => {
                    const isSaved = Boolean(list.membership)
                    const isBusy = activeListId === list.id
                    return (
                      <li
                        key={list.id}
                        className="rounded-[24px] border-4 border-black bg-white p-4 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-black">{list.title}</p>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
                              {list.itemCount} item{list.itemCount === 1 ? '' : 's'} ·{' '}
                              {list.isPublic ? 'Public' : 'Private'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleToggleList(list)}
                            disabled={isBusy}
                            className={`inline-flex items-center gap-2 rounded-[20px] border-4 border-black px-3 py-1 text-xs font-black uppercase tracking-wide transition-transform ${
                              isSaved
                                ? 'bg-[#90EE90] text-black hover:-translate-y-0.5'
                                : 'bg-white text-black hover:-translate-y-0.5'
                            } ${isBusy ? 'opacity-70' : ''}`}
                            aria-pressed={isSaved}
                          >
                            {isBusy ? (
                              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                            ) : isSaved ? (
                              <Check className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <Plus className="h-3 w-3" aria-hidden="true" />
                            )}
                            {isSaved ? 'Saved' : 'Save' }
                          </button>
                        </div>
                        {list.description ? (
                          <p className="mt-2 text-xs font-semibold text-black/70">
                            {list.description}
                          </p>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
