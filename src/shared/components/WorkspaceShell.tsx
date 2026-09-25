import { MessageCircle, UserRound } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { PropsWithChildren, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MobileTabBar } from './MobileTabBar'
import { haptic } from '@/shared/motion/haptics'
import { useUnreadCount } from '@/features/chats/unreadCount'

export function WorkspaceShell({
  children,
  navigation,
  accountKind = 'business',
  accountName,
  actorId
}: PropsWithChildren<{
  navigation: ReactNode
  accountName: string
  actorId: string
  accountKind?: 'business' | 'customer'
}>) {
  const location = useLocation()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const unreadCount = useUnreadCount(actorId)
  const activeMobile = location.pathname.endsWith('/compose')
    ? 'compose'
    : location.pathname.endsWith('/history')
      ? 'history'
      : location.pathname.startsWith('/business/broadcasts')
        ? 'broadcasts'
        : location.pathname.startsWith('/app/profile')
          ? 'profile'
          : 'chats'
  const chatsActive = location.pathname.startsWith('/app/chats')
  const profileActive = location.pathname.startsWith('/app/profile')
  return (
    <div
      data-mobile-swipe
      className="app-canvas min-h-dvh pb-[var(--mobile-app-bar-height)] lg:grid lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-3 lg:p-3 lg:pb-3"
    >
      <aside className="hidden h-[calc(100dvh-1.5rem)] flex-col rounded-[var(--radius-surface)] border border-slate-200 bg-white p-4 lg:sticky lg:top-3 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <Link
          to="/app/chats"
          onClick={() => haptic('light')}
          className="flex items-center gap-3 px-2 py-3"
        >
          <span className="brand-mark">N</span>
          <span className="text-sm font-semibold">
            NexusOS
            <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
              {accountKind === 'business' ? 'Business workspace' : 'Customer inbox'}
            </span>
          </span>
        </Link>
        <nav aria-label="Workspace" className="mt-7 grid gap-1">
          <Link
            to="/app/chats"
            onClick={() => haptic('light')}
            className={'workspace-nav-link ' + (chatsActive ? 'workspace-nav-link-active' : '')}
            aria-current={chatsActive ? 'page' : undefined}
          >
            <MessageCircle className="size-[18px]" aria-hidden="true" />
            Chats
          </Link>
          {accountKind === 'business' ? navigation : null}
        </nav>
        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
          <Link
            to="/app/profile"
            onClick={() => haptic('light')}
            className={'workspace-nav-link ' + (profileActive ? 'workspace-nav-link-active' : '')}
            aria-current={profileActive ? 'page' : undefined}
          >
            <UserRound className="size-[18px]" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate">{accountName}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Profile & settings
              </span>
            </span>
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="mobile-page-header sticky top-0 z-20 flex h-16 items-center justify-between px-4 lg:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="brand-mark size-9 text-xs">N</span>
            <span className="text-sm font-semibold">NexusOS</span>
          </div>
          <Link
            to={profileActive ? '/app/chats' : '/app/profile'}
            onClick={() => haptic('light')}
            aria-label={profileActive ? 'Go to chats' : 'Profile and settings'}
            className="icon-button icon-button-md icon-button-quiet"
          >
            {profileActive ? (
              <MessageCircle className="size-4" aria-hidden="true" />
            ) : (
              <UserRound className="size-4" aria-hidden="true" />
            )}
          </Link>
        </header>
        <motion.main
          className="mx-auto w-full max-w-[1400px] p-3 sm:p-5 lg:p-6"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          {...(reducedMotion ? {} : { animate: { opacity: 1, y: 0 } })}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 260, damping: 28, mass: 0.72 }
          }
        >
          {children}
        </motion.main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <MobileTabBar
          activeId={activeMobile}
          items={[
            {
              id: 'chats',
              label: 'Chats',
              icon: 'chats',
              ...(unreadCount ? { badge: unreadCount } : {})
            },
            ...(accountKind === 'business'
              ? [
                  { id: 'broadcasts', label: 'Lists', icon: 'broadcasts' as const },
                  { id: 'compose', label: 'Send', icon: 'send' as const },
                  { id: 'history', label: 'History', icon: 'history' as const }
                ]
              : []),
            { id: 'profile', label: 'Profile', icon: 'profile' }
          ]}
          onChange={(id) => {
            if (id === 'chats') void navigate('/app/chats')
            else if (id === 'profile') void navigate('/app/profile')
            else if (id === 'compose') void navigate('/business/broadcasts/compose')
            else if (id === 'history') void navigate('/business/broadcasts/history')
            else void navigate('/business/broadcasts/lists')
          }}
        />
      </div>
    </div>
  )
}
