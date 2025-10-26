import { test as base, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL
const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD

const shouldRun = Boolean(baseURL && adminEmail && adminPassword)
const test = shouldRun ? base : base.skip

const signIn = async (page: Page) => {
  await page.goto('/login?redirect_to=%2Fadmin')
  await page.getByLabel(/email/i).fill(adminEmail as string)
  await page.getByLabel(/password/i).fill(adminPassword as string)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL('**/admin', { timeout: 15000 })
}

const describeE2E = shouldRun ? base.describe : base.describe.skip

describeE2E('rbac_hardening_v1 admin role manager', () => {
  test('renders role manager dashboard with accessible markup', async ({ page }) => {
    await signIn(page)
    await expect(page.getByRole('heading', { name: /platform role manager/i })).toBeVisible()
    await expect(page.getByRole('searchbox', { name: /search by name or email/i })).toBeVisible()

    const axe = new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .include('[aria-labelledby="role-manager-heading"]')
    const results = await axe.analyze()
    expect(results.violations).toEqual([])
  })
})
