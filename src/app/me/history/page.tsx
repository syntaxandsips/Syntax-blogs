import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { mapReadingHistory } from '@/lib/library/mappers'
import { ReadingHistory } from '@/components/library/ReadingHistory'

export const dynamic = 'force-dynamic'

const HISTORY_COLUMNS =
  'id, profile_id, post_id, read_at, read_duration_seconds, scroll_percentage, completed, last_position, created_at, updated_at, posts(title, slug, excerpt, featured_image_url)'

export default async function ReadingHistoryPage() {
  const supabase = createServerComponentClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/me/history')
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
    .from('reading_history')
    .select(HISTORY_COLUMNS)
    .eq('profile_id', profile.id)
    .order('read_at', { ascending: false })

  if (error) {
    throw new Error(`Unable to load reading history: ${error.message}`)
  }

  const history = (data ?? []).map(mapReadingHistory)

  return <ReadingHistory initialHistory={history} />
}
