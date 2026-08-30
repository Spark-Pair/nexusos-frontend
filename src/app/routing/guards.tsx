import { useAuth } from '@app/auth/useAuth'
import { allowedReturnDestination, roleHomes, systemPaths } from '@app/routing/routes'
import type { BusinessPermission, IdentityKind } from '@domain/auth/session'
import type { PropsWithChildren } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router'

function intendedSignIn(pathname: string, search: string): string {
  const intended = `${pathname}${search}`
  return `${systemPaths.signIn}?returnTo=${encodeURIComponent(intended)}`
}

export function GuestOnlyGuard() {
  const { session } = useAuth()
  const returnTo = new URLSearchParams(useLocation().search).get('returnTo')
  if (session.authenticationStatus === 'authenticated') {
    const destination = allowedReturnDestination(returnTo, session)
    return <Navigate replace to={destination ?? roleHomes[session.identityKey]} />
  }
  return <Outlet />
}

export function RoleGuard({ allowed }: { allowed: readonly IdentityKind[] }) {
  const { session } = useAuth()
  const location = useLocation()
  if (session.authenticationStatus !== 'authenticated')
    return <Navigate replace to={intendedSignIn(location.pathname, location.search)} />
  if (!allowed.includes(session.identityKey))
    return <Navigate replace to={systemPaths.unauthorized} />
  return <Outlet />
}

export function CustomerOnboardingGuard({ requireComplete }: { requireComplete: boolean }) {
  const { session } = useAuth()
  const complete = session.customerOnboardingStatus === 'completed'
  if (requireComplete && !complete) return <Navigate replace to={systemPaths.customerOnboarding} />
  if (!requireComplete && complete) return <Navigate replace to={roleHomes.customer} />
  return <Outlet />
}

export function BusinessContextGuard({ permission }: { permission?: BusinessPermission }) {
  const { session } = useAuth()
  const { businessId } = useParams()
  if (session.businessOnboardingStatus !== 'completed')
    return <Navigate replace to={systemPaths.businessSetup} />
  if (!session.workspace || session.workspace.id !== businessId)
    return <Navigate replace to={systemPaths.businessSelect} />
  if (permission && !session.permissions.includes(permission))
    return <Navigate replace to={systemPaths.unauthorized} />
  return <Outlet />
}

export function BusinessSetupGuard() {
  const { session } = useAuth()
  if (session.businessOnboardingStatus === 'completed')
    return <Navigate replace to={roleHomes[session.identityKey]} />
  return <Outlet />
}

export function BusinessVerificationGuard() {
  const { session } = useAuth()
  if (session.workspace?.verificationStatus !== 'approved') {
    return <Navigate replace to={`/business/${session.workspace?.id ?? 'select'}/verification`} />
  }
  return <Outlet />
}

export function PermissionGate({
  children,
  permission
}: PropsWithChildren<{ permission?: BusinessPermission }>) {
  const { session } = useAuth()
  if (permission && !session.permissions.includes(permission))
    return <Navigate replace to={systemPaths.unauthorized} />
  return children
}
