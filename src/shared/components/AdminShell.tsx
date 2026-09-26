import { AppSidebar } from '@shared/components/AppSidebar'
import { Button } from '@shared/components/Button'
import { Flag, LogOut, Users } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MobileTabBar } from './MobileTabBar'
import { haptic } from '@/shared/motion/haptics'

export function AdminShell({ children, onSignOut }: PropsWithChildren<{ onSignOut: () => void }>) {
  const location = useLocation()
  const navigate = useNavigate()
  const active = location.pathname.startsWith('/admin/moderation') ? 'reports' : 'users'
  return (
    <div
      data-mobile-swipe
      className="app-canvas min-h-dvh pb-[var(--mobile-app-bar-height)] lg:grid lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-3 lg:p-3 lg:pb-3"
    >
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
        <Link
          to="/admin/users"
          onClick={() => haptic('light')}
          aria-current={active === 'users' ? 'page' : undefined}
          className={`workspace-nav-link ${active === 'users' ? 'workspace-nav-link-active' : ''}`}
        >
          <Users className="size-[18px]" aria-hidden="true" />
          Users
        </Link>
        <Link
          to="/admin/moderation"
          onClick={() => haptic('light')}
          aria-current={active === 'reports' ? 'page' : undefined}
          className={`workspace-nav-link ${active === 'reports' ? 'workspace-nav-link-active' : ''}`}
        >
          <Flag className="size-[18px]" aria-hidden="true" />
          Reports
        </Link>
      </AppSidebar>
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
    </div>
  )
}
