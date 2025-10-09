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

const sanitizeName = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return slugify(trimmed)
}

const sanitizeDisplayName = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const sanitizeOptionalText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const sanitizeParametersSchema = (value: unknown):
  | Record<string, unknown>
  | null
  | { error: string } => {
  if (!(value ?? false)) {
    return null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return null
    }

    try {
      const parsed = JSON.parse(trimmed)
      return typeof parsed === 'object' && parsed
        ? (parsed as Record<string, unknown>)
        : null
    } catch {
      return { error: 'Parameters schema must be valid JSON.' }
    }
  }

  if (typeof value === 'object') {
    return value as Record<string, unknown>
  }

  return { error: 'Parameters schema must be valid JSON.' }
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

interface RouteContext {
  params: { id: string }
}

export async function PATCH(request: Request, context: RouteContext) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const id = context.params.id
  if (!id) {
    return NextResponse.json({ error: 'Model ID is required.' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const updates: Record<string, unknown> = {}
  const client = createServiceRoleClient()

  if ('name' in body) {
    const name = sanitizeName(body.name)
    if (!name) {
      return NextResponse.json({ error: 'Model name cannot be empty.' }, { status: 400 })
    }
    updates.name = name
  }

  if ('displayName' in body) {
    const displayName = sanitizeDisplayName(body.displayName)
    if (!displayName) {
      return NextResponse.json({ error: 'Display name cannot be empty.' }, { status: 400 })
    }
    updates.display_name = displayName
  }

  if ('family' in body) {
    updates.family = sanitizeOptionalText(body.family)
  }

  if ('provider' in body) {
    updates.provider = sanitizeOptionalText(body.provider)
  }

  if ('version' in body) {
    updates.version = sanitizeOptionalText(body.version)
  }

  if ('description' in body) {
    updates.description = sanitizeOptionalText(body.description)
  }

  if ('iconUrl' in body) {
    updates.icon_url = sanitizeOptionalText(body.iconUrl)
  }

  if ('isActive' in body) {
    updates.is_active = Boolean(body.isActive)
  }

  if ('parametersSchema' in body) {
    const parsed = sanitizeParametersSchema(body.parametersSchema)
    if (parsed && 'error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    updates.parameters_schema = parsed
  }

  if ('categoryId' in body) {
    const rawCategoryId = typeof body.categoryId === 'string' ? body.categoryId.trim() : null
    const categoryResult = await resolveCategory(
      client,
      rawCategoryId && rawCategoryId.length > 0 ? rawCategoryId : null,
    )

    if ('error' in categoryResult) {
      return categoryResult.error
    }

    updates.category_id = categoryResult.categoryId
    updates.category = categoryResult.categoryLabel
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided.' }, { status: 400 })
  }

  const { data, error } = await client
    .from('ai_models')
    .update(updates)
    .eq('id', id)
    .select(MODEL_SELECT)
    .single()

  if (error || !data) {
    const message = error?.message ?? 'Unable to update AI model.'
    const status = message.includes('duplicate key value') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }

  return NextResponse.json({ model: mapModelRecord(data) })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const id = context.params.id
  if (!id) {
    return NextResponse.json({ error: 'Model ID is required.' }, { status: 400 })
  }

  const client = createServiceRoleClient()
  const { error } = await client.from('ai_models').delete().eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: `Unable to delete AI model: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
