import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { mapSavedList } from '@/lib/library/mappers'
import { SavedListsPanel } from '@/components/library/SavedListsPanel'

export const dynamic = 'force-dynamic'

const SAVED_COLUMNS = `
  id,
  profile_id,
  list_id,
  saved_at,
  user_lists (
    title,
    description,
    item_count,
    profiles (
      display_name
    )
  )
`

export default async function SavedListsPage() {
  const supabase = createServerComponentClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/me/saved-lists')
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
    .from('saved_lists')
    .select(SAVED_COLUMNS)
    .eq('profile_id', profile.id)
    .order('saved_at', { ascending: false })

  if (error) {
    throw new Error(`Unable to load saved lists: ${error.message}`)
  }

  const savedLists = (data ?? []).map(mapSavedList)

  return <SavedListsPanel savedLists={savedLists} />
}
