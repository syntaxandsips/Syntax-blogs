import { test as base, expect, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL
const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD
const supabaseUrl =
  process.env.PLAYWRIGHT_SUPABASE_URL ??
  process.env.RBAC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey =
  process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY ??
  process.env.RBAC_SUPABASE_SERVICE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY

const shouldRun = Boolean(
  baseURL &&
  adminEmail &&
  adminPassword &&
  supabaseUrl &&
  supabaseServiceKey,
)

const test = shouldRun ? base : base.skip
const describeE2E = shouldRun ? base.describe : base.describe.skip

const signIn = async (page: Page) => {
  await page.goto('/login?redirect_to=%2Fadmin')
  await page.getByLabel(/email/i).fill(adminEmail as string)
  await page.getByLabel(/password/i).fill(adminPassword as string)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL('**/admin', { timeout: 15000 })
}

const provisionDraft = async () => {
  const client = createClient(supabaseUrl as string, supabaseServiceKey as string, {
    auth: { persistSession: false },
  })

  const { data: adminUser, error: adminLookupError } = await client.auth.admin.getUserByEmail(
    adminEmail as string,
  )
  if (adminLookupError || !adminUser?.user) {
    throw adminLookupError ?? new Error('Unable to resolve admin user for publish flow test')
  }

  const { data: profileRow, error: profileError } = await client
    .from('profiles')
    .select('id')
    .eq('user_id', adminUser.user.id)
    .maybeSingle<{ id: string }>()
  if (profileError) {
    throw profileError
  }

  const profileId = profileRow?.id ?? crypto.randomUUID()

  if (!profileRow) {
    const { error: insertProfileError } = await client
      .from('profiles')
      .insert({
        id: profileId,
        user_id: adminUser.user.id,
        display_name: adminUser.user.email ?? 'Playwright Admin',
        is_admin: true,
      })
    if (insertProfileError) {
      throw insertProfileError
    }
  }

  const slug = `publish-e2e-${crypto.randomUUID().slice(0, 8)}`
  const title = `Publish Flow Draft ${slug}`

  const { data: insertedPost, error: insertPostError } = await client
    .from('posts')
    .insert({
      title,
      slug,
      content: 'E2E publish draft',
      status: 'draft',
      author_id: profileId,
    })
    .select('id')
    .single()
  if (insertPostError || !insertedPost) {
    throw insertPostError ?? new Error('Unable to insert draft for publish flow test')
  }

  return { postId: insertedPost.id as string, slug, title, client }
}

describeE2E('publish flow telemetry', () => {
  test('publishes draft posts and records trace headers', async ({ page }) => {
    const { postId, title, client } = await provisionDraft()

    try {
      await signIn(page)
      await page.goto('/admin')

      const row = page.getByRole('row', { name: new RegExp(title, 'i') }).first()
      await expect(row).toBeVisible({ timeout: 15000 })

      await row.getByRole('button', { name: /publish/i }).click()
      await expect(page.getByText('Publish this post?', { exact: false })).toBeVisible()

      const publishStart = Date.now()
      const [response] = await Promise.all([
        page.waitForResponse(
          (candidate) =>
            candidate.url().includes(`/api/admin/posts/${postId}`) &&
            candidate.request().method() === 'PATCH',
        ),
        page.getByRole('button', { name: /publish now/i }).click(),
      ])

      const publishDuration = Date.now() - publishStart
      expect(publishDuration).toBeLessThan(8000)

      const traceHeader = response.headers()['traceparent'] ?? response.headers()['x-trace-id']
      expect(traceHeader, 'expected tracing header on publish response').toBeTruthy()

      await expect(page.getByText('Post published successfully.', { exact: false })).toBeVisible()
    } finally {
      await client.from('posts').delete().eq('id', postId)
    }
  })
})
