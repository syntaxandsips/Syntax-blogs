import { NextResponse } from 'next/server'
import slugify from '@sindresorhus/slugify'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { AdminModelSummary } from '@/utils/types'

const MODEL_SELECT = `
  id,
  name,
  display_name,
  category,
  category_id,
  version,
  description,
  icon_url,
  parameters_schema,
  family,
  provider,
  is_active,
  created_at,
  updated_at,
  category:ai_model_categories!ai_models_category_id_fkey (
    id,
    name,
    slug,
    accent_color
  )
`

type ModelRecord = {
  id: string
  name: string
  display_name: string
  category: string | null
  category_id: string | null
  version: string | null
  description: string | null
  icon_url: string | null
  parameters_schema: Record<string, unknown> | null
  family: string | null
  provider: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  category?: {
    id: string | null
    name: string | null
    slug: string | null
    accent_color?: string | null
  } | null
}

const mapModelRecord = (record: ModelRecord): AdminModelSummary => ({
  id: record.id as string,
  name: record.name as string,
  displayName: record.display_name as string,
  categoryId: (record.category_id as string | null) ?? null,
  categoryName: (record.category?.name as string | null) ?? null,
  categorySlug: (record.category?.slug as string | null) ?? record.category ?? null,
  family: (record.family as string | null) ?? null,
  provider: (record.provider as string | null) ?? null,
  version: (record.version as string | null) ?? null,
  description: (record.description as string | null) ?? null,
  iconUrl: (record.icon_url as string | null) ?? null,
  parametersSchema: (record.parameters_schema as Record<string, unknown> | null) ?? null,
  isActive: Boolean(record.is_active),
  createdAt: record.created_at as string,
  updatedAt: record.updated_at as string,
})

const getAdminProfile = async (): Promise<
  | { response: NextResponse }
  | { profile: { id: string } }
> => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return {
      response: NextResponse.json(
        { error: `Unable to load profile: ${error.message}` },
        { status: 500 },
      ),
    }
  }

  if (!profile || !profile.is_admin) {
    return {
      response: NextResponse.json(
        { error: 'Forbidden: admin access required.' },
        { status: 403 },
      ),
    }
  }

  return { profile: { id: profile.id } }
}

const sanitizeName = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return trimmed.length > 0 ? slugify(trimmed) : ''
}

const sanitizeDisplayName = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const sanitizeOptionalText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const sanitizeParametersSchema = (value: unknown): Record<string, unknown> | null => {
  if (!value) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
      const parsed = JSON.parse(trimmed)
      return typeof parsed === 'object' && parsed ? (parsed as Record<string, unknown>) : null
    } catch {
      throw new Error('Parameters schema must be valid JSON.')
    }
  }
  if (typeof value === 'object') {
    return value as Record<string, unknown>
  }
  return null
}

const resolveCategory = async (
  client: ReturnType<typeof createServiceRoleClient>,
  categoryId: string | null,
): Promise<
  | { categoryId: string | null; categoryLabel: string }
  | { error: NextResponse }
> => {
  if (!categoryId) {
    return { categoryId: null, categoryLabel: 'uncategorized' }
  }

  const { data, error } = await client
    .from('ai_model_categories')
    .select('id, name, slug')
    .eq('id', categoryId)
    .maybeSingle()

  if (error) {
    return {
      error: NextResponse.json(
        { error: `Unable to load model category: ${error.message}` },
        { status: 500 },
      ),
    }
  }

  if (!data) {
    return {
      error: NextResponse.json(
        { error: 'Model category not found.' },
        { status: 404 },
      ),
    }
  }

  return {
    categoryId: data.id,
    categoryLabel: (data.slug ?? data.name) ?? 'uncategorized',
  }
}

export async function GET() {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const client = createServiceRoleClient()
  const { data, error } = await client
    .from('ai_models')
    .select(MODEL_SELECT)
    .order('display_name')

  if (error) {
    return NextResponse.json(
      { error: `Unable to load AI models: ${error.message}` },
      { status: 500 },
    )
  }

  const models = (data ?? []).map((record) => mapModelRecord(record))
  return NextResponse.json({ models })
}

export async function POST(request: Request) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const body = (await request.json()) as Record<string, unknown>

  const name = sanitizeName(body.name)
  const displayName = sanitizeDisplayName(body.displayName)
  const family = sanitizeOptionalText(body.family)
  const provider = sanitizeOptionalText(body.provider)
  const version = sanitizeOptionalText(body.version)
  const description = sanitizeOptionalText(body.description)
  const iconUrl = sanitizeOptionalText(body.iconUrl)
  const isActive = body.isActive === undefined ? true : Boolean(body.isActive)

  if (!name) {
    return NextResponse.json({ error: 'Model name is required.' }, { status: 400 })
  }

  if (!displayName) {
    return NextResponse.json({ error: 'Display name is required.' }, { status: 400 })
  }

  let parametersSchema: Record<string, unknown> | null = null
  try {
    parametersSchema = sanitizeParametersSchema(body.parametersSchema)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid parameters schema.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const rawCategoryId = typeof body.categoryId === 'string' ? body.categoryId.trim() : null

  const client = createServiceRoleClient()
  const categoryResult = await resolveCategory(client, rawCategoryId && rawCategoryId.length > 0 ? rawCategoryId : null)

  if ('error' in categoryResult) {
    return categoryResult.error
  }

  const { categoryId, categoryLabel } = categoryResult

  const { data, error } = await client
    .from('ai_models')
    .insert({
      name,
      display_name: displayName,
      category: categoryLabel,
      category_id: categoryId,
      family,
      provider,
      version,
      description,
      icon_url: iconUrl,
      parameters_schema: parametersSchema,
      is_active: isActive,
    })
    .select(MODEL_SELECT)
    .single()

  if (error || !data) {
    const message = error?.message ?? 'Unable to create AI model.'
    const status = message.includes('duplicate key value') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }

  return NextResponse.json({ model: mapModelRecord(data) })
}
