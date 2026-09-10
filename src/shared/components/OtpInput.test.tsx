import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { OtpInput } from './OtpInput'

function Example() {
  const [value, setValue] = useState('')
  return (
    <>
      <OtpInput value={value} onChange={setValue} />
      <output>{value}</output>
    </>
  )
}

describe('OtpInput', () => {
  it('accepts numeric digits and advances focus', () => {
    render(<Example />)
    const first = screen.getByRole('textbox', { name: 'Digit 1' })
    fireEvent.change(first, { target: { value: '4' } })
    expect(screen.getByRole('textbox', { name: 'Digit 2' })).toHaveFocus()
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})
