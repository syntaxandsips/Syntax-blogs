import { Database } from '@/lib/supabase/types'

type PromptRow = Database['public']['Tables']['prompts']['Row']

type PromptAssetRow = Database['public']['Tables']['prompt_assets']['Row']

type PromptProfile = {
  id: string
  display_name: string | null
  avatar_url: string | null
}

export interface PromptSummary {
  id: string
  slug: string
  title: string
  description: string | null
  mediaType: PromptRow['media_type']
  monetizationType: PromptRow['monetization_type']
  isFeatured: boolean
  preview: string
  models: Array<
    Pick<
      Database['public']['Tables']['ai_models']['Row'],
      'id' | 'display_name' | 'category' | 'category_id' | 'version' | 'family' | 'provider'
    >
  >
  tags: Array<Pick<Database['public']['Tables']['prompt_tags']['Row'], 'id' | 'name' | 'category'>>
  stats: {
    upvotes: number
    downloads: number
    copies: number
    comments: number
  }
  author: PromptProfile
  thumbnailUrl: string | null
  createdAt: string
  difficulty: PromptRow['difficulty']
  language: string
  visibility: PromptRow['visibility']
  publishedAt: string | null
}

export interface PromptDetail extends PromptSummary {
  promptText: string
  negativePrompt: string | null
  parameters: Record<string, unknown> | null
  license: string
  assets: PromptAssetRow[]
  relatedPrompts: PromptSummary[]
}

export interface PromptCommentTreeNode {
  id: string
  promptId: string
  content: string
  markdownContent: string | null
  createdAt: string
  updatedAt: string
  parentId: string | null
  upvotes: number
  downvotes: number
  isDeleted: boolean
  author: PromptProfile | null
  replies: PromptCommentTreeNode[]
}

export interface PromptFilters {
  mediaTypes?: PromptRow['media_type'][]
  modelIds?: string[]
  monetization?: PromptRow['monetization_type'][]
  difficulties?: PromptRow['difficulty'][]
  dateRange?: {
    from?: string
    to?: string
  }
  languages?: string[]
  query?: string
  tags?: string[]
  visibility?: PromptRow['visibility'][]
  sort?: PromptSortOption
  minRating?: number
  minDownloads?: number
  minUpvoteRatio?: number
}

export type PromptSortOption =
  | 'relevance'
  | 'newest'
  | 'top-rated'
  | 'most-downloaded'
  | 'most-copied'
  | 'most-commented'
  | 'featured'

export interface PromptListResponse {
  prompts: PromptSummary[]
  total: number
  page: number
  pageSize: number
}

export interface CreatePromptPayload {
  title: string
  description?: string
  promptText: string
  negativePrompt?: string
  parameters?: Record<string, unknown>
  mediaType: PromptRow['media_type']
  monetizationType: PromptRow['monetization_type']
  difficulty: PromptRow['difficulty']
  language: string
  license: string
  visibility: PromptRow['visibility']
  price?: number | null
  primaryModelId: string
  secondaryModelIds?: string[]
  tags?: string[]
  assets?: Array<{
    file_url: string
    thumbnail_url?: string | null
    asset_type: Database['public']['Enums']['prompt_asset_type']
    display_order?: number
    metadata?: Record<string, unknown> | null
  }>
}

export interface PromptVotePayload {
  promptId: string
  voteType: Database['public']['Enums']['prompt_vote_type']
}

export interface PromptBookmarkPayload {
  promptId: string
  collectionId?: string
}

export interface PromptCopyPayload {
  promptId: string
}

export interface PromptDownloadPayload {
  promptId: string
}

export interface CreatePromptCommentPayload {
  promptId: string
  parentId?: string
  content: string
  markdownContent?: string
}

export interface PromptFilterMetadata {
  mediaTypes: Array<{ value: PromptRow['media_type']; label: string; count: number }>
  monetization: Array<{ value: PromptRow['monetization_type']; label: string; count: number }>
  models: Array<{ value: string; label: string; count: number; category: string }>
  tags: Array<{ value: string; label: string; count: number }>
  difficulties: Array<{ value: PromptRow['difficulty']; label: string; count: number }>
  languages: Array<{ value: string; label: string; count: number }>
}

export type PromptUploadStep = 1 | 2 | 3 | 4 | 5

export type PromptAssetInput = NonNullable<CreatePromptPayload['assets']>[number]

export type PromptBookmarkCollection = Database['public']['Tables']['prompt_bookmark_collections']['Row']

export type PromptCollection = Database['public']['Tables']['prompt_collections']['Row']

export type PromptCollectionItem = Database['public']['Tables']['prompt_collection_items']['Row']

export type PromptModel = Database['public']['Tables']['ai_models']['Row']

export type PromptTag = Database['public']['Tables']['prompt_tags']['Row']

export type PromptVote = Database['public']['Tables']['prompt_votes']['Row']

export type PromptComment = Database['public']['Tables']['prompt_comments']['Row']

export type PromptDownload = Database['public']['Tables']['prompt_downloads']['Row']

export type PromptCopyEvent = Database['public']['Tables']['prompt_copy_events']['Row']

export interface PromptAnalytics {
  promptId: string
  stats: Array<Database['public']['Tables']['prompt_stats_daily']['Row']>
}

