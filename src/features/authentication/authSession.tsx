import { ApiError } from '@shared/ApiError'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren
} from 'react'
import { authApi, type AuthSession } from './authApi'
import { syncOfflineActions } from '@/features/chats/offlineActions'
import { offlineStore } from '@/features/chats/offlineStore'
import { syncOutbox } from '@/features/chats/outbox'

type AuthStatus = 'restoring' | 'anonymous' | 'authenticated'
interface AuthSessionValue {
  session: AuthSession | undefined
  status: AuthStatus
  serverConfirmed: boolean
  setSession: (session: AuthSession) => void
  signOut: () => Promise<void>
}
const tokenKey = 'nexusos-session-token'
const actorKey = 'nexusos-session-actor'
const AuthSessionContext = createContext<AuthSessionValue | null>(null)
export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<AuthSession>()
  const [status, setStatus] = useState<AuthStatus>('restoring')
  const [serverConfirmed, setServerConfirmed] = useState(false)
  const confirmedAt = useRef(0)
  const setSession = useCallback((next: AuthSession) => {
    localStorage.setItem(tokenKey, next.token)
    localStorage.setItem(actorKey, next.data.id)
    setSessionState(next)
    setStatus('authenticated')
    setServerConfirmed(true)
    confirmedAt.current = Date.now()
    void offlineStore.remember(next).catch(() => undefined)
  }, [])
  const signOut = useCallback(async () => {
    const token = localStorage.getItem(tokenKey)
    const actor = localStorage.getItem(actorKey)
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(actorKey)
    setSessionState(undefined)
    setStatus('anonymous')
    setServerConfirmed(false)
    confirmedAt.current = 0
    if (actor) await offlineStore.purge(actor).catch(() => undefined)
    if (token && navigator.onLine) await authApi.logout(token).catch(() => undefined)
  }, [])
  useEffect(() => {
    let active = true
    let restoring = false
    const hydrateCachedSession = async (token: string) => {
      const actor = localStorage.getItem(actorKey)
      const cached = actor ? await offlineStore.identity(actor).catch(() => undefined) : undefined
      if (!active || localStorage.getItem(tokenKey) !== token || !cached) return false
      setSessionState({ ...cached, token })
      setStatus('authenticated')
      setServerConfirmed(false)
      return true
    }
    const restore = async () => {
      if (restoring) return
      const token = localStorage.getItem(tokenKey)
      if (!token) {
        setStatus('anonymous')
        return
      }
      restoring = true
      try {
        await hydrateCachedSession(token)
        if (!navigator.onLine) throw new Error('Offline')
        const next = await authApi.restore(token)
        if (active && localStorage.getItem(tokenKey) === token) {
          setSession(next)
          void syncOutbox(next.data.id, token).catch(() => undefined)
          void syncOfflineActions(next.data.id, token).catch(() => undefined)
        }
      } catch (cause) {
        confirmedAt.current = 0
        if (!active || localStorage.getItem(tokenKey) !== token) return
        if (cause instanceof ApiError && [401, 403].includes(cause.status)) {
          await signOut()
          return
        }
        const restoredFromCache = await hydrateCachedSession(token)
        if (!restoredFromCache) {
          setSessionState(undefined)
          setStatus('anonymous')
          setServerConfirmed(false)
        }
      } finally {
        restoring = false
      }
    }
    void restore()

    const reconnect = () => {
      void restore()
      const token = localStorage.getItem(tokenKey)
      const actor = localStorage.getItem(actorKey)
      if (token && actor) {
        void syncOutbox(actor, token).catch(() => undefined)
        void syncOfflineActions(actor, token).catch(() => undefined)
      }
    }
    const disconnect = () => {
      confirmedAt.current = 0
      setServerConfirmed(false)
    }
    window.addEventListener('online', reconnect)
    window.addEventListener('offline', disconnect)
    window.addEventListener('nexusos-session-expired', reconnect)
    return () => {
      active = false
      window.removeEventListener('online', reconnect)
      window.removeEventListener('offline', disconnect)
      window.removeEventListener('nexusos-session-expired', reconnect)
    }
  }, [setSession, signOut])
  return (
    <AuthSessionContext.Provider value={{ session, status, serverConfirmed, setSession, signOut }}>
      {children}
    </AuthSessionContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuthSession() {
  const value = useContext(AuthSessionContext)
  if (!value) throw new Error('useAuthSession must be used inside AuthSessionProvider')
  return value
}
