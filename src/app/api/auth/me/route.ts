import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server-client'
import {
  AuthenticatedProfileResolutionError,
  resolveAuthenticatedProfile,
} from '@/lib/auth/authenticated-profile'

export async function GET() {
  const supabase = createServerClient()

  try {
    const profile = await resolveAuthenticatedProfile(supabase)

    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof AuthenticatedProfileResolutionError) {
      if (error.status === 401 || error.status === 404) {
        return NextResponse.json({ error: error.message }, { status: error.status })
      }

      console.error('Unable to load authenticated profile', error)
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Unexpected error while resolving authenticated profile', error)
    return NextResponse.json(
      { error: 'Unexpected error while resolving authenticated profile.' },
      { status: 500 },
    )
  }
}
