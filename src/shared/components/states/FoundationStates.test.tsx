import { EmptyState } from '@shared/components/states/EmptyState'
import { ErrorState } from '@shared/components/states/ErrorState'
import { OfflineState } from '@shared/components/states/OfflineState'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('foundation states', () => {
  it('renders reusable empty, error and offline semantics', () => {
    render(
      <>
        <EmptyState title="Nothing here" description="A clear empty state." />
        <ErrorState
          title="Could not load"
          description="Try again."
          actionLabel="Retry"
          onAction={vi.fn()}
        />
        <OfflineState />
      </>
    )

    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load')
    expect(screen.getByRole('status')).toHaveTextContent('You are offline')
  })
})
