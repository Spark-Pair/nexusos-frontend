import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {
  PhoneFlowRoute,
  ProtectedRoute,
  SignedOutOnlyRoute,
  AdminRoute,
  BusinessRoute,
  CustomerRoute
} from '@/features/authentication/AuthRouteGuards'

const ChatsPage = lazy(() => import('@/features/chats/ChatsPage'))
const DesignSystemPage = lazy(() => import('@/features/design-system/DesignSystemPage'))
const SignInPage = lazy(() => import('@/features/authentication/SignInPage'))
const PhonePage = lazy(() => import('@/features/authentication/PhonePage'))
const VerifyPage = lazy(() => import('@/features/authentication/VerifyPage'))
const AdminUsersPage = lazy(() => import('@/features/admin/AdminUsersPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const BroadcastPage = lazy(() => import('@/features/broadcasts/BroadcastPage'))
const AdminReportsPage = lazy(() => import('@/features/admin/AdminReportsPage'))

export function App() {
  return (
    <Suspense
      fallback={
        <div
          className="grid min-h-dvh place-items-center bg-slate-50 text-sm font-semibold text-slate-500"
          role="status"
        >
          Loading NexusOS…
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/app/chats" replace />} />
        <Route element={<SignedOutOnlyRoute />}>
          <Route path="/sign-in" element={<SignInPage />} />
        </Route>
        <Route element={<PhoneFlowRoute />}>
          <Route path="/auth/phone" element={<PhonePage />} />
          <Route path="/auth/verify" element={<VerifyPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/app/chats" element={<ChatsPage />} />
          <Route path="/app/chats/:conversationId" element={<ChatsPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<BusinessRoute />}>
          <Route path="/business/broadcasts" element={<BroadcastPage />} />
        </Route>
        <Route element={<CustomerRoute />}>
          <Route path="/app/updates" element={<Navigate to="/app/chats" replace />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/moderation" element={<AdminReportsPage />} />
        </Route>
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/create-account" element={<Navigate to="/sign-in" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
