import { createClient } from '@supabase/supabase-js'
import { describe, expect, test } from 'vitest'

const supabaseUrl = process.env.RBAC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.RBAC_SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const adminJwt = process.env.RBAC_TEST_ADMIN_JWT
const memberJwt = process.env.RBAC_TEST_MEMBER_JWT

const hasCredentials = Boolean(supabaseUrl && serviceRoleKey && adminJwt && memberJwt)

describe('rbac policy enforcement (requires Supabase test credentials)', () => {
  const testWithCreds = hasCredentials ? test : test.skip

  testWithCreds('organizers/admins can manage taxonomy while members cannot', async () => {
    if (!supabaseUrl || !serviceRoleKey || !adminJwt || !memberJwt) {
      throw new Error('Missing RBAC test credentials')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    await supabase.auth.setSession({ access_token: adminJwt, refresh_token: '' })

    const { data: adminResult, error: adminError } = await supabase
      .from('categories')
      .insert({ name: 'rbac-smoke', slug: 'rbac-smoke' })

    expect(adminError).toBeNull()
    expect(adminResult).not.toBeNull()

    await supabase.auth.setSession({ access_token: memberJwt, refresh_token: '' })

    const { error: memberError } = await supabase
      .from('categories')
      .insert({ name: 'rbac-member', slug: 'rbac-member' })

    expect(memberError).not.toBeNull()
  })
})
