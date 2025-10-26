import { NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/feature-flags/server'
import { createServerClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const enabled = await isFeatureEnabled('spaces_v1')
  if (!enabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = createServerClient<Database>()
  const { data: space, error } = await supabase
    .from('spaces')
    .select(
      `id, slug, name, description, visibility, feature_flags, banner_image_url,
       created_at, updated_at,
       rules:space_rules(id, title, body, kind, value, position),
       members:space_members(profile_id, status, role_slug)
      `,
    )
    .eq('slug', params.slug)
    .maybeSingle()

  if (error) {
    console.error('[spaces:getBySlug] failed', { error: error.message })
    return NextResponse.json({ error: 'Unable to load space.' }, { status: 500 })
  }

  if (!space) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ space })
}
