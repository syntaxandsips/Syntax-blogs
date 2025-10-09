import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import type { AuthenticatedRequestContext } from './types'

interface ProfileRecord {
  id: string
  display_name: string | null
}

export const getLibraryRequestContext = async (): Promise<
  | ({ profile: ProfileRecord } & AuthenticatedRequestContext)
  | { response: NextResponse }
> => {
  const supabase = createServerComponentClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 },
      ),
    }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name')
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

  if (!profile) {
    return {
      response: NextResponse.json(
        { error: 'Profile not found.' },
        { status: 404 },
      ),
    }
  }

  return {
    supabase: supabase as unknown as SupabaseClient<Database>,
    profileId: profile.id,
    userId: user.id,
    profile,
  }
}

export const buildLibraryErrorResponse = (
  error: unknown,
  fallback = 'An unexpected error occurred.',
  status = 500,
) => {
  const message = error instanceof Error ? error.message : fallback
  return NextResponse.json({ error: message }, { status })
}
