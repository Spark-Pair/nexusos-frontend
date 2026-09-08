import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authApi } from './authApi.js'

const tokenKey = 'nexusos-session-token'
const AuthSessionContext = createContext(null)

export function AuthSessionProvider({ children }) {
  const [session, setSessionState] = useState()
  const [status, setStatus] = useState(() =>
    sessionStorage.getItem(tokenKey) ? 'restoring' : 'anonymous',
  )

  const setSession = (nextSession) => {
    sessionStorage.setItem(tokenKey, nextSession.token)
    setSessionState(nextSession)
    setStatus('authenticated')
  }

  useEffect(() => {
    const token = sessionStorage.getItem(tokenKey)
    if (!token) return

    authApi
      .restore(token)
      .then(setSession)
      .catch(() => {
        sessionStorage.removeItem(tokenKey)
        setSessionState(undefined)
        setStatus('anonymous')
      })
  }, [])

  const signOut = async () => {
    const token = session?.token
    sessionStorage.removeItem(tokenKey)
    setSessionState(undefined)
    setStatus('anonymous')
    if (token) await authApi.logout(token).catch(() => undefined)
  }

  return (
    <AuthSessionContext.Provider value={{ session, status, setSession, signOut }}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export function RequireAuthRoute() {
  const location = useLocation()
  const { status } = useAuthSession()

  if (status === 'restoring') return <main className="auth-loading">Restoring session...</main>
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}

export function SignedOutOnlyRoute() {
  const { status } = useAuthSession()

  if (status === 'restoring') return <main className="auth-loading">Restoring session...</main>
  if (status === 'authenticated') return <Navigate to="/chats" replace />

  return <Outlet />
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthSession() {
  const value = useContext(AuthSessionContext)
  if (!value) throw new Error('useAuthSession must be used inside AuthSessionProvider')
  return value
}
