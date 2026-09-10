import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { TabPanel, Tabs } from './Tabs'

function Example() {
  const [active, setActive] = useState('overview')
  return (
    <>
      <Tabs
        label="Profile sections"
        activeId={active}
        onChange={setActive}
        items={[
          { id: 'overview', label: 'Overview' },
          { id: 'orders', label: 'Orders' }
        ]}
      />
      <TabPanel id={active} label="Profile sections">
        {active} content
      </TabPanel>
    </>
  )
}

describe('Tabs', () => {
  it('changes tabs with keyboard arrow navigation', () => {
    render(<Example />)
    const overview = screen.getByRole('tab', { name: 'Overview' })
    overview.focus()
    fireEvent.keyDown(overview, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Orders' })).toHaveFocus()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('orders content')
  })
})
