import { ThemeProvider } from '@shared/theme'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthSessionProvider } from './authSession'
import SignInPage from './SignInPage'

function renderAt(path: string, element: ReactNode) {
  return render(
    <ThemeProvider>
      <AuthSessionProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="*" element={element} />
          </Routes>
        </MemoryRouter>
      </AuthSessionProvider>
    </ThemeProvider>
  )
}

describe('authentication screens', () => {
  it('keeps authentication Google-only for new users', () => {
    renderAt('/sign-in', <SignInPage />)
    expect(screen.getByRole('heading', { name: 'Sign in with Google' })).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /Create account|Sign in with email|Phone/i })
    ).not.toBeInTheDocument()
  })
})
