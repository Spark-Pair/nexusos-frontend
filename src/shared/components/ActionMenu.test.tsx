import { fireEvent, render, screen } from '@testing-library/react'
import { Eye } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { ActionMenu } from './ActionMenu'

describe('ActionMenu', () => {
  it('opens, invokes an action and closes', () => {
    const onAction = vi.fn()
    render(
      <ActionMenu items={[{ id: 'view', label: 'View details', icon: Eye }]} onAction={onAction} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'View details' }))
    expect(onAction).toHaveBeenCalledWith('view')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
