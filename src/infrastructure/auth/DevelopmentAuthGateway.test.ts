import { DevelopmentAuthGateway } from '@infrastructure/auth/DevelopmentAuthGateway'
import { describe, expect, it } from 'vitest'

describe('DevelopmentAuthGateway', () => {
  it('ignores malformed tab-scoped identity values', () => {
    sessionStorage.setItem('nexusos:demo-identity', 'platform_root')
    const gateway = new DevelopmentAuthGateway('guest', sessionStorage)
    expect(gateway.getSession().identityKey).toBe('guest')
    sessionStorage.removeItem('nexusos:demo-identity')
  })
})
