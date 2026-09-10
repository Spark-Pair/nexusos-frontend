import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adminApi } from './adminApi'

describe('admin API', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('loads audit fields and sends an authenticated status change', async () => {
    const user = {
      id: '5d102070-7343-4da9-86a4-49575d40f7f2',
      name: 'Test User',
      username: 'test-user',
      email: 'test@example.com',
      phone: null,
      accountKind: 'customer',
      signupMethod: 'google',
      lastLoginMethod: 'google',
      lastLoginAt: '2026-09-02T10:00:00.000Z',
      isActive: true,
      createdAt: '2026-09-01T10:00:00.000Z',
      deletedAt: null
    }
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [user] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { ...user, isActive: false } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    const users = await adminApi.users('admin-token', 'test')
    expect(users[0]).toMatchObject({
      signupMethod: 'google',
      lastLoginMethod: 'google',
      isActive: true
    })
    const updated = await adminApi.setActive('admin-token', user.id, false)
    expect(updated.isActive).toBe(false)
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      Authorization: 'Bearer admin-token'
    })
  })
})
