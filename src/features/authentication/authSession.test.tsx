import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthSessionProvider, useAuthSession } from './authSession'

const user = {
  id: '5d102070-7343-4da9-86a4-49575d40f7f2',
  name: 'Test User',
  username: 'test-user',
  email: 'test@example.com',
  phone: '+923165825495',
  account_kind: 'customer' as const,
  phone_verified_at: '2026-09-01T00:00:00.000Z',
  is_admin: false
}

function SessionProbe() {
  const { session, status, setSession, signOut } = useAuthSession()
  return (
    <div>
      <span>{status}</span>
      <span>{session?.data.name}</span>
      <button onClick={() => setSession({ data: user, token: 'new-token', requires_phone: false })}>
        Set session
      </button>
      <button onClick={() => void signOut()}>Sign out</button>
    </div>
  )
}

describe('authenticated session lifecycle', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('restores a persisted token by confirming it with /auth/me', async () => {
    sessionStorage.setItem('nexusos-session-token', 'persisted-token')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: user, requires_phone: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    )
    render(
      <AuthSessionProvider>
        <SessionProbe />
      </AuthSessionProvider>
    )
    expect(await screen.findByText('Test User')).toBeVisible()
    expect(screen.getByText('authenticated')).toBeVisible()
    const [url, init] = fetchMock.mock.calls[0] ?? []
    if (typeof url !== 'string') throw new Error('Expected an authentication URL string.')
    expect(url).toMatch(/\/auth\/me$/u)
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer persisted-token')
  })

  it('clears an invalid persisted token', async () => {
    sessionStorage.setItem('nexusos-session-token', 'expired-token')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }))
    render(
      <AuthSessionProvider>
        <SessionProbe />
      </AuthSessionProvider>
    )
    await waitFor(() => expect(screen.getByText('anonymous')).toBeVisible())
    expect(sessionStorage.getItem('nexusos-session-token')).toBeNull()
  })

  it('clears local session state during logout', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
    render(
      <AuthSessionProvider>
        <SessionProbe />
      </AuthSessionProvider>
    )
    await waitFor(() => expect(screen.getByText('anonymous')).toBeVisible())
    screen.getByRole('button', { name: 'Set session' }).click()
    expect(sessionStorage.getItem('nexusos-session-token')).toBe('new-token')
    screen.getByRole('button', { name: 'Sign out' }).click()
    await waitFor(() => expect(sessionStorage.getItem('nexusos-session-token')).toBeNull())
    expect(screen.getByText('anonymous')).toBeVisible()
  })
})
