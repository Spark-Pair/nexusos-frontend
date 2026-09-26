import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ThemePreviewPage from './ThemePreviewPage'

describe('ThemePreviewPage', () => {
  it('switches the isolated preview palette without changing the app theme', () => {
    const rootThemeClass = document.documentElement.className
    const { container } = render(<ThemePreviewPage />)
    const preview = container.querySelector('.theme-preview')

    expect(preview).toHaveAttribute('data-palette', 'green')
    expect(preview).toHaveAttribute('data-mode', 'dark')
    fireEvent.click(screen.getByRole('button', { name: 'Blue' }))
    expect(preview).toHaveAttribute('data-palette', 'blue')
    fireEvent.click(screen.getByRole('button', { name: 'Orange' }))
    expect(preview).toHaveAttribute('data-palette', 'orange')
    fireEvent.click(screen.getByRole('button', { name: /Light/ }))
    expect(preview).toHaveAttribute('data-mode', 'light')
    expect(document.documentElement.className).toBe(rootThemeClass)
  })
})
