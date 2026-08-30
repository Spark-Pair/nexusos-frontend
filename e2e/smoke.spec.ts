import { expect, test } from '@playwright/test'

test('loads role-isolated Phase 2 shells and supports nested and warmed offline refreshes', async ({
  context,
  page
}) => {
  await page.goto('/')
  await page.getByLabel('Development identity').selectOption('customer')
  await expect(page.getByRole('heading', { name: 'Discover' })).toBeVisible()
  await page.getByRole('link', { name: 'Orders' }).first().click()
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()

  await page.evaluate(async () => navigator.serviceWorker.ready)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()
})

test('keeps business and platform navigation separated', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Development identity').selectOption('business_owner')
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Campaigns' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Discover' })).not.toBeVisible()

  await page.getByRole('button', { name: 'Demo Business Owner' }).click()
  await page.getByLabel('Development identity').selectOption('platform_admin')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('banner').getByText('Platform Administration')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Campaigns' })).not.toBeVisible()
})
