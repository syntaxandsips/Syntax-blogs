import React from 'react'
import { Eye, Clock, BarChart2, Tags } from 'lucide-react'
import { Post, PostStatus } from '../../utils/types'

interface StatsSectionProps {
  posts: Post[]
}

export const StatsSection = ({ posts }: StatsSectionProps) => {
  const totalViews = posts.reduce((sum, post) => sum + post.views, 0)
  const publishedPosts = posts.filter(
    (post) => post.status === PostStatus.PUBLISHED,
  ).length
  const draftPosts = posts.filter(
    (post) => post.status === PostStatus.DRAFT,
  ).length
  const scheduledPosts = posts.filter(
    (post) => post.status === PostStatus.SCHEDULED,
  ).length

  // Calculate category distribution
  const categoryCount = posts.reduce(
    (acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  const topCategory =
    Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    'None'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Views"
        value={totalViews.toString()}
        icon={<Eye className="h-5 w-5" />}
        color="#6C63FF"
      />
      <StatCard
        title="Published Posts"
        value={`${publishedPosts}/${posts.length}`}
        icon={<BarChart2 className="h-5 w-5" />}
        color="#FF5252"
      />
      <StatCard
        title="Pending Posts"
        value={`${draftPosts} Drafts, ${scheduledPosts} Scheduled`}
        icon={<Clock className="h-5 w-5" />}
        color="#FFD166"
      />
      <StatCard
        title="Top Category"
        value={topCategory.replace('_', ' ')}
        icon={<Tags className="h-5 w-5" />}
        color="#06D6A0"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <div className="bg-white border-3 border-[#2A2A2A]/20 rounded-lg p-6 transform hover:translate-y-[-2px] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-2 rounded-md"
          style={{
            backgroundColor: `${color}20`,
          }}
        >
          <div
            style={{
              color,
            }}
          >
            {icon}
          </div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-[#2A2A2A]">{value}</p>
    </div>
  )
}
