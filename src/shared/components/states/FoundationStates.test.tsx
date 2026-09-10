import { ConflictState } from '@shared/components/states/ConflictState'
import { EmptyState } from '@shared/components/states/EmptyState'
import { ErrorState } from '@shared/components/states/ErrorState'
import { OfflineState } from '@shared/components/states/OfflineState'
import { PermissionDeniedState } from '@shared/components/states/PermissionDeniedState'
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
        <ConflictState />
        <PermissionDeniedState />
      </>
    )

    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument()
    expect(screen.getByText('Could not load').closest('[role="alert"]')).toBeInTheDocument()
    expect(screen.getByText('You are offline').closest('[role="status"]')).toBeInTheDocument()
    expect(screen.getByText('Changes need review')).toBeInTheDocument()
    expect(screen.getByText('Permission required')).toBeInTheDocument()
  })
})
