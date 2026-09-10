import { SchedulePicker } from '@shared/components/SchedulePicker'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('SchedulePicker', () => {
  it('reveals scheduling fields without using a native select', () => {
    const onChange = vi.fn()
    const { container } = render(<SchedulePicker onChange={onChange} />)

    fireEvent.click(screen.getByLabelText('Schedule request'))

    expect(screen.getByLabelText('Local date and time')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Timezone' })).toBeInTheDocument()
    expect(container.querySelector('select')).toBeNull()
    expect(onChange).toHaveBeenCalledWith({ mode: 'scheduled', timezone: 'Asia/Karachi' })
    expect(screen.getByText(/creates a delivery request only/i)).toBeInTheDocument()
  })
})
