import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { mapUserList } from '@/lib/library/mappers'
import { ListsManager } from '@/components/library/ListsManager'

export const dynamic = 'force-dynamic'

const LIST_COLUMNS =
  'id, profile_id, title, description, slug, is_public, cover_image_url, item_count, created_at, updated_at'

export default async function ListsPage() {
  const supabase = createServerComponentClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/me/lists')
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
    .select(LIST_COLUMNS)
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Unable to load lists: ${error.message}`)
  }

  const lists = (data ?? []).map(mapUserList)

  return <ListsManager initialLists={lists} />
}
