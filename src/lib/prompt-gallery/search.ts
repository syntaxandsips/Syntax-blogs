import { Database } from '@/lib/supabase/types'
import { PromptFilters, PromptSortOption } from './types'

type ArrayMember<T> = T extends Array<infer U> ? U : never

const arrayParam = (value?: string | string[]): string[] | undefined => {
  if (!value) return undefined
  if (Array.isArray(value)) return value.flatMap((item) => item.split(',').filter(Boolean))
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

const filterEnumValues = <T extends string>(
  values: string[] | undefined,
  allowed: readonly T[],
): T[] | undefined => {
  if (!values?.length) {
    return undefined
  }

  const filtered = values.filter((value): value is T => (allowed as readonly string[]).includes(value))
  return filtered.length ? filtered : undefined
}

const MEDIA_TYPES: readonly Database['public']['Enums']['prompt_media_type'][] = [
  'image',
  'video',
  'text',
  'audio',
  '3d',
  'workflow',
]

const MONETIZATION_TYPES: readonly Database['public']['Enums']['prompt_monetization_type'][] = [
  'free',
  'tip-enabled',
  'premium',
]

const DIFFICULTY_LEVELS: readonly Database['public']['Enums']['prompt_difficulty_level'][] = [
  'beginner',
  'intermediate',
  'advanced',
]

const VISIBILITY_VALUES: readonly Database['public']['Enums']['prompt_visibility'][] = [
  'public',
  'unlisted',
  'draft',
]

const numberParam = (value?: string): number | undefined => {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const floatParam = (value?: string): number | undefined => {
  if (!value) return undefined
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const parsePromptFilters = (searchParams: Record<string, string | string[] | undefined>): PromptFilters => {
  const sort = searchParams.sort as PromptSortOption | undefined

  return {
    mediaTypes: filterEnumValues<ArrayMember<PromptFilters['mediaTypes']>>(arrayParam(searchParams.media), MEDIA_TYPES),
    modelIds: arrayParam(searchParams.models),
    monetization: filterEnumValues<ArrayMember<PromptFilters['monetization']>>(arrayParam(searchParams.monetization), MONETIZATION_TYPES),
    difficulties: filterEnumValues<ArrayMember<PromptFilters['difficulties']>>(arrayParam(searchParams.difficulty), DIFFICULTY_LEVELS),
    languages: arrayParam(searchParams.language),
    tags: arrayParam(searchParams.tags),
    visibility: filterEnumValues<ArrayMember<PromptFilters['visibility']>>(arrayParam(searchParams.visibility), VISIBILITY_VALUES),
    query: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    sort: sort ?? 'relevance',
    minDownloads: numberParam(typeof searchParams.minDownloads === 'string' ? searchParams.minDownloads : undefined),
    minUpvoteRatio: floatParam(typeof searchParams.minUpvoteRatio === 'string' ? searchParams.minUpvoteRatio : undefined),
    minRating: floatParam(typeof searchParams.minRating === 'string' ? searchParams.minRating : undefined),
  }
}

export const serializePromptFilters = (filters: PromptFilters, page: number): URLSearchParams => {
  const params = new URLSearchParams()

  if (filters.mediaTypes?.length) {
    params.set('media', filters.mediaTypes.join(','))
  }

  if (filters.modelIds?.length) {
    params.set('models', filters.modelIds.join(','))
  }

  if (filters.monetization?.length) {
    params.set('monetization', filters.monetization.join(','))
  }

  if (filters.difficulties?.length) {
    params.set('difficulty', filters.difficulties.join(','))
  }

  if (filters.languages?.length) {
    params.set('language', filters.languages.join(','))
  }

  if (filters.tags?.length) {
    params.set('tags', filters.tags.join(','))
  }

  if (filters.visibility?.length) {
    params.set('visibility', filters.visibility.join(','))
  }

  if (filters.query) {
    params.set('q', filters.query)
  }

  if (filters.sort) {
    params.set('sort', filters.sort)
  }

  if (typeof filters.minDownloads === 'number') {
    params.set('minDownloads', String(filters.minDownloads))
  }

  if (typeof filters.minUpvoteRatio === 'number') {
    params.set('minUpvoteRatio', String(filters.minUpvoteRatio))
  }

  if (typeof filters.minRating === 'number') {
    params.set('minRating', String(filters.minRating))
  }

  params.set('page', String(page))

  return params
}

