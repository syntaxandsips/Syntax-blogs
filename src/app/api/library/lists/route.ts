import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mapUserList } from '@/lib/library/mappers'
import { buildLibraryErrorResponse, getLibraryRequestContext } from '@/lib/library/server'
import {
  createListSchema,
  paginationQuerySchema,
  validateWithSchema,
} from '@/lib/library/validation'

export const dynamic = 'force-dynamic'

const LIST_COLUMNS =
  'id, profile_id, title, description, slug, is_public, cover_image_url, item_count, created_at, updated_at'

export async function GET(request: Request) {
  const context = await getLibraryRequestContext()
  if ('response' in context) {
    return context.response
  }

  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  const listsQuerySchema = paginationQuerySchema.extend({
    postId: z.string().uuid().optional(),
  })
  const parsedQuery = listsQuerySchema.safeParse(queryParams)

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsedQuery.error.flatten() },
      { status: 400 },
    )
  }

  const { limit, cursor, postId } = parsedQuery.data

  let builder = context.supabase
    .from('user_lists')
    .select(LIST_COLUMNS)
    .eq('profile_id', context.profileId)
    .order('created_at', { ascending: false })
    .limit(limit ?? 20)

  if (cursor) {
    builder = builder.lt('created_at', cursor)
  }

  const { data, error } = await builder

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to load lists.')
  }

  const lists = (data ?? []).map(mapUserList)

  let membershipMap: Map<string, { itemId: string }> | null = null

  if (postId && lists.length > 0) {
    const { data: membershipData, error: membershipError } = await context.supabase
      .from('list_items')
      .select('id, list_id')
      .eq('post_id', postId)
      .in(
        'list_id',
        lists.map((list) => list.id),
      )

    if (membershipError) {
      return buildLibraryErrorResponse(membershipError, 'Unable to load lists.')
    }

    const membershipRecords = (membershipData ?? []).filter(
      (record): record is { id: string; list_id: string } =>
        typeof record?.id === 'string' && typeof record?.list_id === 'string',
    )

    membershipMap = new Map(
      membershipRecords.map((record) => [record.list_id, { itemId: record.id }]),
    )
  }

  const nextCursor = lists.length === (limit ?? 20) ? lists[lists.length - 1]?.createdAt ?? null : null

  const items = postId
    ? lists.map((list) => ({
        ...list,
        membership: membershipMap?.get(list.id) ?? null,
      }))
    : lists

  return NextResponse.json({ items, nextCursor })
}

export async function POST(request: Request) {
  const context = await getLibraryRequestContext()
  if ('response' in context) {
    return context.response
  }

  const raw = await request.json()
  const validation = await validateWithSchema(createListSchema, raw)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 422 },
    )
  }

  const payload = validation.data

  const { data: existing, error: existingError } = await context.supabase
    .from('user_lists')
    .select('id')
    .eq('profile_id', context.profileId)
    .eq('slug', payload.slug)
    .maybeSingle()

  if (existingError) {
    return buildLibraryErrorResponse(existingError, 'Unable to verify list slug uniqueness.')
  }

  if (existing) {
    return NextResponse.json(
      { error: 'A list with this slug already exists.' },
      { status: 409 },
    )
  }

  const insertPayload = {
    profile_id: context.profileId,
    title: payload.title.trim(),
    description: payload.description?.trim() ?? null,
    slug: payload.slug.trim().toLowerCase(),
    is_public: payload.isPublic ?? false,
    cover_image_url: payload.coverImageUrl ?? null,
  }

  const { data, error } = await context.supabase
    .from('user_lists')
    .insert(insertPayload)
    .select(LIST_COLUMNS)
    .maybeSingle()

  if (error) {
    return buildLibraryErrorResponse(error, 'Unable to create list.')
  }

  if (!data) {
    return NextResponse.json(
      { error: 'List could not be created.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ list: mapUserList(data) }, { status: 201 })
}
