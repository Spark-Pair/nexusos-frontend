import { IconButton } from '@shared/components/IconButton'
import { fireEvent, render, screen } from '@testing-library/react'
import { Search } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

describe('IconButton', () => {
  it('requires an accessible label and preserves native button behavior', () => {
    const onClick = vi.fn()
    render(<IconButton label="Search conversations" icon={<Search />} onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Search conversations' })
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
