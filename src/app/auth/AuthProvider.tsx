import { AuthContext } from '@app/auth/AuthContext'
import { useAppServices } from '@app/providers/useAppServices'
import type { IdentityKind } from '@domain/auth/session'
import { useUiStore } from '@shared/store/uiStore'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useSyncExternalStore, type PropsWithChildren } from 'react'

export function AuthProvider({ children }: PropsWithChildren) {
  const { auth } = useAppServices()
  const queryClient = useQueryClient()
  const resetEphemeral = useUiStore((state) => state.resetEphemeral)
  const session = useSyncExternalStore(
    (listener) => auth.subscribe(listener),
    () => auth.getSession(),
    () => auth.getSession()
  )
  const clearInMemoryScope = useCallback(() => {
    queryClient.clear()
    resetEphemeral()
  }, [queryClient, resetEphemeral])
  const selectIdentity = useCallback(
    (identity: IdentityKind) => {
      clearInMemoryScope()
      auth.selectIdentity(identity)
    },
    [auth, clearInMemoryScope]
  )
  const signOut = useCallback(() => {
    clearInMemoryScope()
    auth.signOut()
  }, [auth, clearInMemoryScope])
  return (
    <AuthContext.Provider value={{ session, selectIdentity, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
