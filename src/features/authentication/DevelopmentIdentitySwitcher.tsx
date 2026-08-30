import { useAuth } from '@app/auth/useAuth'
import { useAppServices } from '@app/providers/useAppServices'
import { roleHomes } from '@app/routing/routes'
import type { IdentityKind } from '@domain/auth/session'
import { useNavigate } from 'react-router'

const options: readonly (readonly [IdentityKind, string])[] = [
  ['guest', 'Guest'],
  ['customer', 'Demo Customer'],
  ['business_owner', 'Demo Business Owner'],
  ['business_employee', 'Demo Business Employee'],
  ['platform_admin', 'Demo Platform Administrator']
]
export function DevelopmentIdentitySwitcher() {
  const { showDevelopmentControls } = useAppServices()
  const { session, selectIdentity } = useAuth()
  const navigate = useNavigate()
  if (!showDevelopmentControls) return null
  return (
    <label className="block text-xs font-semibold text-slate-600">
      Development identity
      <select
        aria-label="Development identity"
        className="mt-1 min-h-11 w-full rounded-xl border border-amber-300 bg-amber-50 px-3 text-sm"
        value={session.identityKey}
        onChange={(event) => {
          const identity = event.target.value as IdentityKind
          selectIdentity(identity)
          window.setTimeout(() => void navigate(roleHomes[identity], { replace: true }), 0)
        }}
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <span className="mt-1 block font-normal">
        Demo only · not backend authorization
        {session.workspace ? ` · ${session.workspace.name}` : ''}
      </span>
    </label>
  )
}
