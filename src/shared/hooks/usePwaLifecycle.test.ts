import { usePwaLifecycle } from '@shared/hooks/usePwaLifecycle'
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('usePwaLifecycle', () => {
  it('removes browser installation listeners when the owning shell unmounts', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => usePwaLifecycle())

    const promptRegistration = add.mock.calls.find(([type]) => type === 'beforeinstallprompt')
    const installedRegistration = add.mock.calls.find(([type]) => type === 'appinstalled')
    expect(promptRegistration).toBeDefined()
    expect(installedRegistration).toBeDefined()
    unmount()
    expect(remove).toHaveBeenCalledWith('beforeinstallprompt', promptRegistration?.[1])
    expect(remove).toHaveBeenCalledWith('appinstalled', installedRegistration?.[1])
  })
})
