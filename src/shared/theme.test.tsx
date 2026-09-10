import { ThemeToggle } from '@shared/components/ThemeToggle'
import { ThemeProvider } from '@shared/theme'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('ThemeProvider', () => {
  it('applies and persists the safe light or dark preference', () => {
    window.localStorage.setItem('nexusos-theme', 'dark')
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    expect(document.documentElement).toHaveClass('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Use light mode' }))
    expect(document.documentElement).not.toHaveClass('dark')
    expect(window.localStorage.getItem('nexusos-theme')).toBe('light')
  })
})
