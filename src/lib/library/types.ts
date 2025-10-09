import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Bookmark,
  Highlight,
  LibraryStats,
  ListItem,
  ReadingHistoryEntry,
  SavedList,
  UserList,
} from '@/utils/types'
import type {
  CreateBookmarkInput,
  CreateHighlightInput,
  CreateListInput,
  CreateListItemInput,
  RecordReadingInput,
  SaveListInput,
  UpdateHighlightInput,
  UpdateListInput,
  UpdateListItemInput,
} from './validation'

export interface AuthenticatedRequestContext {
  supabase: SupabaseClient
  profileId: string
  userId: string
}

export interface LibraryListWithItems extends UserList {
  items: ListItem[]
}

export interface LibraryHighlightGroup {
  color: string
  count: number
}

export interface ReadingTimelinePoint {
  date: string
  minutes: number
}

export interface LibraryStatsResponse {
  stats: LibraryStats
  highlightGroups: LibraryHighlightGroup[]
  readingTimeline: ReadingTimelinePoint[]
}

export type LibraryEntity =
  | UserList
  | ListItem
  | SavedList
  | Highlight
  | ReadingHistoryEntry
  | Bookmark

export type LibraryMutationPayload =
  | CreateListInput
  | UpdateListInput
  | CreateListItemInput
  | UpdateListItemInput
  | SaveListInput
  | CreateHighlightInput
  | UpdateHighlightInput
  | RecordReadingInput
  | CreateBookmarkInput

export interface LibraryApiError {
  error: string
  details?: unknown
  status?: number
}

export interface LibraryPaginatedResponse<T> {
  items: T[]
  nextCursor: string | null
}

export interface LibraryActivityEntry {
  id: string
  type: 'bookmark' | 'highlight' | 'list-item' | 'history'
  title: string
  subtitle?: string
  occurredAt: string
  metadata?: Record<string, string | number | boolean | null | undefined>
}

export interface LibraryActivityFeedResponse {
  activity: LibraryActivityEntry[]
}
