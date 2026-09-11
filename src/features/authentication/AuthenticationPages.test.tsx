import { ThemeProvider } from '@shared/theme'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthSessionProvider } from './authSession'
import PhonePage from './PhonePage'
import SignInPage from './SignInPage'
import VerifyPage from './VerifyPage'

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

  it('validates Pakistani phone numbers through the shared rule', () => {
    renderAt('/auth/phone?account=business', <PhonePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Send verification code' }))
    expect(screen.getByRole('button', { name: /Show Pakistan mobile number error/ })).toBeVisible()
  })

  it('labels OTP verification as development-only', () => {
    renderAt('/auth/verify', <VerifyPage />)
    expect(screen.getByText(/Request a new verification code/i)).toBeVisible()
  })
})
