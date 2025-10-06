import React, { useEffect, useState } from 'react'
import { Calendar, Clock, Loader2 } from 'lucide-react'
import {
  AdminPost,
  CategoryOption,
  PostFormValues,
  PostStatus,
} from '../../utils/types'

interface PostFormProps {
  post: AdminPost | null
  categories: CategoryOption[]
  onSave: (values: PostFormValues) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

export const PostForm = ({
  post,
  categories,
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
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setSlug(post.slug)
      setExcerpt(post.excerpt || '')
      setContent(post.content)
      setCategoryId(post.categoryId || '')
      setAccentColor(post.accentColor || '#6C63FF')
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
      setStatus(PostStatus.DRAFT)
      setPublishDate('')
      setPublishTime('')
    }
  }, [post, categories])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const trimmedTitle = title.trim()
    const trimmedSlug = slug.trim()
    const trimmedContent = content.trim()

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
      status,
      publishedAt,
      scheduledFor,
      authorId: post?.authorId ?? undefined,
    }

    await onSave(values)
  }

  const accentColors = [
    '#6C63FF',
    '#FF5252',
    '#06D6A0',
    '#FFD166',
    '#118AB2',
    '#073B4C',
  ]

  return (
    <div className="bg-white border-4 border-black rounded-md shadow-[8px_8px_0px_0px_rgba(0,0,0)] overflow-hidden">
      <div className="p-6 border-b-4 border-black">
        <h2 className="text-3xl font-black">
          <span className="bg-[#FF5252] text-white px-3 py-1 inline-block transform rotate-1">
            {post ? 'Edit Post' : 'Create Post'}
          </span>
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block font-bold mb-2 text-lg">Title</label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full p-3 border-4 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
              placeholder="Enter post title"
              required
            />
          </div>
          {/* Slug Field */}
          <div>
            <label className="block font-bold mb-2 text-lg">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-3 border-4 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
              placeholder="post-url-slug"
              required
            />
          </div>
          {/* Excerpt Field */}
          <div>
            <label className="block font-bold mb-2 text-lg">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full p-3 border-4 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF] min-h-[80px]"
              placeholder="Brief summary of the post"
            />
          </div>
          {/* Content Field */}
          <div>
            <label className="block font-bold mb-2 text-lg">
              Content (Markdown)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border-4 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF] min-h-[300px] font-mono"
              placeholder="Write your post content in Markdown..."
              required
            />
            <div className="text-sm text-gray-500 mt-2">
              <p>Supports Markdown, code blocks, and YouTube embeds ({'{youtube:VIDEO_ID}'})</p>
              <p className="mt-1">
                <a
                  href="/docs/admin-code-guide.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6C63FF] hover:underline"
                >
                  View the code block guide
                </a> for syntax highlighting and multi-language tabs.
              </p>
            </div>
          </div>
          {/* Category & Accent Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold mb-2 text-lg">Category</label>
              {categories.length === 0 ? (
                <div className="p-3 border-4 border-dashed border-black rounded-md text-sm text-gray-500">
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
                  className="w-full p-3 border-4 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
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
              <label className="block font-bold mb-2 text-lg">
                Accent Color
              </label>
              <div className="flex gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    className={`w-10 h-10 rounded-full border-4 ${accentColor === color ? 'border-black' : 'border-transparent'} accent-color-${color.replace('#', '')}`}
                    aria-label={`Select ${color} as accent color`}
                    title={`Select ${color} as accent color`}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Publishing Options */}
          <div className="border-4 border-black p-4 rounded-md bg-gray-50">
            <h3 className="font-bold text-lg mb-4">Publishing Options</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="draft"
                  name="status"
                  checked={status === PostStatus.DRAFT}
                  onChange={() => setStatus(PostStatus.DRAFT)}
                  className="w-5 h-5"
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
                  className="w-5 h-5"
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
                    className="w-5 h-5"
                  />
                  <label htmlFor="schedule" className="font-bold">
                    Schedule for Later
                  </label>
                </div>
                {status === PostStatus.SCHEDULED && (
                  <div className="ml-7 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 border-4 border-black rounded-md overflow-hidden">
                      <label htmlFor="publish-date" className="sr-only">Publication Date</label>
                      <div className="bg-black text-white p-2">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <input
                        id="publish-date"
                        type="date"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        className="p-2 flex-1 focus:outline-none"
                        required={status === PostStatus.SCHEDULED}
                        aria-label="Publication date"
                        title="Select the publication date"
                        placeholder="Select date"
                      />
                    </div>
                    <div className="flex items-center gap-2 border-4 border-black rounded-md overflow-hidden">
                      <label htmlFor="publish-time" className="sr-only">Publication Time</label>
                      <div className="bg-black text-white p-2">
                        <Clock className="h-5 w-5" />
                      </div>
                      <input
                        id="publish-time"
                        type="time"
                        value={publishTime}
                        onChange={(e) => setPublishTime(e.target.value)}
                        className="p-2 flex-1 focus:outline-none"
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
        <div className="mt-8 space-y-4">
          {formError && (
            <div className="rounded-md border-2 border-red-500/30 bg-red-50 text-red-700 p-3 font-semibold">
              {formError}
            </div>
          )}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 font-bold border-4 border-black rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 font-bold bg-black text-white rounded-md transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)] disabled:opacity-60 disabled:cursor-not-allowed"
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
  )
}
