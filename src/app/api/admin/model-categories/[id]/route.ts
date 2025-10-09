import { NextResponse } from 'next/server'
import slugify from '@sindresorhus/slugify'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { AdminModelCategory } from '@/utils/types'

const mapCategory = (record: {
  id: string
  name: string
  slug: string
  description: string | null
  accent_color: string | null
  created_at: string
  updated_at: string
}): AdminModelCategory => ({
  id: record.id,
  name: record.name,
  slug: record.slug,
  description: record.description ?? null,
  accentColor: record.accent_color ?? null,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
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
  return trimmed.length > 0 ? trimmed : null
}

const sanitizeSlug = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? slugify(trimmed) : null
}

const sanitizeOptionalText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 })
  }

  const body = (await request.json()) as Record<string, unknown>

  const updates: Record<string, unknown> = {}

  const name = sanitizeName(body.name)
  if (name !== null) {
    updates.name = name
  }

  const slug = sanitizeSlug(body.slug)
  if (slug !== null) {
    updates.slug = slug
  }

  if ('description' in body) {
    updates.description = sanitizeOptionalText(body.description)
  }

  if ('accentColor' in body) {
    updates.accent_color = sanitizeOptionalText(body.accentColor)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided.' }, { status: 400 })
  }

  const client = createServiceRoleClient()
  const { data, error } = await client
    .from('ai_model_categories')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    const message = error?.message ?? 'Unable to update model category.'
    const status = message.includes('duplicate key value') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }

  return NextResponse.json({ category: mapCategory(data) })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 })
  }

  const client = createServiceRoleClient()
  const { error } = await client.from('ai_model_categories').delete().eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: `Unable to delete model category: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
