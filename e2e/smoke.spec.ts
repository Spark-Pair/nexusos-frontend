import { expect, test } from '@playwright/test'

test('loads the Phase 1 shell and supports nested and warmed offline refreshes', async ({
  context,
  page
}) => {
  await page.goto('/foundation-health')
  await expect(
    page.getByRole('heading', { name: 'Everything around your business, connected.' })
  ).toBeVisible()
  await expect(page.getByText('Foundation · Phase 1')).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Everything around your business, connected.' })
  ).toBeVisible()

  await page.evaluate(async () => navigator.serviceWorker.ready)
  await context.setOffline(true)
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Everything around your business, connected.' })
  ).toBeVisible()
})
