import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination, StepProgress } from './NavigationPrimitives'

describe('navigation primitives', () => {
  it('exposes current progress and changes pagination', () => {
    const onPageChange = vi.fn()
    render(
      <>
        <StepProgress
          activeId="profile"
          steps={[
            { id: 'account', label: 'Account' },
            { id: 'profile', label: 'Profile' }
          ]}
        />
        <Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />
      </>
    )
    expect(screen.getByText('Profile').closest('li')).toHaveAttribute('aria-current', 'step')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
