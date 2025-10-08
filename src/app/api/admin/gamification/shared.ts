import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server-client'

export const requireAdmin = async (): Promise<
  | { response: NextResponse }
  | { profile: { id: string } }
> => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return {
      response: NextResponse.json({ error: `Unable to load profile: ${error.message}` }, { status: 500 }),
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
