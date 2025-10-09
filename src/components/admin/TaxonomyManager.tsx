"use client"

import { useMemo, useState } from 'react'
import { Loader2, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import type { CategoryOption, TagOption } from '@/utils/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TaxonomyManagerProps {
  categories: CategoryOption[]
  tags: TagOption[]
  onCreateCategory: (name: string, slug?: string) => Promise<boolean>
  onUpdateCategory: (
    id: string,
    values: { name: string; slug: string },
  ) => Promise<boolean>
  onDeleteCategory: (id: string) => Promise<boolean>
  onRefreshCategories: () => Promise<boolean>
  onCreateTag: (name: string, slug?: string) => Promise<boolean>
  onUpdateTag: (id: string, values: { name: string; slug: string }) => Promise<boolean>
  onDeleteTag: (id: string) => Promise<boolean>
  onRefreshTags: () => Promise<boolean>
}

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export function TaxonomyManager({
  categories,
  tags,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onRefreshCategories,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onRefreshTags,
}: TaxonomyManagerProps) {
  const [categoryName, setCategoryName] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [tagName, setTagName] = useState('')
  const [tagSlug, setTagSlug] = useState('')
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false)
  const [isTagSubmitting, setIsTagSubmitting] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [categoryEdits, setCategoryEdits] = useState<Record<string, { name: string; slug: string }>>({})
  const [tagEdits, setTagEdits] = useState<Record<string, { name: string; slug: string }>>({})
  const [isRefreshingCategories, setIsRefreshingCategories] = useState(false)
  const [isRefreshingTags, setIsRefreshingTags] = useState(false)

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  )

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
    [tags],
  )

  const resetCategoryForm = () => {
    setCategoryName('')
    setCategorySlug('')
  }

  const resetTagForm = () => {
    setTagName('')
    setTagSlug('')
  }

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCategorySubmitting(true)

    const name = categoryName.trim()
    const slug = (categorySlug.trim().length > 0 ? categorySlug : normalizeSlug(categoryName)).trim()

    const wasSuccessful = await onCreateCategory(name, slug)

    if (wasSuccessful) {
      resetCategoryForm()
    }

    setIsCategorySubmitting(false)
  }

  const handleCreateTag = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsTagSubmitting(true)

    const name = tagName.trim()
    const slug = (tagSlug.trim().length > 0 ? tagSlug : normalizeSlug(tagName)).trim()

    const wasSuccessful = await onCreateTag(name, slug)

    if (wasSuccessful) {
      resetTagForm()
    }

    setIsTagSubmitting(false)
  }

  const handleStartEditCategory = (category: CategoryOption) => {
    setEditingCategoryId(category.id)
    setCategoryEdits((prev) => ({
      ...prev,
      [category.id]: { name: category.name, slug: category.slug },
    }))
  }

  const handleStartEditTag = (tag: TagOption) => {
    setEditingTagId(tag.id)
    setTagEdits((prev) => ({
      ...prev,
      [tag.id]: { name: tag.name, slug: tag.slug },
    }))
  }

  const handleCategoryEditChange = (
    id: string,
    field: 'name' | 'slug',
    value: string,
  ) => {
    setCategoryEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { name: '', slug: '' }),
        [field]: field === 'slug' ? normalizeSlug(value) : value,
      },
    }))
  }

  const handleTagEditChange = (id: string, field: 'name' | 'slug', value: string) => {
    setTagEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { name: '', slug: '' }),
        [field]: field === 'slug' ? normalizeSlug(value) : value,
      },
    }))
  }

  const handleSaveCategoryEdit = async (id: string) => {
    const pending = categoryEdits[id]
    if (!pending) return

    const success = await onUpdateCategory(id, {
      name: pending.name,
      slug: pending.slug,
    })

    if (success) {
      setEditingCategoryId(null)
      setCategoryEdits((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const handleSaveTagEdit = async (id: string) => {
    const pending = tagEdits[id]
    if (!pending) return

    const success = await onUpdateTag(id, {
      name: pending.name,
      slug: pending.slug,
    })

    if (success) {
      setEditingTagId(null)
      setTagEdits((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const handleRefreshCategoryList = async () => {
    setIsRefreshingCategories(true)
    await onRefreshCategories()
    setIsRefreshingCategories(false)
  }

  const handleRefreshTagList = async () => {
    setIsRefreshingTags(true)
    await onRefreshTags()
    setIsRefreshingTags(false)
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-[#2A2A2A] text-3xl font-bold mb-3">Content Taxonomy</h1>
        <p className="text-[#2A2A2A]/70 max-w-2xl">
          Create and organize categories and tags used throughout the blog to keep your
          content easy to navigate and discover.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between border-b-4 border-black bg-[#FFEFEE] px-6 py-4">
            <div>
              <h2 className="text-xl font-black">Categories</h2>
              <p className="text-sm text-[#2A2A2A]/70">Group related posts together</p>
            </div>
            <button
              type="button"
              onClick={handleRefreshCategoryList}
              className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isRefreshingCategories}
            >
              {isRefreshingCategories ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>
          <div className="space-y-6 p-6">
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-sm font-bold">Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(event) => {
                    setCategoryName(event.target.value)
                    if (!categorySlug) {
                      setCategorySlug(normalizeSlug(event.target.value))
                    }
                  }}
                  className="mt-1 w-full rounded-md border-2 border-black/20 px-3 py-2 focus:border-black focus:outline-none"
                  placeholder="e.g. Machine Learning"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold">Slug</label>
                <input
                  type="text"
                  value={categorySlug}
                  onChange={(event) => setCategorySlug(normalizeSlug(event.target.value))}
                  className="mt-1 w-full rounded-md border-2 border-black/20 px-3 py-2 focus:border-black focus:outline-none"
                  placeholder="machine-learning"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 font-semibold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCategorySubmitting}
              >
                {isCategorySubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Category
              </button>
            </form>

            <div className="space-y-3">
              {sortedCategories.length === 0 ? (
                <p className="text-sm text-[#2A2A2A]/70">
                  No categories yet. Create one to start organizing posts.
                </p>
              ) : (
                sortedCategories.map((category) => {
                  const isEditing = editingCategoryId === category.id
                  const pending = categoryEdits[category.id] ?? {
                    name: category.name,
                    slug: category.slug,
                  }

                  return (
                    <div
                      key={category.id}
                      className="rounded-md border-2 border-black/10 bg-[#FFF9F9] px-3 py-3 shadow-sm"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold uppercase text-[#2A2A2A]/70">
                              Name
                            </label>
                            <input
                              type="text"
                              value={pending.name}
                              onChange={(event) =>
                                handleCategoryEditChange(category.id, 'name', event.target.value)
                              }
                              className="mt-1 w-full rounded-md border-2 border-black/20 px-2 py-1.5 text-sm focus:border-black focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-[#2A2A2A]/70">
                              Slug
                            </label>
                            <input
                              type="text"
                              value={pending.slug}
                              onChange={(event) =>
                                handleCategoryEditChange(category.id, 'slug', event.target.value)
                              }
                              className="mt-1 w-full rounded-md border-2 border-black/20 px-2 py-1.5 text-sm focus:border-black focus:outline-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveCategoryEdit(category.id)}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#06D6A0] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryId(null)
                                setCategoryEdits((prev) => {
                                  const next = { ...prev }
                                  delete next[category.id]
                                  return next
                                })
                              }}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-[#2A2A2A] shadow-sm transition hover:opacity-90"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#2A2A2A]">{category.name}</p>
                            <p className="text-xs uppercase tracking-wide text-[#2A2A2A]/60">
                              {category.slug}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditCategory(category)}
                              className="inline-flex items-center gap-2 rounded-md bg-[#6C63FF] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-md bg-[#FF5252] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete category?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the &quot;{category.name}&quot; category. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={async () => {
                                    await onDeleteCategory(category.id)
                                  }}>
                                    Delete Category
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between border-b-4 border-black bg-[#EEF6FF] px-6 py-4">
            <div>
              <h2 className="text-xl font-black">Tags</h2>
              <p className="text-sm text-[#2A2A2A]/70">Add keywords to enhance discovery</p>
            </div>
            <button
              type="button"
              onClick={handleRefreshTagList}
              className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isRefreshingTags}
            >
              {isRefreshingTags ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>
          <div className="space-y-6 p-6">
            <form onSubmit={handleCreateTag} className="space-y-3">
              <div>
                <label className="block text-sm font-bold">Name</label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(event) => {
                    setTagName(event.target.value)
                    if (!tagSlug) {
                      setTagSlug(normalizeSlug(event.target.value))
                    }
                  }}
                  className="mt-1 w-full rounded-md border-2 border-black/20 px-3 py-2 focus:border-black focus:outline-none"
                  placeholder="e.g. Generative AI"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold">Slug</label>
                <input
                  type="text"
                  value={tagSlug}
                  onChange={(event) => setTagSlug(normalizeSlug(event.target.value))}
                  className="mt-1 w-full rounded-md border-2 border-black/20 px-3 py-2 focus:border-black focus:outline-none"
                  placeholder="generative-ai"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 font-semibold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isTagSubmitting}
              >
                {isTagSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Tag
              </button>
            </form>

            <div className="space-y-3">
              {sortedTags.length === 0 ? (
                <p className="text-sm text-[#2A2A2A]/70">
                  No tags yet. Use tags to highlight specific topics and skills.
                </p>
              ) : (
                sortedTags.map((tag) => {
                  const isEditing = editingTagId === tag.id
                  const pending = tagEdits[tag.id] ?? { name: tag.name, slug: tag.slug }

                  return (
                    <div
                      key={tag.id}
                      className="rounded-md border-2 border-black/10 bg-[#F4F8FF] px-3 py-3 shadow-sm"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold uppercase text-[#2A2A2A]/70">
                              Name
                            </label>
                            <input
                              type="text"
                              value={pending.name}
                              onChange={(event) => handleTagEditChange(tag.id, 'name', event.target.value)}
                              className="mt-1 w-full rounded-md border-2 border-black/20 px-2 py-1.5 text-sm focus:border-black focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-[#2A2A2A]/70">
                              Slug
                            </label>
                            <input
                              type="text"
                              value={pending.slug}
                              onChange={(event) => handleTagEditChange(tag.id, 'slug', event.target.value)}
                              className="mt-1 w-full rounded-md border-2 border-black/20 px-2 py-1.5 text-sm focus:border-black focus:outline-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveTagEdit(tag.id)}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#06D6A0] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTagId(null)
                                setTagEdits((prev) => {
                                  const next = { ...prev }
                                  delete next[tag.id]
                                  return next
                                })
                              }}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-[#2A2A2A] shadow-sm transition hover:opacity-90"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#2A2A2A]">{tag.name}</p>
                            <p className="text-xs uppercase tracking-wide text-[#2A2A2A]/60">{tag.slug}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditTag(tag)}
                              className="inline-flex items-center gap-2 rounded-md bg-[#6C63FF] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-md bg-[#FF5252] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete tag?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the &quot;{tag.name}&quot; tag. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={async () => {
                                    await onDeleteTag(tag.id)
                                  }}>
                                    Delete Tag
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
