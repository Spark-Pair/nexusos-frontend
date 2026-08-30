import { AuthContext, type AuthContextValue } from '@app/auth/AuthContext'
import { useContext } from 'react'

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('Authentication context is unavailable')
  return value
}
