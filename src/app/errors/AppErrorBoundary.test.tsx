import { AppErrorBoundary } from '@app/errors/AppErrorBoundary'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

function BrokenChild(): never {
  throw new Error('render failure')
}

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('replaces a failed render with an actionable, data-safe fallback', () => {
    render(
      <AppErrorBoundary>
        <BrokenChild />
      </AppErrorBoundary>
    )

    expect(screen.getByRole('alert')).toHaveTextContent('NexusOS could not load')
    expect(screen.getByRole('button', { name: 'Reload application' })).toBeEnabled()
    expect(screen.getByText(/local data is still on this device/iu)).toBeInTheDocument()
  })
})
