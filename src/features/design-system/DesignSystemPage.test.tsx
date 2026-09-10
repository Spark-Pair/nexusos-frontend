import { ThemeProvider } from '@shared/theme'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DesignSystemPage from '@/features/design-system/DesignSystemPage'

describe('DesignSystemPage', () => {
  it('shows the reusable foundation and interactive component states', () => {
    render(
      <ThemeProvider>
        <DesignSystemPage />
      </ThemeProvider>
    )

    expect(
      screen.getByRole('heading', { name: /designed for clarity, built for connection/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Primary action' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Use dark mode' }))
    expect(screen.getByRole('button', { name: 'Use light mode' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Products' }))
    expect(screen.getByRole('tabpanel', { name: 'Products' })).toHaveTextContent(
      'Products content preview'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }))
    expect(screen.getByRole('dialog', { name: 'Confirm order request' })).toBeInTheDocument()
  }, 10_000)
})
