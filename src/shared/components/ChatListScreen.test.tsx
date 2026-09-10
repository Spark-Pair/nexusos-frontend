import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ChatListScreen, type ChatPreview } from './ChatListScreen'

const conversations: ChatPreview[] = [
  {
    id: 'one',
    name: 'Studio One',
    message: 'Preview ready',
    time: '10:42',
    unreadCount: 2,
    category: 'unread'
  },
  {
    id: 'two',
    name: 'Craft House',
    message: 'Archived preview',
    time: 'Sun',
    unreadCount: 0,
    category: 'archived'
  }
]

function renderScreen(overrides: Partial<ComponentProps<typeof ChatListScreen>> = {}) {
  const props: ComponentProps<typeof ChatListScreen> = {
    activeTab: 'chats',
    conversations,
    filter: 'all',
    query: '',
    onActiveTabChange: vi.fn(),
    onCompose: vi.fn(),
    onFilterChange: vi.fn(),
    onOpenConversation: vi.fn(),
    onQueryChange: vi.fn(),
    ...overrides
  }
  render(<ChatListScreen {...props} />)
  return props
}

describe('ChatListScreen', () => {
  it('renders active chats and exposes the mobile navigation state', () => {
    renderScreen()
    expect(screen.getByText('Studio One')).toBeInTheDocument()
    expect(screen.queryByText('Craft House')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /chats/i })).toHaveAttribute('aria-current', 'page')
  })

  it('delegates search, filters and chat selection', () => {
    const props = renderScreen()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search chats' }), {
      target: { value: 'studio' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'unread' }))
    fireEvent.click(screen.getByRole('button', { name: /studio one/i }))
    expect(props.onQueryChange).toHaveBeenCalledWith('studio')
    expect(props.onFilterChange).toHaveBeenCalledWith('unread')
    expect(props.onOpenConversation).toHaveBeenCalledWith(conversations[0])
  })
})
