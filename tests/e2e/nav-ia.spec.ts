import { test as base, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL
const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD

const shouldRun = Boolean(baseURL && adminEmail && adminPassword)
const test = shouldRun ? base : base.skip

const signIn = async (page: Page) => {
  await page.goto('/login?redirect_to=%2F')
  await page.getByLabel(/email/i).fill(adminEmail as string)
  await page.getByLabel(/password/i).fill(adminPassword as string)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForLoadState('networkidle')
}

const describeE2E = shouldRun ? base.describe : base.describe.skip

describeE2E('nav_ia_v1 global navigation', () => {
  test('exposes IA hubs with accessible navigation', async ({ page }) => {
    await signIn(page)
    await page.goto('/')

    const nav = page.getByRole('navigation').first()
    await expect(nav).toBeVisible()

    const hubs = ['Spaces', 'Feeds', 'Events', 'Funding', 'Projects', 'Admin']
    for (const label of hubs) {
      await expect(nav.getByRole('link', { name: new RegExp(`^${label}$`, 'i') })).toBeVisible()
    }

    const axe = new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .include('nav')
    const results = await axe.analyze()
    expect(results.violations).toEqual([])
  })
})
