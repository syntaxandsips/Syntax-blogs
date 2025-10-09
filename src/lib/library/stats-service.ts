import type { SupabaseClient } from '@supabase/supabase-js'
import { mapHighlight, mapReadingHistory } from '@/lib/library/mappers'
import type { Database } from '@/lib/supabase/types'
import type { LibraryStatsResponse } from '@/lib/library/types'

const rangeLookup: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': 365,
}

export type StatsRange = keyof typeof rangeLookup

export const loadLibraryStats = async (
  profileId: string,
  supabase: SupabaseClient<Database>,
  range: StatsRange,
): Promise<LibraryStatsResponse> => {
  const days = rangeLookup[range] ?? rangeLookup['30d']
  const now = new Date()
  const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const rangeStartIso = rangeStart.toISOString()
  const streakWindow = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

  const [
    listsResult,
    bookmarkCountResult,
    highlightCountResult,
    highlightsRangeResult,
    historyCountResult,
    historyEntriesResult,
  ] = await Promise.all([
    supabase.from('user_lists').select('item_count').eq('profile_id', profileId),
    supabase
      .from('bookmarks')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId),
    supabase
      .from('highlights')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId),
    supabase
      .from('highlights')
      .select(
        'color, created_at, profile_id, post_id, highlighted_text, note, position_start, position_end, is_public, updated_at, posts(title, slug)',
      )
      .eq('profile_id', profileId)
      .gte('created_at', rangeStartIso),
    supabase
      .from('reading_history')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId),
    supabase
      .from('reading_history')
      .select(
        'id, profile_id, post_id, read_at, read_duration_seconds, scroll_percentage, completed, last_position, created_at, updated_at, posts(title, slug, excerpt, featured_image_url)',
      )
      .eq('profile_id', profileId)
      .gte('read_at', streakWindow.toISOString()),
  ])

  if (listsResult.error) {
    throw new Error(`Unable to load lists for stats: ${listsResult.error.message}`)
  }

  if (bookmarkCountResult.error) {
    throw new Error(`Unable to load bookmarks for stats: ${bookmarkCountResult.error.message}`)
  }

  if (highlightCountResult.error) {
    throw new Error(`Unable to load highlights for stats: ${highlightCountResult.error.message}`)
  }

  if (highlightsRangeResult.error) {
    throw new Error(`Unable to load highlight breakdown: ${highlightsRangeResult.error.message}`)
  }

  if (historyCountResult.error) {
    throw new Error(`Unable to load reading history for stats: ${historyCountResult.error.message}`)
  }

  if (historyEntriesResult.error) {
    throw new Error(`Unable to load reading history entries: ${historyEntriesResult.error.message}`)
  }

  const lists = (listsResult.data ?? []) as Array<{ item_count?: number | null }>
  const totalLists = lists.length
  const totalListItems = lists.reduce((acc, list) => acc + (list.item_count ?? 0), 0)
  const totalBookmarks = bookmarkCountResult.count ?? 0
  const totalHighlights = highlightCountResult.count ?? 0
  const totalReadingHistory = historyCountResult.count ?? 0

  const highlightGroupsMap = new Map<string, number>()
  for (const record of highlightsRangeResult.data ?? []) {
    const highlight = mapHighlight(record)
    highlightGroupsMap.set(highlight.color, (highlightGroupsMap.get(highlight.color) ?? 0) + 1)
  }

  const highlightGroups = Array.from(highlightGroupsMap.entries()).map(([color, count]) => ({
    color,
    count,
  }))

  const historyEntries = (historyEntriesResult.data ?? []).map(mapReadingHistory)
  const totalReadingTime = historyEntries.reduce(
    (acc, entry) => acc + (entry.readDurationSeconds ?? 0),
    0,
  )

  const readingDays = new Set<string>()
  for (const entry of historyEntries) {
    const day = entry.readAt.slice(0, 10)
    readingDays.add(day)
  }

  let streak = 0
  const currentDay = new Date(now)
  while (true) {
    const dayKey = currentDay.toISOString().slice(0, 10)
    if (readingDays.has(dayKey)) {
      streak += 1
      currentDay.setUTCDate(currentDay.getUTCDate() - 1)
    } else {
      break
    }
  }

  const timelineMap = new Map<string, number>()
  for (const entry of historyEntries) {
    if (entry.readAt < rangeStartIso) {
      continue
    }
    const day = entry.readAt.slice(0, 10)
    const minutes = Math.round(((entry.readDurationSeconds ?? 0) / 60) * 10) / 10
    timelineMap.set(day, (timelineMap.get(day) ?? 0) + minutes)
  }

  const timeline: { date: string; minutes: number }[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = date.toISOString().slice(0, 10)
    timeline.push({ date: key, minutes: timelineMap.get(key) ?? 0 })
  }

  return {
    stats: {
      totalBookmarks,
      totalLists,
      totalListItems,
      totalHighlights,
      totalReadingHistory,
      readingStreak: streak,
      totalReadingTime,
    },
    highlightGroups,
    readingTimeline: timeline,
  }
}
