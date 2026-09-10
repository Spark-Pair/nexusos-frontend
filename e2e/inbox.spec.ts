import { expect, test, type Page } from '@playwright/test'

const customer = '11111111-1111-4111-8111-111111111111'
const business = '22222222-2222-4222-8222-222222222222'
const chat = '33333333-3333-4333-8333-333333333333'
const broadcast = '44444444-4444-4444-8444-444444444444'
const date = '2026-09-09T08:00:00.000Z'
async function inbox(page: Page) {
  const messages = [
    {
      id: '55555555-5555-4555-8555-555555555555',
      conversationId: chat,
      senderId: business,
      body: 'Our new collection is here. Reply here if you would like to reserve a piece.',
      createdAt: date,
      readAt: date,
      broadcastId: broadcast as string | null,
      title: 'A little update from North Studio',
      imageUrls: [] as string[]
    }
  ]
  const state = {
    messages,
    offline: false,
    denied: false,
    revoked: false,
    sends: [] as string[],
    muted: false,
    archived: false,
    reports: 0,
    authCalls: 0
  }
  const conversation = {
    id: chat,
    customerId: customer,
    businessId: business,
    invitedBy: business,
    status: 'accepted',
    createdAt: date,
    updatedAt: date
  }
  const counterpart = {
    id: business,
    name: 'North Studio',
    username: 'north-studio',
    accountKind: 'business',
    followed: true
  }
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('test-seeded')) {
      sessionStorage.setItem('nexusos-session-token', 'inbox-token')
      sessionStorage.setItem('test-seeded', 'yes')
    }
  })
  await page.route('**/socket.io/**', (route) => route.abort())
  await page.route('**/api/**', async (route) => {
    if (state.offline) {
      await route.abort('internetdisconnected')
      return
    }
    const path = new URL(route.request().url()).pathname
    if (state.revoked) {
      await route.fulfill({ status: 401, json: { message: 'Session expired' } })
      return
    }
    if (path === '/api/auth/me') {
      state.authCalls++
      await route.fulfill({
        json: {
          data: {
            id: customer,
            name: 'Ayesha Khan',
            username: 'ayesha',
            email: 'ayesha@example.test',
            phone: '+923001234567',
            account_kind: 'customer',
            phone_verified_at: date,
            is_admin: false
          },
          requires_phone: false
        }
      })
      return
    }
    if (path === '/api/profile') {
      await route.fulfill({
        json: {
          data: {
            id: customer,
            name: 'Ayesha Khan',
            username: 'ayesha',
            email: 'ayesha@example.test',
            phone: '+923001234567',
            account_kind: 'customer',
            settings: {
              userId: customer,
              bio: '',
              language: 'en',
              showLastSeen: true,
              allowReadReceipts: true,
              allowBroadcasts: true,
              updatedAt: date
            }
          }
        }
      })
      return
    }
    if (path === '/api/conversations') {
      await route.fulfill({
        json: {
          data: [
            {
              ...conversation,
              counterpart,
              lastMessage: messages.at(-1),
              unreadCount: 0,
              muted: state.muted,
              archived: state.archived
            }
          ]
        }
      })
      return
    }
    if (path === '/api/conversations/' + chat) {
      await route.fulfill({ json: { data: { conversation, counterpart, messages } } })
      return
    }
    if (path.endsWith('/messages')) {
      const payload = route.request().postDataJSON() as { body: string; client_id: string }
      state.sends.push(payload.client_id)
      if (state.denied) {
        await route.fulfill({ status: 403, json: { message: 'Connection is no longer accepted.' } })
        return
      }
      let message = messages.find((item) => item.id === payload.client_id)
      if (!message) {
        message = {
          ...messages[0]!,
          id: payload.client_id,
          senderId: customer,
          body: payload.body,
          title: '',
          broadcastId: null,
          createdAt: new Date().toISOString()
        }
        messages.push(message)
      }
      await route.fulfill({ status: 201, json: { data: message } })
      return
    }
    if (path.endsWith('/state') && path.includes('/conversations/')) {
      Object.assign(state, route.request().postDataJSON())
      await route.fulfill({ status: 204 })
      return
    }
    if (path === '/api/broadcasts/' + broadcast + '/state') {
      state.reports++
      await route.fulfill({ status: 204 })
      return
    }
    await route.fulfill({ status: 204 })
  })
  return state
}

for (const width of [1440, 768, 360]) {
  test(`inbox layout and chat actions at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const state = await inbox(page)
    await page.goto('/app/chats')
    await page.getByRole('button', { name: /North Studio/ }).click()
    await expect(
      page.getByRole('heading', { name: 'A little update from North Studio' })
    ).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width < 1024)
      await expect(page.getByRole('complementary', { name: 'Chat inbox' })).toBeHidden()
    await page.screenshot({ path: testInfo.outputPath(`inbox-${width}.png`) })
    await page.getByRole('button', { name: 'Search conversation', exact: true }).click()
    await page
      .getByRole('searchbox', { name: 'Search in this conversation' })
      .fill('not a matching phrase')
    await expect(page.getByText('No matching messages in this conversation.')).toBeVisible()
    await page.getByRole('button', { name: 'Close search' }).click()
    await page.getByRole('button', { name: 'Conversation actions' }).click()
    await page.getByRole('menuitem', { name: 'Mute notifications' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Notifications muted' })).toBeVisible()
    expect(state.muted).toBe(true)
    await page.getByRole('button', { name: 'Contact details', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Contact details' })).toBeVisible()
    await page.getByRole('button', { name: 'Close dialog' }).click()
    await page
      .getByRole('textbox', { name: 'Message', exact: true })
      .fill('Please reserve one for me.')
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    await expect(
      page
        .getByRole('region', { name: 'Conversation with North Studio' })
        .locator('article')
        .getByText('Please reserve one for me.', { exact: true })
    ).toBeVisible()
    expect(state.sends).toHaveLength(1)
    await page.evaluate(() => localStorage.setItem('nexusos-theme', 'dark'))
    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'A little update from North Studio' })
    ).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.screenshot({
      path: testInfo.outputPath(`inbox-${width}-dark.png`),
      animations: 'disabled'
    })
  })
}

test('failed sends expose retry and preserve the original message ID', async ({ page }) => {
  const state = await inbox(page)
  state.denied = true
  await page.goto('/app/chats/' + chat)
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Try this once more')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByText('Not sent', { exact: true })).toBeVisible()
  await expect(page.getByRole('alert').filter({ hasText: 'Message not sent' })).toBeVisible()
  state.denied = false
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByText('Not sent', { exact: true })).toHaveCount(0)
  expect(state.sends).toHaveLength(2)
  expect(state.sends[0]).toBe(state.sends[1])
  expect(state.messages.filter((item) => item.body === 'Try this once more')).toHaveLength(1)
})

test('offline reload keeps cached chat and replays durable messages once on reconnect', async ({
  page,
  context
}) => {
  const state = await inbox(page)
  await page.goto('/app/chats/' + chat)
  await expect(
    page.getByRole('heading', { name: 'A little update from North Studio' })
  ).toBeVisible()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true
        })
      )
  })
  state.offline = true
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(
    page.getByRole('heading', { name: 'A little update from North Studio' })
  ).toBeVisible()
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Saved without internet')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByText('Queued on this device', { exact: true })).toBeVisible()
  expect(state.sends).toHaveLength(0)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Queued on this device', { exact: true })).toBeVisible()
  state.offline = false
  await context.setOffline(false)
  await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(true)
  await expect.poll(() => state.authCalls).toBeGreaterThan(1)
  await expect(page.getByText('Queued on this device', { exact: true })).toHaveCount(0)
  await expect(
    page
      .getByRole('region', { name: 'Conversation with North Studio' })
      .locator('article')
      .getByText('Saved without internet', { exact: true })
  ).toBeVisible()
  expect(state.sends).toHaveLength(1)
  const cachedUrls = await page.evaluate(async () =>
    (
      await Promise.all(
        (await caches.keys()).map(async (name) =>
          (await (await caches.open(name)).keys()).map((item) => item.url)
        )
      )
    ).flat()
  )
  expect(cachedUrls.some((url) => url.includes('/api/'))).toBe(false)
})

test('legacy Updates opens inbox and reporting stays in the conversation', async ({ page }) => {
  const state = await inbox(page)
  await page.goto('/app/updates')
  await expect(page).toHaveURL(/\/app\/chats$/)
  await page.getByRole('button', { name: /North Studio/ }).click()
  await page.getByRole('button', { name: 'Report', exact: true }).click()
  await page.getByRole('button', { name: 'Report broadcast', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Broadcast reported' })).toBeVisible()
  expect(state.reports).toBe(1)
})

test('logout clears actor snapshots and outbox', async ({ page }) => {
  await inbox(page)
  await page.goto('/app/chats/' + chat)
  await expect(
    page.getByRole('heading', { name: 'A little update from North Studio' })
  ).toBeVisible()
  await page.goto('/app/profile')
  await expect(page.getByRole('heading', { name: 'Profile & settings' })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  const count = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('nexusos-inbox-v1')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Unable to open inbox storage'))
    })
    try {
      return await Promise.all(
        ['snapshots', 'identities', 'outbox'].map(
          (table) =>
            new Promise<number>((resolve) => {
              const request = db.transaction(table).objectStore(table).count()
              request.onsuccess = () => resolve(request.result)
            })
        )
      )
    } finally {
      db.close()
    }
  })
  expect(count).toEqual([0, 0, 0])
})
