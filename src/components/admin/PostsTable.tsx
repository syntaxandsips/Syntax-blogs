import React, { useState } from 'react'
import {
  Pencil,
  Trash2,
  Eye,
  ArrowUpRight,
  Calendar,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { AdminPost, PostStatus } from '../../utils/types'

interface PostsTableProps {
  posts: AdminPost[]
  isLoading: boolean
  onEdit: (post: AdminPost) => void
  onDelete: (id: string) => void
  onPublish: (id: string) => void
  onRefresh?: () => void
}

export const PostsTable = ({
  posts,
  isLoading,
  onEdit,
  onDelete,
  onPublish,
  onRefresh,
}: PostsTableProps) => {
  const [activeTab, setActiveTab] = useState<
    'all' | 'draft' | 'scheduled' | 'published'
  >('all')

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'all') return true
    if (activeTab === 'draft') return post.status === PostStatus.DRAFT
    if (activeTab === 'scheduled') return post.status === PostStatus.SCHEDULED
    if (activeTab === 'published') return post.status === PostStatus.PUBLISHED
    return true
  })

  return (
    <div className="bg-white border-3 border-[#2A2A2A]/20 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="p-6 border-b border-[#2A2A2A]/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#2A2A2A]">Manage Posts</h2>
            <p className="text-sm text-gray-500">
              View and manage all your blog content
            </p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-black/10 bg-black px-3 py-2 font-semibold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>
      <div className="p-6 border-b-4 border-black">
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <FilterTab
            label="ALL POSTS"
            isActive={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            color="#6C63FF"
          />
          <FilterTab
            label="DRAFTS"
            isActive={activeTab === 'draft'}
            onClick={() => setActiveTab('draft')}
            color="#FFD166"
          />
          <FilterTab
            label="SCHEDULED"
            isActive={activeTab === 'scheduled'}
            onClick={() => setActiveTab('scheduled')}
            color="#06D6A0"
          />
          <FilterTab
            label="PUBLISHED"
            isActive={activeTab === 'published'}
            onClick={() => setActiveTab('published')}
            color="#FF5252"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 p-12 text-center text-lg font-semibold text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading posts...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-xl font-bold">No posts found</p>
          <p className="text-gray-500 mt-2">Create a new post to get started</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 p-6 md:hidden">
            {filteredPosts.map((post) => {
              const displayDate =
                post.status === PostStatus.SCHEDULED
                  ? formatDateValue(post.scheduledFor)
                  : formatDateValue(post.publishedAt || post.createdAt)

              return (
                <article
                  key={post.id}
                  className="rounded-lg border-2 border-[#2A2A2A]/10 bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-col gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-[#2A2A2A]">{post.title}</h3>
                      <p className="text-sm text-gray-500">
                        {post.excerpt || 'No excerpt provided'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      <span
                        className="inline-flex items-center rounded-md px-3 py-1 text-white"
                        style={{
                          backgroundColor: getCategoryColor(post),
                        }}
                      >
                        {post.categoryName ?? 'Uncategorized'}
                      </span>
                      <StatusBadge status={post.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {displayDate}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views ?? 0} views
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => onEdit(post)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[#6C63FF] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      {post.status !== PostStatus.PUBLISHED && (
                        <button
                          onClick={() => onPublish(post.id)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[#06D6A0] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                          title="Publish"
                        >
                          <ArrowUpRight className="h-4 w-4" /> Publish
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(post.id)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[#FF5252] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="p-4 text-left font-bold">Title</th>
                    <th className="p-4 text-left font-bold">Category</th>
                    <th className="p-4 text-left font-bold">Status</th>
                    <th className="p-4 text-left font-bold">Date</th>
                    <th className="p-4 text-left font-bold">Views</th>
                    <th className="p-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => {
                    const displayDate =
                      post.status === PostStatus.SCHEDULED
                        ? formatDateValue(post.scheduledFor)
                        : formatDateValue(post.publishedAt || post.createdAt)

                    return (
                      <tr
                        key={post.id}
                        className="border-b border-black/10 hover:bg-gray-50"
                      >
                        <td className="max-w-[320px] p-4">
                          <div className="font-bold">{post.title}</div>
                          <div className="max-w-[280px] truncate text-sm text-gray-500">
                            {post.excerpt || 'No excerpt provided'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div
                            className="inline-block rounded-md px-3 py-1 font-bold text-white"
                            style={{
                              backgroundColor: getCategoryColor(post),
                              transform: 'rotate(-2deg)',
                            }}
                          >
                            {post.categoryName ?? 'Uncategorized'}
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={post.status} />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4" />
                            {displayDate}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views ?? 0}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEdit(post)}
                              className="rounded-md bg-[#6C63FF] p-2 text-white transition hover:opacity-90"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            {post.status !== PostStatus.PUBLISHED && (
                              <button
                                onClick={() => onPublish(post.id)}
                                className="rounded-md bg-[#06D6A0] p-2 text-white transition hover:opacity-90"
                                title="Publish"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onDelete(post.id)}
                              className="rounded-md bg-[#FF5252] p-2 text-white transition hover:opacity-90"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface FilterTabProps {
  label: string
  isActive: boolean
  onClick: () => void
  color: string
}

const FilterTab = ({ label, isActive, onClick, color }: FilterTabProps) => {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-bold transition-all duration-200 ${
        isActive
          ? 'border-2 border-[#2A2A2A]/20 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]'
          : 'border-2 border-[#2A2A2A]/20 bg-white hover:bg-gray-50'
      }`}
      style={{
        backgroundColor: isActive ? color : undefined,
      }}
    >
      {label}
    </button>
  )
}

const StatusBadge = ({ status }: { status: PostStatus }) => {
  let bgColor = '#6C63FF'
  let label = 'Unknown'
  if (status === PostStatus.DRAFT) {
    bgColor = '#FFD166'
    label = 'Draft'
  } else if (status === PostStatus.SCHEDULED) {
    bgColor = '#06D6A0'
    label = 'Scheduled'
  } else if (status === PostStatus.PUBLISHED) {
    bgColor = '#FF5252'
    label = 'Published'
  }
  return (
    <span
      className="inline-flex items-center rounded-md px-3 py-1 text-xs font-bold text-white md:text-sm"
      style={{
        backgroundColor: bgColor,
      }}
    >
      {label}
    </span>
  )
}

function getCategoryColor(post: AdminPost): string {
  if (post.accentColor) {
    return post.accentColor
  }

  const colorMap: Record<string, string> = {
    'machine-learning': '#06D6A0',
    'reinforcement-learning': '#FFD166',
    'data-science': '#118AB2',
    'quantum-computing': '#6C63FF',
  }

  if (post.categorySlug && colorMap[post.categorySlug]) {
    return colorMap[post.categorySlug]
  }

  return '#6C63FF'
}

function formatDateValue(dateString?: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
