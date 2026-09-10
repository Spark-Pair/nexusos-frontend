import { expect, test, type Page } from '@playwright/test'

async function expectThemeToggle(page: Page) {
  const root = page.locator('html')
  const startedDark = await root.evaluate((element) => element.classList.contains('dark'))
  const toggle = page.getByRole('button', { name: /Use (dark|light) mode/ })
  await toggle.click()
  if (startedDark) {
    await expect(root).not.toHaveClass(/dark/)
    await expect(toggle).toHaveAccessibleName('Use dark mode')
  } else {
    await expect(root).toHaveClass(/dark/)
    await expect(toggle).toHaveAccessibleName('Use light mode')
  }
}

test('reviews the NexusOS component system', async ({ page }) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await page.goto('/design-system')
  await expect(page).toHaveTitle('NexusOS')
  await expect(
    page.getByRole('heading', { name: /Designed for clarity, built for connection/i })
  ).toBeVisible()

  await expectThemeToggle(page)
  await page.getByRole('combobox', { name: 'City' }).click()
  await expect(page.getByRole('textbox', { name: 'Search City' })).toBeFocused()
  await page.getByRole('textbox', { name: 'Search City' }).fill('Lahore')
  await page.getByRole('option', { name: 'Lahore', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'City' })).toContainText('Lahore')

  await page.getByRole('button', { name: /Business account/i }).click()
  await expect(page.getByRole('button', { name: /Business account/i })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await page.getByText('Schedule request', { exact: true }).click()
  await expect(page.getByLabel('Local date and time')).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Timezone' })).toBeVisible()
  await expect(page.locator('select')).toHaveCount(0)

  await page.getByRole('button', { name: 'Open dialog' }).click()
  await expect(page.getByRole('dialog', { name: 'Confirm order request' })).toBeVisible()
  await expect.poll(() => browserErrors).toEqual([])
})

test('has no horizontal overflow at review viewports', async ({ page }) => {
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 }
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/design-system')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true)
  }
})

test('starts at sign in and protects the chats route', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('heading', { name: 'Sign in to NexusOS' })).toBeVisible()
  await page.goto('/app/chats')
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('heading', { name: 'Sign in to NexusOS' })).toBeVisible()
  await expectThemeToggle(page)
})

test('keeps foundation controls keyboard usable with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/design-system')
  const trigger = page.getByRole('button', { name: 'Open dialog', exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Confirm order request' })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  await page.getByRole('combobox', { name: 'City' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('textbox', { name: 'Search City' })).toBeFocused()
  await page.keyboard.type('Lahore')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('combobox', { name: 'City' })).toContainText('Lahore')
})
