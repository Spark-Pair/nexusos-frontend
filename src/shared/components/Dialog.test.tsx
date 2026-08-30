import { Dialog } from '@shared/components/Dialog'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

function Fixture() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      <Dialog
        open={open}
        title="Accessible dialog"
        initialFocusSelector='[aria-label="Initial field"]'
        onClose={() => setOpen(false)}
      >
        <input aria-label="Initial field" />
        <button>Last action</button>
      </Dialog>
    </>
  )
}

describe('Dialog', () => {
  it('focuses requested content, locks body scroll, and restores both on Escape', () => {
    render(<Fixture />)
    const trigger = screen.getByRole('button', { name: 'Open dialog' })
    trigger.focus()
    fireEvent.click(trigger)

    expect(screen.getByRole('textbox', { name: 'Initial field' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
    expect(trigger).toHaveFocus()
  })
})
