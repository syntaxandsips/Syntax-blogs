import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { mapListItem, mapUserList } from '@/lib/library/mappers'
import { ListDetailView } from '@/components/library/ListDetailView'

export const dynamic = 'force-dynamic'

const LIST_WITH_ITEMS_COLUMNS = `
  id,
  profile_id,
  title,
  description,
  slug,
  is_public,
  cover_image_url,
  item_count,
  created_at,
  updated_at,
  list_items (
    id,
    list_id,
    post_id,
    note,
    position,
    added_at,
    posts (
      id,
      title,
      slug,
      excerpt,
      featured_image_url
    )
  )
`

interface ListDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { id } = await params
  const supabase = createServerComponentClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/me/lists/${id}`)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`Unable to load profile: ${profileError.message}`)
  }

  if (!profile) {
    redirect('/signup')
  }

  const { data, error } = await supabase
    .from('user_lists')
    .select(LIST_WITH_ITEMS_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load list: ${error.message}`)
  }

  if (!data) {
    redirect('/me/lists')
  }

  const list = mapUserList(data)
  const items = ((data as unknown as { list_items?: Array<Record<string, unknown>> }).list_items ?? []).map((item) =>
    mapListItem(item as Parameters<typeof mapListItem>[0]),
  )

  return <ListDetailView list={list} items={items} />
}
