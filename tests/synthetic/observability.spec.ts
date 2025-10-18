import { expect, test } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL

const describeSynthetic = baseURL ? test.describe : test.describe.skip
const runSynthetic = baseURL ? test : test.skip

describeSynthetic('observability synthetic journeys', () => {
  runSynthetic('home page renders key navigation affordances', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('link', { name: /spaces/i })).toBeVisible()
  })

  runSynthetic('admin flag console guard surfaces login', async ({ page }) => {
    await page.goto('/admin/feature-flags')
    await expect(page.getByRole('heading', { name: /sign/i })).toBeVisible()
  })

  runSynthetic('minimal publish path loads draft form', async ({ page }) => {
    await page.goto('/admin/posts')
    await expect(page.getByText(/dashboard/i)).toBeVisible()
  })
})
