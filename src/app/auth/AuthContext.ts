import type { AuthSession, IdentityKind } from '@domain/auth/session'
import { createContext } from 'react'

export interface AuthContextValue {
  session: AuthSession
  selectIdentity: (identity: IdentityKind) => void
  signOut: () => void
}
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
