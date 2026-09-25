import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setUnreadCount, useUnreadCount } from './unreadCount'

describe('unread count store', () => {
  beforeEach(() => localStorage.clear())

  it('publishes and persists counts only for the matching account', () => {
    const first = renderHook(() => useUnreadCount('account-one'))
    const second = renderHook(() => useUnreadCount('account-two'))

    act(() => setUnreadCount('account-one', 3))

    expect(first.result.current).toBe(3)
    expect(second.result.current).toBe(0)
    expect(localStorage.getItem('nexusos:account-one:unread-count')).toBe('3')

    first.unmount()
    second.unmount()
    const restored = renderHook(() => useUnreadCount('account-one'))
    expect(restored.result.current).toBe(3)
  })
})
