import { AppErrorBoundary } from '@app/errors/AppErrorBoundary'
import {
  GuestOnlyGuard,
  RoleGuard,
  CustomerOnboardingGuard,
  BusinessContextGuard,
  BusinessSetupGuard,
  PermissionGate
} from '@app/routing/guards'
import { appRoutes, systemPaths, type RouteArea } from '@app/routing/routes'
import { LoadingScreen } from '@shared/components/LoadingScreen'
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router'
import { NotFoundPage, UnauthorizedPage } from '@/features/shared-pages/StatusPage'

const PublicShell = lazy(async () => import('@app/shell/PublicShell'))
const CustomerShell = lazy(async () => import('@app/shell/CustomerShell'))
const BusinessShell = lazy(async () => import('@app/shell/BusinessShell'))
const AdminShell = lazy(async () => import('@app/shell/AdminShell'))
const PublicPage = lazy(async () => import('@/features/public/PublicPage'))
const AuthenticationPage = lazy(async () => import('@/features/authentication/AuthenticationPage'))
const PlaceholderPage = lazy(async () =>
  import('@shared/components/PlaceholderPage').then((module) => ({
    default: module.PlaceholderPage
  }))
)

const routes = (area: RouteArea) => appRoutes.filter((route) => route.area === area)
const page = (title: string) => (
  <AppErrorBoundary>
    <PlaceholderPage title={title} />
  </AppErrorBoundary>
)

export function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<PublicShell />}>
            {routes('public').map((route) => (
              <Route
                key={route.id}
                path={route.path}
                element={<PublicPage title={route.title} />}
              />
            ))}
            <Route element={<GuestOnlyGuard />}>
              {routes('authentication').map((route) => (
                <Route
                  key={route.id}
                  path={route.path}
                  element={<AuthenticationPage title={route.title} />}
                />
              ))}
            </Route>
          </Route>
          <Route element={<RoleGuard allowed={['customer']} />}>
            <Route element={<CustomerOnboardingGuard requireComplete={false} />}>
              {routes('customer-onboarding').map((route) => (
                <Route key={route.id} path={route.path} element={page(route.title)} />
              ))}
            </Route>
            <Route element={<CustomerOnboardingGuard requireComplete />}>
              <Route element={<CustomerShell />}>
                {routes('customer').map((route) => (
                  <Route key={route.id} path={route.path} element={page(route.title)} />
                ))}
                <Route path="/app/*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Route>
          <Route element={<RoleGuard allowed={['business_owner', 'business_employee']} />}>
            <Route element={<BusinessSetupGuard />}>
              {routes('business-setup')
                .filter((route) => route.id !== 'business.select')
                .map((route) => (
                  <Route key={route.id} path={route.path} element={page(route.title)} />
                ))}
            </Route>
            <Route path={systemPaths.businessSelect} element={page('Select workspace')} />
            <Route element={<BusinessContextGuard />}>
              <Route element={<BusinessShell />}>
                {routes('business').map((route) => (
                  <Route
                    key={route.id}
                    path={route.path}
                    element={
                      <PermissionGate
                        {...(route.permission ? { permission: route.permission } : {})}
                      >
                        {page(route.title)}
                      </PermissionGate>
                    }
                  />
                ))}
                <Route path="/business/:businessId/*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Route>
          <Route element={<RoleGuard allowed={['platform_admin']} />}>
            <Route element={<AdminShell />}>
              {routes('admin').map((route) => (
                <Route key={route.id} path={route.path} element={page(route.title)} />
              ))}
              <Route path="/admin/*" element={<NotFoundPage />} />
            </Route>
          </Route>
          <Route path={systemPaths.unauthorized} element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  )
}
