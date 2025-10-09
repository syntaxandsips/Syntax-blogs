import slugify from '@sindresorhus/slugify'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import { createBrowserClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { sanitizeMarkdown } from '@/lib/sanitize-markdown'
import {
  PromptDetail,
  PromptFilters,
  PromptListResponse,
  PromptSummary,
  PromptFilterMetadata,
  CreatePromptPayload,
  PromptCommentTreeNode,
  CreatePromptCommentPayload,
  PromptModel,
} from './types'

const PAGE_SIZE = 12

const selectPromptFields = `
  id,
  slug,
  title,
  description,
  media_type,
  monetization_type,
  is_featured,
  prompt_text,
  negative_prompt,
  parameters,
  difficulty,
  language,
  visibility,
  license,
  published_at,
  created_at,
  updated_at,
  rating,
  upvotes,
  downvotes,
  downloads_count,
  copies_count,
  user:profiles!prompts_user_id_fkey (id, display_name, avatar_url),
  assets:prompt_assets (id, file_url, thumbnail_url, asset_type, display_order, metadata),
  models:prompt_models (is_primary, ai_models (id, display_name, category, version)),
  tags:prompt_tags_junction (prompt_tags (id, name, category)),
  comment_count:prompt_comments(count)
`

type PromptQueryRow = Database['public']['Tables']['prompts']['Row'] & {
  user: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
  assets: Database['public']['Tables']['prompt_assets']['Row'][] | null
  models: Array<{
    is_primary: boolean
    ai_models: Database['public']['Tables']['ai_models']['Row'] | null
  }> | null
  tags: Array<{
    prompt_tags: Database['public']['Tables']['prompt_tags']['Row'] | null
  }> | null
  comment_count: Array<{ count: number | null }> | null
}

const formatPromptSummary = (row: PromptQueryRow): PromptSummary => {
  const models = (row.models ?? [])
    .map((item) => item.ai_models)
    .filter((model): model is Database['public']['Tables']['ai_models']['Row'] => Boolean(model))
    .map((model) => ({
      id: model.id,
      display_name: model.display_name,
      category: model.category,
      version: model.version ?? null,
    }))

  const tags = (row.tags ?? [])
    .map((item) => item.prompt_tags)
    .filter((tag): tag is Database['public']['Tables']['prompt_tags']['Row'] => Boolean(tag))
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      category: tag.category ?? null,
    }))

  const sortedAssets = [...(row.assets ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  )

  const thumbnail = sortedAssets.find((asset) => asset.thumbnail_url || asset.file_url) ?? null
  const commentCount = row.comment_count?.[0]?.count ?? 0

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    mediaType: row.media_type,
    monetizationType: row.monetization_type,
    isFeatured: Boolean(row.is_featured),
    preview: row.prompt_text?.slice(0, 240) ?? '',
    models,
    tags,
    stats: {
      upvotes: row.upvotes ?? 0,
      downloads: row.downloads_count ?? 0,
      copies: row.copies_count ?? 0,
      comments: commentCount ?? 0,
    },
    author: {
      id: row.user?.id ?? '',
      display_name: row.user?.display_name ?? null,
      avatar_url: row.user?.avatar_url ?? null,
    },
    thumbnailUrl: thumbnail?.thumbnail_url ?? thumbnail?.file_url ?? null,
    createdAt: row.created_at,
    difficulty: row.difficulty,
    language: row.language,
    visibility: row.visibility,
    publishedAt: row.published_at,
  }
}

export const getPrompts = async (
  filters: PromptFilters,
  page = 1,
  pageSize = PAGE_SIZE,
  options: { useServiceRole?: boolean } = {},
): Promise<PromptListResponse> => {
  const client = options.useServiceRole ? createServiceRoleClient() : createServerComponentClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let filteredPromptIds: string[] | null = null

  if (filters.modelIds?.length) {
    const { data: rows, error } = await client
      .from('prompt_models')
      .select('prompt_id')
      .in('model_id', filters.modelIds)

    if (error) {
      console.error('Unable to resolve prompt IDs for models', filters.modelIds, error)
    } else {
      filteredPromptIds = Array.from(new Set((rows ?? []).map((row) => row.prompt_id)))
    }
  }

  if (filters.tags?.length) {
    const { data: rows, error } = await client
      .from('prompt_tags_junction')
      .select('prompt_id')
      .in('tag_id', filters.tags)

    if (error) {
      console.error('Unable to resolve prompt IDs for tags', filters.tags, error)
    } else {
      const tagPromptIds = Array.from(new Set((rows ?? []).map((row) => row.prompt_id)))
      filteredPromptIds = filteredPromptIds
        ? filteredPromptIds.filter((id) => tagPromptIds.includes(id))
        : tagPromptIds
    }
  }

  if (filteredPromptIds && filteredPromptIds.length === 0) {
    return { prompts: [], total: 0, page, pageSize }
  }

  let query = client
    .from('prompts')
    .select(selectPromptFields, { count: 'exact' })
    .eq('moderation_status', 'approved')
    .eq('visibility', 'public')

  if (filteredPromptIds && filteredPromptIds.length) {
    query = query.in('id', filteredPromptIds)
  }

  if (filters.mediaTypes?.length) {
    query = query.in('media_type', filters.mediaTypes)
  }

  if (filters.monetization?.length) {
    query = query.in('monetization_type', filters.monetization)
  }

  if (filters.difficulties?.length) {
    query = query.in('difficulty', filters.difficulties)
  }

  if (filters.languages?.length) {
    query = query.in('language', filters.languages)
  }

  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
  }

  if (filters.visibility?.length) {
    query = query.in('visibility', filters.visibility)
  }

  switch (filters.sort) {
    case 'newest':
      query = query.order('published_at', { ascending: false, nullsFirst: false })
      break
    case 'top-rated':
      query = query.order('rating', { ascending: false, nullsFirst: false })
      break
    case 'most-downloaded':
      query = query.order('downloads_count', { ascending: false, nullsFirst: false })
      break
    case 'most-copied':
      query = query.order('copies_count', { ascending: false, nullsFirst: false })
      break
    case 'most-commented':
      query = query.order('comment_count', { referencedTable: 'prompt_comments', ascending: false })
      break
    case 'featured':
      query = query.order('is_featured', { ascending: false }).order('published_at', { ascending: false })
      break
    default:
      query = query.order('published_at', { ascending: false, nullsFirst: false })
      break
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Failed to load prompts', error)
    return { prompts: [], total: 0, page, pageSize }
  }

  const rows = (data ?? []) as unknown as PromptQueryRow[]
  const prompts = rows.map(formatPromptSummary)

  return { prompts, total: count ?? 0, page, pageSize }
}

export const getPromptBySlug = async (slug: string): Promise<PromptDetail | null> => {
  const client = createServerComponentClient()

  const { data, error } = await client
    .from('prompts')
    .select(selectPromptFields)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('Unable to load prompt', slug, error)
    return null
  }

  if (!data) {
    return null
  }

  const summary = formatPromptSummary(data as unknown as PromptQueryRow)

  const related = await client
    .from('prompts')
    .select(selectPromptFields)
    .eq('media_type', data.media_type)
    .neq('id', data.id)
    .limit(4)

  const relatedRows = (related.data ?? []) as unknown as PromptQueryRow[]
  const relatedPrompts = relatedRows.map(formatPromptSummary)

  return {
    ...summary,
    promptText: sanitizeMarkdown(data.prompt_text ?? ''),
    negativePrompt: data.negative_prompt,
    parameters: data.parameters,
    license: data.license,
    assets: (data.assets ?? []) as Database['public']['Tables']['prompt_assets']['Row'][],
    relatedPrompts,
  }
}

type PromptCommentRecord = Database['public']['Tables']['prompt_comments']['Row'] & {
  user: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

const buildCommentTree = (rows: PromptCommentRecord[]): PromptCommentTreeNode[] => {
  const nodes = new Map<string, PromptCommentTreeNode>()
  const roots: PromptCommentTreeNode[] = []

  for (const row of rows) {
    nodes.set(row.id, {
      id: row.id,
      promptId: row.prompt_id,
      content: row.content,
      markdownContent: row.markdown_content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      parentId: row.parent_id,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      isDeleted: row.is_deleted,
      author: row.user
        ? {
            id: row.user.id,
            display_name: row.user.display_name,
            avatar_url: row.user.avatar_url,
          }
        : null,
      replies: [],
    })
  }

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export const getPromptComments = async (promptId: string): Promise<PromptCommentTreeNode[]> => {
  const client = createServerComponentClient()

  const { data, error } = await client
    .from('prompt_comments')
    .select('*, user:profiles!prompt_comments_user_id_fkey(id, display_name, avatar_url)')
    .eq('prompt_id', promptId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Unable to load prompt comments', promptId, error)
    return []
  }

  const rows = (data ?? []) as unknown as PromptCommentRecord[]

  return buildCommentTree(rows)
}

export const createPromptComment = async (
  payload: CreatePromptCommentPayload,
  userId: string,
): Promise<{ id: string }> => {
  const client = createServiceRoleClient()

  const { data, error } = await client
    .from('prompt_comments')
    .insert({
      prompt_id: payload.promptId,
      parent_id: payload.parentId ?? null,
      content: payload.content,
      markdown_content: payload.markdownContent ?? null,
      user_id: userId,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw error ?? new Error('Unable to create comment')
  }

  return { id: data.id }
}

export const getActiveModels = async (): Promise<PromptModel[]> => {
  const client = createServerComponentClient()

  const { data, error } = await client
    .from('ai_models')
    .select('*')
    .eq('is_active', true)
    .order('display_name')

  if (error) {
    console.error('Unable to load model list', error)
    return []
  }

  return data ?? []
}

export const getPromptFilters = async (): Promise<PromptFilterMetadata> => {
  const client = createServerComponentClient()

  const [{ data: promptRows }, { data: tagRows }, { data: modelRows }, { data: promptModelRows }] = await Promise.all([
    client
      .from('prompts')
      .select('id, media_type, monetization_type, difficulty, language')
      .eq('moderation_status', 'approved')
      .eq('visibility', 'public'),
    client
      .from('prompt_tags')
      .select('id, name, category, usage_count')
      .order('usage_count', { ascending: false })
      .limit(50),
    client
      .from('ai_models')
      .select('id, display_name, category')
      .eq('is_active', true)
      .order('display_name'),
    client.from('prompt_models').select('model_id, prompt_id'),
  ])

  const mediaCounts = new Map<Database['public']['Enums']['prompt_media_type'], number>()
  const monetizationCounts = new Map<Database['public']['Enums']['prompt_monetization_type'], number>()
  const difficultyCounts = new Map<Database['public']['Enums']['prompt_difficulty_level'], number>()
  const languageCounts = new Map<string, number>()

  const promptIds = new Set<string>()

  for (const prompt of promptRows ?? []) {
    promptIds.add(prompt.id)
    mediaCounts.set(prompt.media_type, (mediaCounts.get(prompt.media_type) ?? 0) + 1)
    monetizationCounts.set(prompt.monetization_type, (monetizationCounts.get(prompt.monetization_type) ?? 0) + 1)
    difficultyCounts.set(prompt.difficulty, (difficultyCounts.get(prompt.difficulty) ?? 0) + 1)
    languageCounts.set(prompt.language, (languageCounts.get(prompt.language) ?? 0) + 1)
  }

  const modelCounts = new Map<string, Set<string>>()

  for (const row of promptModelRows ?? []) {
    if (!promptIds.has(row.prompt_id)) {
      continue
    }

    const set = modelCounts.get(row.model_id) ?? new Set<string>()
    set.add(row.prompt_id)
    modelCounts.set(row.model_id, set)
  }

  const monetizationBuckets: Array<Database['public']['Enums']['prompt_monetization_type']> = [
    'free',
    'tip-enabled',
    'premium',
  ]

  return {
    mediaTypes: Array.from(mediaCounts.entries()).map(([value, count]) => ({ value, label: value, count })),
    monetization: monetizationBuckets.map((bucket) => ({
      value: bucket,
      label: bucket.replace('-', ' '),
      count: monetizationCounts.get(bucket) ?? 0,
    })),
    models: (modelRows ?? []).map((model) => ({
      value: model.id,
      label: model.display_name,
      category: model.category,
      count: modelCounts.get(model.id)?.size ?? 0,
    })),
    tags: (tagRows ?? []).map((tag) => ({
      value: tag.id,
      label: tag.name,
      count: tag.usage_count ?? 0,
    })),
    difficulties: Array.from(difficultyCounts.entries()).map(([value, count]) => ({
      value: value as Database['public']['Enums']['prompt_difficulty_level'],
      label: value,
      count,
    })),
    languages: Array.from(languageCounts.entries()).map(([value, count]) => ({
      value,
      label: value,
      count,
    })),
  }
}

export const createPrompt = async (payload: CreatePromptPayload, userId: string) => {
  const client = createServiceRoleClient()

  const slugBase = slugify(payload.title)
  let slug = slugBase
  let attempts = 0

  while (attempts < 5) {
    const { data } = await client
      .from('prompts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!data) {
      break
    }

    attempts += 1
    slug = `${slugBase}-${attempts + 1}`
  }

  const { data: prompt, error } = await client
    .from('prompts')
    .insert({
      title: payload.title,
      description: payload.description ?? null,
      prompt_text: payload.promptText,
      negative_prompt: payload.negativePrompt ?? null,
      parameters: payload.parameters ?? null,
      media_type: payload.mediaType,
      monetization_type: payload.monetizationType,
      difficulty: payload.difficulty,
      language: payload.language,
      license: payload.license,
      visibility: payload.visibility,
      price: payload.price ?? null,
      user_id: userId,
      slug,
      moderation_status: 'pending',
    })
    .select('*')
    .single()

  if (error || !prompt) {
    throw error ?? new Error('Unable to create prompt')
  }

  const promptId = prompt.id

  await client
    .from('prompt_models')
    .insert([
      { prompt_id: promptId, model_id: payload.primaryModelId, is_primary: true },
      ...(payload.secondaryModelIds ?? []).map((id) => ({ prompt_id: promptId, model_id: id, is_primary: false })),
    ])

  if (payload.tags?.length) {
    await Promise.all(
      payload.tags.map(async (tag) => {
        const tagName = tag.trim()

        const { data: existing } = await client
          .from('prompt_tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle()

        const tagId = existing?.id
          ? existing.id
          : (
              await client
                .from('prompt_tags')
                .insert({ name: tagName, category: null })
                .select('id')
                .single()
            ).data?.id

        if (!tagId) {
          return
        }

        await client
          .from('prompt_tags_junction')
          .insert({ prompt_id: promptId, tag_id: tagId, added_by: userId })
      }),
    )
  }

  if (payload.assets?.length) {
    await client.from('prompt_assets').insert(
      payload.assets.map((asset) => ({
        prompt_id: promptId,
        file_url: asset.file_url,
        thumbnail_url: asset.thumbnail_url ?? null,
        asset_type: asset.asset_type,
        display_order: asset.display_order ?? 0,
        metadata: asset.metadata ?? null,
      })),
    )
  }

  return promptId
}

export const getBrowserPromptClient = () => createBrowserClient()

