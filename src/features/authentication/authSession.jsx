import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthApiError, authApi } from './authApi.js'

const tokenKey = 'nexusos-session-token'
const AuthSessionContext = createContext(null)

function storedToken() {
  const token = localStorage.getItem(tokenKey) ?? sessionStorage.getItem(tokenKey)
  if (token && !localStorage.getItem(tokenKey)) {
    localStorage.setItem(tokenKey, token)
    sessionStorage.removeItem(tokenKey)
  }
  return token
}

export function AuthSessionProvider({ children }) {
  const [session, setSessionState] = useState()
  const [status, setStatus] = useState(() => (storedToken() ? 'restoring' : 'anonymous'))

  const setSession = (nextSession) => {
    localStorage.setItem(tokenKey, nextSession.token)
    sessionStorage.removeItem(tokenKey)
    setSessionState(nextSession)
    setStatus('authenticated')
  }

  useEffect(() => {
    const token = storedToken()
    if (!token) return

    authApi
      .restore(token)
      .then(setSession)
      .catch((error) => {
        if (!(error instanceof AuthApiError) || ![401, 403].includes(error.status)) {
          setStatus('authenticated')
          return
        }
        localStorage.removeItem(tokenKey)
        sessionStorage.removeItem(tokenKey)
        setSessionState(undefined)
        setStatus('anonymous')
      })
  }, [])

  const signOut = async () => {
    const token = session?.token ?? localStorage.getItem(tokenKey)
    localStorage.removeItem(tokenKey)
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
