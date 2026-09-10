import { Button } from '@shared/components/Button'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Button', () => {
  it('defaults to a non-submitting button and disables repeated loading actions', () => {
    const { rerender } = render(<Button>Continue</Button>)
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('type', 'button')

    rerender(<Button loading>Continue</Button>)
    const loadingButton = screen.getByRole('button', { name: 'Please wait' })
    expect(loadingButton).toBeDisabled()
    expect(loadingButton).toHaveAttribute('aria-busy', 'true')
  })
})
