import { Combobox } from '@shared/components/Combobox'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('Combobox', () => {
  it('filters and selects an option without a native select element', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <Combobox
        label="City"
        value="karachi"
        onChange={onChange}
        options={[
          { value: 'karachi', label: 'Karachi' },
          { value: 'lahore', label: 'Lahore' },
          { value: 'islamabad', label: 'Islamabad' }
        ]}
      />
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'City' }))
    const input = screen.getByRole('textbox', { name: 'Search City' })
    await waitFor(() => expect(input).toHaveFocus())
    fireEvent.change(input, { target: { value: 'lah' } })
    expect(screen.getByRole('option', { name: 'Lahore' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Karachi' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: 'Lahore' }))
    expect(onChange).toHaveBeenCalledWith('lahore')
    expect(container.querySelector('select')).not.toBeInTheDocument()
  })
})
