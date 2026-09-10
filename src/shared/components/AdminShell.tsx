import { Button } from '@shared/components/Button'
import { Flag, LogOut, ShieldCheck, Users } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MobileTabBar } from './MobileTabBar'

export function AdminShell({ children, onSignOut }: PropsWithChildren<{ onSignOut: () => void }>) {
  const location = useLocation()
  const navigate = useNavigate()
  const active = location.pathname.startsWith('/admin/moderation') ? 'reports' : 'users'
  return (
    <div className="app-canvas min-h-dvh pb-[5.75rem] lg:grid lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-3 lg:p-3 lg:pb-3">
      <aside className="hidden h-[calc(100dvh-1.5rem)] flex-col rounded-3xl border border-slate-200 bg-white p-4 lg:sticky lg:top-3 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <Link to="/admin/users" className="flex items-center gap-3 px-2 py-3">
          <span className="brand-mark">N</span>
          <span className="text-sm font-semibold">
            NexusOS
            <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
              Admin panel
            </span>
          </span>
        </Link>
        <nav aria-label="Admin panel" className="mt-7 grid gap-1">
          <Link
            to="/admin/users"
            className={`workspace-nav-link ${active === 'users' ? 'workspace-nav-link-active' : ''}`}
          >
            <Users className="size-[18px]" aria-hidden="true" />
            Users
          </Link>
          <Link
            to="/admin/moderation"
            className={`workspace-nav-link ${active === 'reports' ? 'workspace-nav-link-active' : ''}`}
          >
            <Flag className="size-[18px]" aria-hidden="true" />
            Reports
          </Link>
        </nav>
        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button className="flex-1 justify-start" variant="quiet" onClick={onSignOut}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
          <span className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Admin
          </span>
          <span className="text-sm font-semibold">NexusOS</span>
          <span className="size-11" aria-hidden="true" />
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-3 sm:p-6 lg:p-8">{children}</main>
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
