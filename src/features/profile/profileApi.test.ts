import { afterEach, describe, expect, it, vi } from 'vitest'
import { profileApi } from './profileApi'

describe('profileApi', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('fills defaults when an older API response has no quiet-hours fields', async () => {
    const data = {
      id: '123e4567-e89b-42d3-a456-426614174000',
      name: 'Test User',
      username: 'test-user',
      email: 'test@example.test',
      phone: null,
      account_kind: 'business',
      settings: {
        userId: '123e4567-e89b-42d3-a456-426614174000',
        bio: '',
        language: 'en',
        showLastSeen: true,
        allowReadReceipts: true,
        allowBroadcasts: true,
        updatedAt: new Date().toISOString()
      }
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ data }) })
    )

    const profile = await profileApi.get('token')

    expect(profile.settings).toMatchObject({
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      timeZone: 'UTC'
    })
  })
})
