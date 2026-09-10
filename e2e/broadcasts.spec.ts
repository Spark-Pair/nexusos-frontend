import { expect, test, type Page } from '@playwright/test'

const businessId = '11111111-1111-4111-8111-111111111111'
const customerId = '22222222-2222-4222-8222-222222222222'
const listId = '33333333-3333-4333-8333-333333333333'
const date = '2026-09-08T09:00:00.000Z'

async function setup(page: Page, customer = false) {
  const state = {
    lists: [] as {
      id: string
      businessId: string
      name: string
      customerIds: string[]
      createdAt: string
      updatedAt: string
    }[],
    broadcasts: [] as {
      id: string
      businessId: string
      listId: string
      title: string
      body: string
      imageUrls: string[]
      publishedAt: string
    }[],
    createCalls: 0,
    publishCalls: 0,
    deleteCalls: 0,
    failCreate: false,
    failHistory: false,
    offline: false
  }
  await page.addInitScript(() =>
    sessionStorage.setItem('nexusos-session-token', 'test-business-token')
  )
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()
    if (state.offline) {
      await route.abort('internetdisconnected')
      return
    }
    if (path === '/api/auth/me') {
      await route.fulfill({
        json: {
          data: {
            id: businessId,
            name: 'North Studio',
            username: 'north',
            email: 'studio@example.test',
            phone: '+923001234567',
            account_kind: customer ? 'customer' : 'business',
            phone_verified_at: null,
            is_admin: false
          },
          requires_phone: false
        }
      })
      return
    }
    if (path === '/api/business/customers') {
      await route.fulfill({
        json: { data: [{ id: customerId, name: 'Ayesha Khan', username: 'ayesha' }] }
      })
      return
    }
    if (path === '/api/broadcast-lists' && method === 'GET') {
      await route.fulfill({ json: { data: state.lists } })
      return
    }
    if (path === '/api/broadcast-lists' && method === 'POST') {
      state.createCalls++
      if (state.failCreate) {
        await route.fulfill({
          status: 422,
          json: { message: 'Every recipient must be an accepted customer.' }
        })
        return
      }
      const body = request.postDataJSON() as { name: string; customer_ids: string[] }
      const list = {
        id: listId,
        businessId,
        name: body.name,
        customerIds: body.customer_ids,
        createdAt: date,
        updatedAt: date
      }
      state.lists.push(list)
      await route.fulfill({ status: 201, json: { data: list } })
      return
    }
    if (path === `/api/broadcast-lists/${listId}` && method === 'PUT') {
      const body = request.postDataJSON() as { name: string; customer_ids: string[] }
      state.lists[0] = { ...state.lists[0]!, name: body.name, customerIds: body.customer_ids }
      await route.fulfill({ json: { data: state.lists[0] } })
      return
    }
    if (path === `/api/broadcast-lists/${listId}` && method === 'DELETE') {
      state.deleteCalls++
      state.lists = []
      await route.fulfill({ status: 204 })
      return
    }
    if (path === '/api/broadcasts' && method === 'POST') {
      state.publishCalls++
      const body = request.postDataJSON() as {
        title: string
        body: string
        list_id: string
        image_urls: string[]
      }
      const broadcast = {
        id: '44444444-4444-4444-8444-444444444444',
        businessId,
        listId: body.list_id,
        title: body.title,
        body: body.body,
        imageUrls: body.image_urls,
        publishedAt: date
      }
      state.broadcasts.push(broadcast)
      await route.fulfill({ status: 201, json: { data: broadcast } })
      return
    }
    if (path === '/api/broadcasts' && state.failHistory) {
      await route.fulfill({ status: 503, json: { message: 'History is temporarily unavailable.' } })
      return
    }
    await route.fulfill({ json: { data: path === '/api/broadcasts' ? state.broadcasts : [] } })
  })
  return state
}

test('creates, reloads, edits and publishes to a list through the actual buttons', async ({
  page
}) => {
  const state = await setup(page)
  await page.goto('/business/broadcasts')
  await page.getByRole('button', { name: 'Create list', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Create broadcast list' })
  await dialog.getByLabel('List name', { exact: true }).fill('Regular customers')
  await dialog.getByRole('searchbox', { name: 'Search members' }).fill('ayesha')
  await dialog.getByRole('checkbox', { name: 'Ayesha Khan' }).check()
  await dialog.getByRole('button', { name: 'Create list', exact: true }).click()
  await expect(dialog).toBeHidden()
  expect(state.createCalls).toBe(1)
  expect(state.lists[0]?.customerIds).toEqual([customerId])
  await page.reload()
  await page.getByRole('button', { name: 'Edit Regular customers' }).click()
  await page.getByLabel('List name', { exact: true }).fill('VIP customers')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByRole('button', { name: 'Use list' }).click()
  await page.getByLabel('Title', { exact: true }).fill('A new collection')
  await page.getByLabel('Message', { exact: true }).fill('Our new collection is available today.')
  await page.getByRole('button', { name: 'Publish broadcast' }).click()
  await expect(page.getByText('Broadcast published.', { exact: true })).toBeVisible()
  expect(state.publishCalls).toBe(1)
  expect(state.broadcasts[0]).toMatchObject({
    listId,
    title: 'A new collection',
    body: 'Our new collection is available today.'
  })
  await page.getByRole('tab', { name: 'History' }).click()
  await expect(page.getByRole('heading', { name: 'A new collection' })).toBeVisible()
})

test('retains the list on API failure and allows retry even when history fails', async ({
  page
}) => {
  const state = await setup(page)
  state.failCreate = true
  state.failHistory = true
  await page.goto('/business/broadcasts')
  await page.getByRole('button', { name: 'Create list', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('List name', { exact: true }).fill('My customers')
  await dialog.getByRole('checkbox', { name: 'Ayesha Khan' }).check()
  await dialog.getByRole('button', { name: 'Create list', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('accepted customer')
  await expect(dialog.getByLabel('List name', { exact: true })).toHaveValue('My customers')
  await expect(dialog.getByRole('checkbox', { name: 'Ayesha Khan' })).toBeChecked()
  state.failCreate = false
  state.offline = true
  await dialog.getByRole('button', { name: 'Create list', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText(/fetch|network/i)
  state.offline = false
  await dialog.getByRole('button', { name: 'Create list', exact: true }).click()
  await expect(dialog).toBeHidden()
  expect(state.lists).toHaveLength(1)
})

test('mobile list creation and deletion are usable without horizontal overflow', async ({
  page
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  const state = await setup(page)
  await page.goto('/business/broadcasts')
  await page.getByRole('button', { name: 'Create list', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel('List name', { exact: true })).toBeFocused()
  await dialog.getByLabel('List name', { exact: true }).fill('Future audience')
  await dialog.getByRole('button', { name: 'Create list', exact: true }).click()
  await expect(dialog).toBeHidden()
  expect(state.lists[0]?.customerIds).toEqual([])
  await expect(page.getByRole('button', { name: 'Use list' })).toBeDisabled()
  await page.getByRole('button', { name: 'Delete Future audience' }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(state.deleteCalls).toBe(0)
  await page.getByRole('button', { name: 'Delete Future audience' }).click()
  await page.getByRole('button', { name: 'Delete list', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your audience starts here' })).toBeVisible()
  expect(state.deleteCalls).toBe(1)
  for (const tab of ['Compose', 'History', 'Lists']) {
    await page.getByRole('tab', { name: tab, exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('customer accounts cannot open the business broadcast workspace', async ({ page }) => {
  await setup(page, true)
  await page.goto('/business/broadcasts')
  await expect(page).toHaveURL(/\/app\/chats$/)
  await expect(page.getByRole('heading', { name: 'Broadcasts', exact: true })).toBeHidden()
})

test('reviews broadcast placements at mobile, tablet and desktop widths', async ({
  page
}, testInfo) => {
  const state = await setup(page)
  state.lists = [
    {
      id: listId,
      businessId,
      name: 'Regular customers',
      customerIds: [customerId],
      createdAt: date,
      updatedAt: date
    }
  ]
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/business/broadcasts')
    await page.getByRole('button', { name: 'Use list' }).waitFor()
    await page.screenshot({
      path: testInfo.outputPath(`lists-${width}.png`),
      animations: 'disabled'
    })
    await page.getByRole('button', { name: 'Edit Regular customers' }).click()
    await page.getByRole('checkbox', { name: 'Ayesha Khan' }).waitFor()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`editor-${width}.png`),
      animations: 'disabled'
    })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Use list' }).click()
    await page.getByLabel('Title', { exact: true }).fill('A little update from our studio')
    await page
      .getByLabel('Message', { exact: true })
      .fill('Our new collection is here. Visit us this weekend to see what is new.')
    await page.screenshot({
      path: testInfo.outputPath(`composer-${width}.png`),
      animations: 'disabled',
      fullPage: true
    })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 1440) {
      await page.getByRole('button', { name: 'Use dark mode' }).click()
      await page.screenshot({
        path: testInfo.outputPath('composer-dark.png'),
        animations: 'disabled'
      })
    }
  }
})
