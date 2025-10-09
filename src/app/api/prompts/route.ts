import { NextResponse } from 'next/server'
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import { createPrompt } from '@/lib/prompt-gallery/queries'
import { createPromptSchema } from '@/lib/prompt-gallery/validation'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = createPromptSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        details: parsed.error.flatten(),
      },
      { status: 422 },
    )
  }

  const authClient = createServerComponentClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in to upload prompts.' }, { status: 401 })
  }

  const serviceClient = createServiceRoleClient()
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found for user.' }, { status: 404 })
  }

  try {
    const promptId = await createPrompt(parsed.data, profile.id)
    return NextResponse.json({ id: promptId }, { status: 201 })
  } catch (error) {
    console.error('Unable to create prompt', error)
    return NextResponse.json({ error: 'Unable to create prompt.' }, { status: 500 })
  }
}

