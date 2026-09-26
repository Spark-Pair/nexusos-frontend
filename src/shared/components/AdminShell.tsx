import { ApplicationFrame } from '@shared/components/ApplicationFrame'
import { AppSidebar } from '@shared/components/AppSidebar'
import { Button } from '@shared/components/Button'
import { WorkspaceNavLink } from '@shared/components/WorkspaceNavLink'
import { Flag, LogOut, Users } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MobileTabBar } from './MobileTabBar'

export function AdminShell({ children, onSignOut }: PropsWithChildren<{ onSignOut: () => void }>) {
  const location = useLocation()
  const navigate = useNavigate()
  const active = location.pathname.startsWith('/admin/moderation') ? 'reports' : 'users'
  return (
    <ApplicationFrame
      sidebar={
        <AppSidebar
          brandHref="/admin/users"
          roleLabel="Admin panel"
          navigationLabel="Admin panel"
          footer={
            <Button className="flex-1 justify-start" variant="quiet" onClick={onSignOut}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          }
        >
          <WorkspaceNavLink to="/admin/users" icon={Users} active={active === 'users'}>
            Users
          </WorkspaceNavLink>
          <WorkspaceNavLink to="/admin/moderation" icon={Flag} active={active === 'reports'}>
            Reports
          </WorkspaceNavLink>
        </AppSidebar>
      }
    >
      <div className="min-w-0">
        <header className="mobile-page-header sticky top-0 z-20 flex h-16 items-center justify-between px-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <span className="brand-mark size-9 text-xs">N</span>
            <span className="text-sm font-semibold">NexusOS</span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            className="icon-button icon-button-md icon-button-quiet"
            onClick={onSignOut}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </header>
        <main data-mobile-swipe className="mx-auto w-full max-w-[1500px] p-3 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <MobileTabBar
          activeId={active}
          items={[
            { id: 'users', label: 'Users', icon: 'profile' },
            { id: 'reports', label: 'Reports', icon: 'updates' }
          ]}
          onChange={(id) => void navigate(id === 'reports' ? '/admin/moderation' : '/admin/users')}
        />
      </div>
    </ApplicationFrame>
  )
}
