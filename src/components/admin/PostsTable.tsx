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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              className="inline-flex items-center gap-2 bg-black text-white px-3 py-2 rounded-md font-semibold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>
      <div className="p-6 border-b-4 border-black">
        <div className="flex gap-2 overflow-x-auto pb-2">
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
        <div className="p-12 text-center flex flex-col items-center gap-3 text-lg font-semibold text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading posts...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-xl font-bold">No posts found</p>
          <p className="text-gray-500 mt-2">Create a new post to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black text-white">
                <th className="text-left p-4 font-bold">Title</th>
                <th className="text-left p-4 font-bold">Category</th>
                <th className="text-left p-4 font-bold">Status</th>
                <th className="text-left p-4 font-bold">Date</th>
                <th className="text-left p-4 font-bold">Views</th>
                <th className="text-right p-4 font-bold">Actions</th>
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
                    <td className="p-4">
                      <div className="font-bold">{post.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[300px]">
                        {post.excerpt || 'No excerpt provided'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div
                        className="inline-block px-3 py-1 font-bold text-white rounded-md"
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
                          className="bg-[#6C63FF] text-white p-2 rounded-md hover:opacity-90"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {post.status !== PostStatus.PUBLISHED && (
                          <button
                            onClick={() => onPublish(post.id)}
                            className="bg-[#06D6A0] text-white p-2 rounded-md hover:opacity-90"
                            title="Publish"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(post.id)}
                          className="bg-[#FF5252] text-white p-2 rounded-md hover:opacity-90"
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
      className={`px-4 py-2 font-bold rounded-md transition-all duration-200 whitespace-nowrap ${isActive ? 'text-white border-2 border-[#2A2A2A]/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]' : 'bg-white border-2 border-[#2A2A2A]/20 hover:bg-gray-50'}`}
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
      className="inline-block px-3 py-1 font-bold text-white rounded-md"
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
