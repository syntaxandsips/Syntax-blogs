import { NextResponse } from 'next/server'
import {
  createServerComponentClient,
  createServiceRoleClient,
} from '@/lib/supabase/server-client'

const SETTINGS_KEY = 'admin-dashboard'

interface DashboardSettings {
  newsletterDoubleOptIn: boolean
  newsletterWeeklyDigest: boolean
  commentsAutoApproveMembers: boolean
  commentsNotifyOnNew: boolean
  themeDarkMode: boolean
  themeAccent: string
}

const DEFAULT_SETTINGS: DashboardSettings = {
  newsletterDoubleOptIn: true,
  newsletterWeeklyDigest: true,
  commentsAutoApproveMembers: false,
  commentsNotifyOnNew: true,
  themeDarkMode: false,
  themeAccent: '#6C63FF',
}

interface ProfileRecord {
  id: string
  is_admin: boolean
}

const getAdminProfile = async (): Promise<
  | { profile: ProfileRecord }
  | { response: NextResponse }
> => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
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

const sanitizeSettings = (
  input: unknown,
): DashboardSettings => {
  if (!input || typeof input !== 'object') {
    return DEFAULT_SETTINGS
  }

  const candidate = input as Partial<DashboardSettings>
  return {
    newsletterDoubleOptIn:
      typeof candidate.newsletterDoubleOptIn === 'boolean'
        ? candidate.newsletterDoubleOptIn
        : DEFAULT_SETTINGS.newsletterDoubleOptIn,
    newsletterWeeklyDigest:
      typeof candidate.newsletterWeeklyDigest === 'boolean'
        ? candidate.newsletterWeeklyDigest
        : DEFAULT_SETTINGS.newsletterWeeklyDigest,
    commentsAutoApproveMembers:
      typeof candidate.commentsAutoApproveMembers === 'boolean'
        ? candidate.commentsAutoApproveMembers
        : DEFAULT_SETTINGS.commentsAutoApproveMembers,
    commentsNotifyOnNew:
      typeof candidate.commentsNotifyOnNew === 'boolean'
        ? candidate.commentsNotifyOnNew
        : DEFAULT_SETTINGS.commentsNotifyOnNew,
    themeDarkMode:
      typeof candidate.themeDarkMode === 'boolean'
        ? candidate.themeDarkMode
        : DEFAULT_SETTINGS.themeDarkMode,
    themeAccent:
      typeof candidate.themeAccent === 'string' && candidate.themeAccent.trim().length > 0
        ? candidate.themeAccent.trim()
        : DEFAULT_SETTINGS.themeAccent,
  }
}

export async function GET() {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const serviceClient = createServiceRoleClient()
  const { data, error } = await serviceClient
    .from('site_settings')
    .select('value')
    .eq('settings_key', SETTINGS_KEY)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: `Unable to load settings: ${error.message}` },
      { status: 500 },
    )
  }

  const merged = {
    ...DEFAULT_SETTINGS,
    ...(data?.value && typeof data.value === 'object' ? (data.value as Record<string, unknown>) : {}),
  }

  return NextResponse.json({ settings: sanitizeSettings(merged) })
}

export async function PATCH(request: Request) {
  const result = await getAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const payload = (await request.json().catch(() => ({}))) as {
    settings?: unknown
  }

  const sanitized = sanitizeSettings(payload.settings)

  const serviceClient = createServiceRoleClient()
  const { error } = await serviceClient
    .from('site_settings')
    .upsert(
      {
        settings_key: SETTINGS_KEY,
        value: sanitized,
      },
      { onConflict: 'settings_key' },
    )

  if (error) {
    return NextResponse.json(
      { error: `Unable to save settings: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ message: 'Settings updated successfully.' })
}
