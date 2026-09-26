import { AppSidebar } from '@shared/components/AppSidebar'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

describe('AppSidebar', () => {
  it('provides shared brand, role, navigation and footer regions', () => {
    render(
      <MemoryRouter>
        <AppSidebar
          brandHref="/app/chats"
          roleLabel="Business workspace"
          footer={<button type="button">Profile & settings</button>}
        >
          <a href="/app/chats">Chats</a>
        </AppSidebar>
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /NexusOS Business workspace/u })).toHaveAttribute(
      'href',
      '/app/chats'
    )
    expect(screen.getByRole('navigation', { name: 'Workspace' })).toContainElement(
      screen.getByRole('link', { name: 'Chats' })
    )
    expect(screen.getByRole('button', { name: 'Profile & settings' })).toBeInTheDocument()
  })

  it('uses the supplied navigation label', () => {
    render(
      <MemoryRouter>
        <AppSidebar brandHref="/admin/users" roleLabel="Admin panel" navigationLabel="Admin">
          <span>Users</span>
        </AppSidebar>
      </MemoryRouter>
    )

    expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument()
  })
})
