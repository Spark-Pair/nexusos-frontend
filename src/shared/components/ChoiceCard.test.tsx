import { ChoiceCard } from '@shared/components/ChoiceCard'
import { fireEvent, render, screen } from '@testing-library/react'
import { BriefcaseBusiness } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

describe('ChoiceCard', () => {
  it('exposes selected and disabled states with native button semantics', () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <ChoiceCard
        selected
        title="Business account"
        description="Manage customers and communication"
        icon={BriefcaseBusiness}
        onClick={onClick}
      />
    )

    const choice = screen.getByRole('button', { name: /business account/i })
    expect(choice).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(choice)
    expect(onClick).toHaveBeenCalledOnce()

    rerender(
      <ChoiceCard
        disabled
        title="Business account"
        description="Manage customers and communication"
        icon={BriefcaseBusiness}
      />
    )
    expect(screen.getByRole('button', { name: /business account/i })).toBeDisabled()
  })
})
