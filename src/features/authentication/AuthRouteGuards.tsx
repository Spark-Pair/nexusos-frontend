import { Navigate, Outlet } from 'react-router-dom'
import { authRoutes } from './authRoutes'
import { useAuthSession } from './authSession'

function RestoringSession() {
  return (
    <div
      className="app-canvas grid min-h-dvh place-items-center text-sm font-semibold text-slate-500"
      role="status"
    >
      Restoring your NexusOS session...
    </div>
  )
}

export function SignedOutOnlyRoute() {
  const { session, status } = useAuthSession()
  if (status === 'restoring') return <RestoringSession />
  if (session)
    return (
      <Navigate
        to={
          session.requires_phone
            ? authRoutes.phone
            : session.data.is_admin
              ? authRoutes.adminUsers
              : authRoutes.chatPreview
        }
        replace
      />
    )
  return <Outlet />
}

export function PhoneFlowRoute() {
  const { session, status } = useAuthSession()
  if (status === 'restoring') return <RestoringSession />
  if (session && !session.requires_phone) return <Navigate to={authRoutes.chatPreview} replace />
  return <Outlet />
}

export function ProtectedRoute() {
  const { session, status } = useAuthSession()
  if (status === 'restoring') return <RestoringSession />
  if (!session) return <Navigate to={authRoutes.signIn} replace />
  if (session.requires_phone) return <Navigate to={authRoutes.phone} replace />
  return <Outlet />
}

export function AdminRoute() {
  const { session, status } = useAuthSession()
  if (status === 'restoring') return <RestoringSession />
  if (!session) return <Navigate to={authRoutes.signIn} replace />
  if (!session.data.is_admin) return <Navigate to={authRoutes.chatPreview} replace />
  return <Outlet />
}

function AccountKindRoute({ kind }: { kind: 'customer' | 'business' }) {
  const { session, status } = useAuthSession()
  if (status === 'restoring') return <RestoringSession />
  if (!session) return <Navigate to={authRoutes.signIn} replace />
  if (session.requires_phone) return <Navigate to={authRoutes.phone} replace />
  if (session.data.account_kind !== kind) return <Navigate to={authRoutes.chatPreview} replace />
  return <Outlet />
}
export function CustomerRoute() {
  return <AccountKindRoute kind="customer" />
}
export function BusinessRoute() {
  return <AccountKindRoute kind="business" />
}
