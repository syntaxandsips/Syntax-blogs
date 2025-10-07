"use client"

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, Image as ImageIcon, Loader2 } from 'lucide-react'
import {
  AdminPost,
  CategoryOption,
  TagOption,
  PostFormValues,
  PostStatus,
} from '../../utils/types'
import { MarkdownEditor } from './MarkdownEditor'
import {
  MediaLibraryDialog,
  type MediaAsset,
} from './MediaLibraryDialog'

interface PostFormProps {
  post: AdminPost | null
  categories: CategoryOption[]
  tags: TagOption[]
  onSave: (values: PostFormValues) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

export const PostForm = ({
  post,
  categories,
  tags,
  onSave,
  onCancel,
  isSaving,
}: PostFormProps) => {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [accentColor, setAccentColor] = useState('#6C63FF')
  const [status, setStatus] = useState<PostStatus>(PostStatus.DRAFT)
  const [publishDate, setPublishDate] = useState('')
  const [publishTime, setPublishTime] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [socialImageUrl, setSocialImageUrl] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false)
  const [mediaContext, setMediaContext] = useState<
    'content' | 'featured' | 'social' | null
  >(null)
  const [pendingMediaInsert, setPendingMediaInsert] = useState<
    ((markdown: string) => void) | null
  >(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setSlug(post.slug)
      setExcerpt(post.excerpt || '')
      setContent(post.content)
      setCategoryId(post.categoryId || '')
      setAccentColor(post.accentColor || '#6C63FF')
      setSeoTitle(post.seoTitle ?? '')
      setSeoDescription(post.seoDescription ?? '')
      setFeaturedImageUrl(post.featuredImageUrl ?? '')
      setSocialImageUrl(post.socialImageUrl ?? '')
      setSelectedTagIds((post.tags ?? []).map((tag) => tag.id))
      setStatus(post.status)
      if (post.status === PostStatus.SCHEDULED && post.scheduledFor) {
        const date = new Date(post.scheduledFor)
        setPublishDate(date.toISOString().split('T')[0])
        setPublishTime(date.toTimeString().split(' ')[0].slice(0, 5))
      } else if (post.publishedAt) {
        const date = new Date(post.publishedAt)
        setPublishDate(date.toISOString().split('T')[0])
        setPublishTime(date.toTimeString().split(' ')[0].slice(0, 5))
      }
    } else {
      setTitle('')
      setSlug('')
      setExcerpt('')
      setContent('')
      setCategoryId(categories[0]?.id ?? '')
      setAccentColor('#6C63FF')
      setSeoTitle('')
      setSeoDescription('')
      setFeaturedImageUrl('')
      setSocialImageUrl('')
      setSelectedTagIds([])
      setStatus(PostStatus.DRAFT)
      setPublishDate('')
      setPublishTime('')
    }
  }, [post, categories])

  useEffect(() => {
    setSelectedTagIds((prev) =>
      prev.filter((tagId) => tags.some((tag) => tag.id === tagId)),
    )
  }, [tags])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!post?.slug) {
      setSlug(generateSlug(newTitle))
    }
  }

  const handleToggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id],
    )
  }

  const handleRequestMedia = (insert: (markdown: string) => void) => {
    setPendingMediaInsert(() => insert)
    setMediaContext('content')
    setIsMediaLibraryOpen(true)
  }

  const handleSelectMedia = (asset: MediaAsset) => {
    if (mediaContext === 'content' && pendingMediaInsert) {
      pendingMediaInsert(`![${asset.name}](${asset.url})`)
    } else if (mediaContext === 'featured') {
      setFeaturedImageUrl(asset.url)
      if (!socialImageUrl) {
        setSocialImageUrl(asset.url)
      }
    } else if (mediaContext === 'social') {
      setSocialImageUrl(asset.url)
    }

    setIsMediaLibraryOpen(false)
    setMediaContext(null)
    setPendingMediaInsert(null)
  }

  const handleOpenFeaturedPicker = () => {
    setPendingMediaInsert(null)
    setMediaContext('featured')
    setIsMediaLibraryOpen(true)
  }

  const handleOpenSocialPicker = () => {
    setPendingMediaInsert(null)
    setMediaContext('social')
    setIsMediaLibraryOpen(true)
  }

  const handleUseFeaturedForSocial = () => {
    if (featuredImageUrl) {
      setSocialImageUrl(featuredImageUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const trimmedTitle = title.trim()
    const trimmedSlug = slug.trim()
    const trimmedContent = content.trim()
    const trimmedSeoTitle = seoTitle.trim()
    const trimmedSeoDescription = seoDescription.trim()
    const trimmedFeaturedImage = featuredImageUrl.trim()
    const trimmedSocialImage = socialImageUrl.trim()

    if (!trimmedTitle || !trimmedSlug || !trimmedContent) {
      setFormError('Title, slug, and content are required.')
      return
    }

    let publishedAt: string | null = post?.publishedAt ?? null
    let scheduledFor: string | null = post?.scheduledFor ?? null

    if (status === PostStatus.SCHEDULED && publishDate) {
      const dateTime = `${publishDate}T${publishTime || '00:00'}`
      scheduledFor = new Date(dateTime).toISOString()
      publishedAt = null
    } else if (status === PostStatus.PUBLISHED) {
      publishedAt = post?.publishedAt ?? new Date().toISOString()
      scheduledFor = null
    } else {
      publishedAt = null
      scheduledFor = null
    }

    const values: PostFormValues = {
      id: post?.id,
      title: trimmedTitle,
      slug: trimmedSlug,
      excerpt: excerpt.trim() || null,
      content: trimmedContent,
      categoryId: categoryId || null,
      accentColor,
      seoTitle: trimmedSeoTitle || null,
      seoDescription: trimmedSeoDescription || null,
      featuredImageUrl: trimmedFeaturedImage || null,
      socialImageUrl: trimmedSocialImage || null,
      tagIds: selectedTagIds,
      status,
      publishedAt,
      scheduledFor,
      authorId: post?.authorId ?? undefined,
    }

    await onSave(values)
  }

  const BRAND_ACCENTS = useMemo(
    () => [
      { value: '#6C63FF', label: 'Synthwave Violet' },
      { value: '#FF5252', label: 'Neon Coral' },
      { value: '#FFD166', label: 'Sundial Amber' },
      { value: '#06D6A0', label: 'Mint Surge' },
      { value: '#118AB2', label: 'Deep Azure' },
      { value: '#073B4C', label: 'Midnight Steel' },
    ],
    [],
  )

  const CATEGORY_ACCENT_PRESETS = useMemo(
    () =>
      [
        {
          keywords: ['data', 'analytics', 'visualization'],
          description: 'Cool blues keep technical stories approachable and crisp.',
          palette: ['#6C63FF', '#118AB2', '#073B4C'],
        },
        {
          keywords: ['ai', 'ml', 'machine', 'neural'],
          description: 'High-contrast tones mirror cutting-edge machine intelligence.',
          palette: ['#FF5252', '#6C63FF', '#FFD166'],
        },
        {
          keywords: ['product', 'design', 'ux', 'ui'],
          description: 'Warm highlights support storytelling around experience and craft.',
          palette: ['#FFD166', '#06D6A0', '#FF5252'],
        },
        {
          keywords: ['culture', 'career', 'community', 'leadership'],
          description: 'Grounded hues emphasise people-first narratives and thought leadership.',
          palette: ['#06D6A0', '#FFD166', '#073B4C'],
        },
      ] as const,
    [],
  )

  const categoryAccent = useMemo(() => {
    const activeCategory = categories.find((cat) => cat.id === categoryId)
    if (!activeCategory) {
      return {
        options: BRAND_ACCENTS,
        description: 'Default brand palette for unpublished content.',
      }
    }

    const normalized = `${activeCategory.slug ?? ''} ${activeCategory.name ?? ''}`.toLowerCase()
    const preset = CATEGORY_ACCENT_PRESETS.find((item) =>
      item.keywords.some((keyword) => normalized.includes(keyword)),
    )

    if (!preset) {
      return {
        options: BRAND_ACCENTS,
        description: 'Signature Syntax & Sips palette.',
      }
    }

    const mappedOptions = preset.palette
      .map((value) => BRAND_ACCENTS.find((accent) => accent.value === value))
      .filter((accent): accent is { value: string; label: string } => Boolean(accent))

    return {
      options: mappedOptions.length > 0 ? mappedOptions : BRAND_ACCENTS,
      description: preset.description,
    }
  }, [BRAND_ACCENTS, CATEGORY_ACCENT_PRESETS, categories, categoryId])

  useEffect(() => {
    if (!categoryAccent.options.some((option) => option.value === accentColor)) {
      setAccentColor(categoryAccent.options[0]?.value ?? '#6C63FF')
    }
  }, [accentColor, categoryAccent.options])

  return (
    <>
      <div className="bg-white border-4 border-black rounded-md shadow-[8px_8px_0px_0px_rgba(0,0,0)] overflow-hidden">
        <div className="border-b-4 border-black p-4 sm:p-6">
          <h2 className="text-2xl font-black sm:text-3xl">
            <span className="inline-block rotate-1 bg-[#FF5252] px-3 py-1 text-white">
              {post ? 'Edit Post' : 'Create Post'}
            </span>
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="mb-2 block text-base font-bold sm:text-lg">Title</label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="w-full rounded-md border-4 border-black p-3 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                placeholder="Enter post title"
                required
              />
            </div>
            {/* Slug Field */}
            <div>
              <label className="mb-2 block text-base font-bold sm:text-lg">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-md border-4 border-black p-3 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                placeholder="post-url-slug"
                required
              />
            </div>
            {/* Excerpt Field */}
            <div>
              <label className="mb-2 block text-base font-bold sm:text-lg">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-[80px] w-full rounded-md border-4 border-black p-3 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                placeholder="Brief summary of the post"
              />
            </div>
            {/* Content Field */}
            <div>
              <label className="mb-2 block text-base font-bold sm:text-lg">
                Content (Markdown)
              </label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your post content in Markdown..."
                onRequestMedia={handleRequestMedia}
              />
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>
                  Use the toolbar to add headings, quotes, code snippets, and multimedia embeds.
                </p>
                <p>
                  Supports YouTube shortcodes ({'{youtube:VIDEO_ID}'}) and our enhanced code block
                  renderer.
                </p>
                <p>
                  <a
                    href="/docs/admin-code-guide.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#6C63FF] hover:underline"
                  >
                    View the code block guide
                  </a>{' '}
                  for syntax highlighting and multi-language tabs.
                </p>
              </div>
            </div>
            {/* Category & Accent Color */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <div>
                <label className="mb-2 block text-base font-bold sm:text-lg">Category</label>
                {categories.length === 0 ? (
                  <div className="rounded-md border-4 border-dashed border-black p-3 text-sm text-gray-500">
                    No categories available. Create categories in Supabase to
                    enable selection.
                  </div>
                ) : (
                  <select
                    id="category-select"
                    aria-label="Select category"
                    title="Select a category for your post"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-md border-4 border-black p-3 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="mb-2 block text-base font-bold sm:text-lg">Tags</label>
                {tags.length === 0 ? (
                  <div className="rounded-md border-4 border-dashed border-black p-3 text-sm text-gray-500">
                    No tags available. Add tags from the Taxonomy manager to unlock topical
                    filtering.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id)
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleTag(tag.id)}
                          className={`rounded-full border-2 px-3 py-1 text-sm font-semibold transition ${
                            isSelected
                              ? 'border-[#6C63FF] bg-[#6C63FF] text-white shadow-sm'
                              : 'border-black/20 bg-white text-[#2A2A2A] hover:border-[#6C63FF] hover:text-[#6C63FF]'
                          }`}
                        >
                          #{tag.name}
                        </button>
                      )
                    })}
                  </div>
                )}
                <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">
                  Tags help readers discover related posts.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-bold sm:text-lg">Accent Color</label>
              <p className="mb-3 text-xs text-gray-500">{categoryAccent.description}</p>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4">
                {categoryAccent.options.map((option) => {
                  const isActive = option.value === accentColor
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAccentColor(option.value)}
                      className={`flex items-center justify-between rounded-md border-3 px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]'
                          : 'border-black/20 bg-white text-[#2A2A2A] hover:border-black/60'
                      }`}
                      aria-pressed={isActive}
                    >
                      <span>{option.label}</span>
                      <span
                        className="h-6 w-6 rounded-full border border-black/20"
                        style={{ backgroundColor: option.value }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-md border-4 border-black bg-white p-4 sm:p-5">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <ImageIcon className="h-5 w-5 text-[#6C63FF]" /> Featured Media
              </h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <div className="space-y-3">
                  <label className="block font-semibold">Featured image URL</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="url"
                      value={featuredImageUrl}
                      onChange={(event) => setFeaturedImageUrl(event.target.value)}
                      placeholder="https://..."
                      className="flex-1 rounded-md border-2 border-black/20 px-3 py-2 focus:border-black focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleOpenFeaturedPicker}
                        className="inline-flex items-center justify-center rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-[1px]"
                      >
                        Library
                      </button>
                      {featuredImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFeaturedImageUrl('')}
                          className="inline-flex items-center justify-center rounded-md border-2 border-red-500/40 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:-translate-y-[1px]"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Displayed as the hero image on the published article.
                  </p>
                  {featuredImageUrl && (
                    <div className="overflow-hidden rounded-md border-2 border-black/10">
                      <img
                        src={featuredImageUrl}
                        alt="Featured preview"
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="block font-semibold">Social preview image</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="url"
                      value={socialImageUrl}
                      onChange={(event) => setSocialImageUrl(event.target.value)}
                      placeholder="https://..."
                      className="flex-1 rounded-md border-2 border-black/20 px-3 py-2 focus:border-black focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleOpenSocialPicker}
                        className="inline-flex items-center justify-center rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-[1px]"
                      >
                        Library
                      </button>
                      <button
                        type="button"
                        onClick={handleUseFeaturedForSocial}
                        className="inline-flex items-center justify-center rounded-md border-2 border-[#6C63FF]/40 bg-[#6C63FF]/10 px-3 py-2 text-sm font-semibold text-[#6C63FF] transition hover:-translate-y-[1px]"
                      >
                        Use featured
                      </button>
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Ideal size 1200×630. Used for Twitter, LinkedIn, and messaging previews.
                  </p>
                  {socialImageUrl && (
                    <div className="overflow-hidden rounded-md border-2 border-black/10">
                      <img
                        src={socialImageUrl}
                        alt="Social preview"
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-md border-4 border-black bg-[#F8F9FF] p-4 sm:p-5">
              <h3 className="mb-4 text-lg font-bold">SEO & Metadata</h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <div>
                  <label className="block font-semibold">Meta title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                    placeholder="Appears in browser tabs and search results"
                    className="mt-1 w-full rounded-md border-2 border-black/20 px-3 py-2 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold">Meta description</label>
                  <textarea
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
                    placeholder="Concise summary (recommended 150-160 characters)"
                    className="mt-1 w-full rounded-md border-2 border-black/20 px-3 py-2 focus:border-black focus:outline-none min-h-[120px]"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">
                If left blank we will reuse the post title and excerpt.
              </p>
            </div>
            {/* Publishing Options */}
            <div className="rounded-md border-4 border-black bg-gray-50 p-4 sm:p-5">
              <h3 className="mb-4 text-lg font-bold">Publishing Options</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="draft"
                    name="status"
                    checked={status === PostStatus.DRAFT}
                    onChange={() => setStatus(PostStatus.DRAFT)}
                    className="h-5 w-5"
                  />
                  <label htmlFor="draft" className="font-bold">
                    Save as Draft
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="publish"
                    name="status"
                    checked={status === PostStatus.PUBLISHED}
                    onChange={() => setStatus(PostStatus.PUBLISHED)}
                    className="h-5 w-5"
                  />
                  <label htmlFor="publish" className="font-bold">
                    Publish Immediately
                  </label>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="schedule"
                      name="status"
                      checked={status === PostStatus.SCHEDULED}
                      onChange={() => setStatus(PostStatus.SCHEDULED)}
                      className="h-5 w-5"
                    />
                    <label htmlFor="schedule" className="font-bold">
                      Schedule for Later
                    </label>
                  </div>
                  {status === PostStatus.SCHEDULED && (
                    <div className="ml-7 mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-2 overflow-hidden rounded-md border-4 border-black">
                        <label htmlFor="publish-date" className="sr-only">
                          Publication Date
                        </label>
                        <div className="bg-black p-2 text-white">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <input
                          id="publish-date"
                          type="date"
                          value={publishDate}
                          onChange={(e) => setPublishDate(e.target.value)}
                          className="flex-1 p-2 focus:outline-none"
                          required={status === PostStatus.SCHEDULED}
                          aria-label="Publication date"
                          title="Select the publication date"
                          placeholder="Select date"
                        />
                      </div>
                      <div className="flex items-center gap-2 overflow-hidden rounded-md border-4 border-black">
                        <label htmlFor="publish-time" className="sr-only">
                          Publication Time
                        </label>
                        <div className="bg-black p-2 text-white">
                          <Clock className="h-5 w-5" />
                        </div>
                        <input
                          id="publish-time"
                          type="time"
                          value={publishTime}
                          onChange={(e) => setPublishTime(e.target.value)}
                          className="flex-1 p-2 focus:outline-none"
                          aria-label="Publication time"
                          title="Select the publication time"
                          placeholder="Select time"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-4 sm:mt-8">
            {formError && (
              <div className="rounded-md border-2 border-red-500/30 bg-red-50 p-3 font-semibold text-red-700">
                {formError}
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border-4 border-black px-6 py-3 font-bold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-black px-6 py-3 font-bold text-white transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : post ? (
                  'Update Post'
                ) : (
                  'Create Post'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      <MediaLibraryDialog
        open={isMediaLibraryOpen}
        onOpenChange={(open) => {
          setIsMediaLibraryOpen(open)
          if (!open) {
            setMediaContext(null)
            setPendingMediaInsert(null)
          }
        }}
        onSelect={handleSelectMedia}
      />
    </>
  )
}
