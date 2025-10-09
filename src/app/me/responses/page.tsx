import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { ResponsesPanel } from '@/components/library/ResponsesPanel'

export const dynamic = 'force-dynamic'

export default async function ResponsesPage() {
  const supabase = createServerComponentClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/me/responses')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`)
  }

  if (!profile) {
    redirect('/signup')
  }

  // TODO: integrate comment analytics once available.
  return <ResponsesPanel responsesCount={0} />
}
