import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  it('announces status and exposes dismissal', () => {
    const onClose = vi.fn()
    render(
      <Toast title="Saved locally" onClose={onClose}>
        Waiting for synchronization.
      </Toast>
    )
    expect(screen.getByRole('status')).toHaveTextContent('Waiting for synchronization.')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
