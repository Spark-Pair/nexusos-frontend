import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CommunicationPreferences, DeliveryStateIndicator, PolicyNotice } from './TrustAndDelivery'

describe('trust and delivery components', () => {
  it('distinguishes local, queued and delivered acknowledgement states', () => {
    render(
      <>
        {(['local', 'queued', 'delivered'] as const).map((state) => (
          <DeliveryStateIndicator key={state} state={state} />
        ))}
      </>
    )
    expect(screen.getByText('Saved locally')).toBeInTheDocument()
    expect(screen.getByText('Pending synchronization')).toBeInTheDocument()
    expect(screen.getByText('Delivered')).toBeInTheDocument()
    expect(screen.getByText('External delivery was acknowledged.')).toBeInTheDocument()
  })

  it('exposes customer-owned mute and block controls', () => {
    const onMute = vi.fn()
    const onBlock = vi.fn()
    render(<CommunicationPreferences onMute={onMute} onBlock={onBlock} />)
    fireEvent.click(screen.getByRole('button', { name: /mute updates/i }))
    fireEvent.click(screen.getByRole('button', { name: /block business/i }))
    expect(onMute).toHaveBeenCalledOnce()
    expect(onBlock).toHaveBeenCalledOnce()
  })

  it('renders suppression guidance explicitly', () => {
    render(
      <PolicyNotice title="Suppression overrides consent" tone="blocked">
        Suppressed recipients receive no marketing.
      </PolicyNotice>
    )
    expect(screen.getByText(/receive no marketing/i)).toBeInTheDocument()
  })
})
