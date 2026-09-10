import { describe, expect, it } from 'vitest'
import { authSessionSchema } from './authApi'

const validAuthResponse = {
  data: {
    id: '5d102070-7343-4da9-86a4-49575d40f7f2',
    name: 'Test User',
    username: 'test-user',
    email: 'test@example.com',
    phone: null,
    account_kind: 'customer',
    phone_verified_at: null,
    is_admin: false
  },
  token: 'test.jwt.token',
  requires_phone: true
} as const

describe('authentication response contract', () => {
  it('parses the shared UUID user contract returned by every successful auth method', () => {
    expect(authSessionSchema.parse(validAuthResponse)).toEqual(validAuthResponse)
  })

  it('rejects a non-UUID NexusOS user ID', () => {
    const result = authSessionSchema.safeParse({
      ...validAuthResponse,
      data: { ...validAuthResponse.data, id: '12345' }
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['data', 'id'])
  })
})
