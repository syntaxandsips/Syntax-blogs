import { NextResponse } from 'next/server'
import {
  createServerComponentClient,
  createServiceRoleClient,
} from '@/lib/supabase/server-client'
import { CommentStatus } from '@/utils/types'

const allowedStatuses = new Set<string>([
  CommentStatus.PENDING,
  CommentStatus.APPROVED,
  CommentStatus.REJECTED,
])

const ensureAdmin = async () => {
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
      response: NextResponse.json(
        { error: `Unable to load profile: ${error.message}` },
        { status: 500 },
      ),
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

  return { profile }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const result = await ensureAdmin()
  if ('response' in result) {
    return result.response
  }

  const body = (await request.json().catch(() => ({}))) as { status?: string }
  const status = body.status

  if (!status || !allowedStatuses.has(status)) {
    return NextResponse.json(
      { error: 'A valid status must be provided.' },
      { status: 422 },
    )
  }

  const serviceClient = createServiceRoleClient()
  const now = new Date().toISOString()

  const update = serviceClient
    .from('comments')
    .update({
      status,
      approved_at: status === CommentStatus.APPROVED ? now : null,
    })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  const { error } = await update

  if (error) {
    return NextResponse.json(
      { error: `Unable to update comment: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ id, status })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const result = await ensureAdmin()
  if ('response' in result) {
    return result.response
  }

  const serviceClient = createServiceRoleClient()
  const { error } = await serviceClient.from('comments').delete().eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: `Unable to delete comment: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ id })
}
