import { expect, test } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL;
const adminEmail = process.env.PLAYWRIGHT_E2E_EMAIL;
const adminPassword = process.env.PLAYWRIGHT_E2E_PASSWORD;

const hasAuthConfig = Boolean(baseURL);

test.describe('Authentication flows', () => {
  test.skip(!hasAuthConfig, 'Set PLAYWRIGHT_TEST_BASE_URL to run authentication E2E tests.');

  test('redirects unauthenticated admin visitors to the login screen', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible();
  });

  test('rejects invalid credentials gracefully', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'nottherightpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByRole('alert')).toContainText(/invalid login/i);
  });

  test('allows an administrator to sign in and sign out', async ({ page }) => {
    test.skip(!(adminEmail && adminPassword), 'Provide PLAYWRIGHT_E2E_EMAIL and PLAYWRIGHT_E2E_PASSWORD to execute admin login tests.');

    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminEmail!);
    await page.fill('input[name="password"]', adminPassword!);
    await page.click('button[type="submit"]');

    await expect(page.getByRole('status')).toContainText(/login successful/i);
    await page.waitForURL('**/admin', { timeout: 15000 });
    await expect(page).toHaveURL(/\/admin/);

    await page.getByRole('button', { name: /log out/i }).click();
    await page.waitForURL('**/admin/login', { timeout: 15000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
