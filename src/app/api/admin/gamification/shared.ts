import { NextResponse } from 'next/server'
import { requireAdmin as requireGlobalAdmin } from '@/lib/auth/require-admin'

export const requireAdmin = async (): Promise<
  | { response: NextResponse }
  | { profile: { id: string; roleSlug: string } }
> => {
  const guard = await requireGlobalAdmin({
    resource: 'admin_gamification',
    action: 'access',
  })

  if (!guard.ok) {
    return { response: guard.response }
  }

  return { profile: { id: guard.profile.id, roleSlug: guard.profile.roleSlug } }
}
