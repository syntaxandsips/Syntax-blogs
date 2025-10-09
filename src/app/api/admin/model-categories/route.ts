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

const sanitizeName = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const sanitizeSlug = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return slugify(value.trim())
  }
  return slugify(fallback)
}

const sanitizeOptionalText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET() {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const client = createServiceRoleClient()
  const { data, error } = await client
    .from('ai_model_categories')
    .select('*')
    .order('name')

  if (error) {
    return NextResponse.json(
      { error: `Unable to load model categories: ${error.message}` },
      { status: 500 },
    )
  }

  const categories = (data ?? []).map((record) => mapCategory(record))
  return NextResponse.json({ categories })
}

export async function POST(request: Request) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const body = (await request.json()) as Record<string, unknown>

  const name = sanitizeName(body.name)
  const slug = sanitizeSlug(body.slug, name)
  const description = sanitizeOptionalText(body.description)
  const accentColor = sanitizeOptionalText(body.accentColor)

  if (!name) {
    return NextResponse.json({ error: 'Category name is required.' }, { status: 400 })
  }

  if (!slug) {
    return NextResponse.json({ error: 'Category slug is required.' }, { status: 400 })
  }

  const client = createServiceRoleClient()
  const { data, error } = await client
    .from('ai_model_categories')
    .insert({
      name,
      slug,
      description,
      accent_color: accentColor,
    })
    .select('*')
    .single()

  if (error || !data) {
    const message = error?.message ?? 'Unable to create model category.'
    const status = message.includes('duplicate key value') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }

  return NextResponse.json({ category: mapCategory(data) })
}
