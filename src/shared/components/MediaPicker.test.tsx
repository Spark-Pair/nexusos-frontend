import { MediaPicker } from '@shared/components/MediaPicker'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('MediaPicker', () => {
  it('keeps selected media explicitly local and allows removal', () => {
    const onChange = vi.fn()
    render(<MediaPicker label="Broadcast media" onChange={onChange} />)
    const file = new File(['preview'], 'arrival.webp', { type: 'image/webp' })

    fireEvent.change(screen.getByLabelText('Broadcast media'), { target: { files: [file] } })

    expect(screen.getByText('arrival.webp')).toBeInTheDocument()
    expect(screen.getByText('Selected locally')).toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith([file])

    fireEvent.click(screen.getByRole('button', { name: 'Remove arrival.webp' }))
    expect(screen.queryByText('arrival.webp')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('rejects a file above the configured local limit', () => {
    render(<MediaPicker label="Product image" maxSizeMb={1} />)
    const oversized = new File([new Uint8Array(1_048_577)], 'large.png', { type: 'image/png' })

    fireEvent.change(screen.getByLabelText('Product image'), { target: { files: [oversized] } })

    expect(screen.queryByText('large.png')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show Product image error' })).toBeInTheDocument()
  })
})
