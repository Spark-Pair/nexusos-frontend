import { useNetworkStatus } from '@shared/hooks/useNetworkStatus'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('useNetworkStatus', () => {
  it('reacts to browser connectivity events', () => {
    const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(true)

    online.mockReturnValue(false)
    void act(() => window.dispatchEvent(new Event('offline')))
    expect(result.current).toBe(false)
  })
})
