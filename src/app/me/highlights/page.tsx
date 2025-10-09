import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { mapHighlight } from '@/lib/library/mappers'
import { HighlightsViewer } from '@/components/library/HighlightsViewer'

export const dynamic = 'force-dynamic'

const HIGHLIGHT_COLUMNS =
  'id, profile_id, post_id, highlighted_text, note, color, position_start, position_end, is_public, created_at, updated_at, posts(title, slug)'

export default async function HighlightsPage() {
  const supabase = createServerComponentClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/me/highlights')
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
    .from('highlights')
    .select(HIGHLIGHT_COLUMNS)
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Unable to load highlights: ${error.message}`)
  }

  const highlights = (data ?? []).map(mapHighlight)

  return <HighlightsViewer initialHighlights={highlights} />
}
