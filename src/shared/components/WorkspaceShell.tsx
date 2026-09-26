import { MessageCircle, UserRound } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApplicationFrame } from './ApplicationFrame'
import { AppSidebar } from './AppSidebar'
import { MobileTabBar } from './MobileTabBar'
import { WorkspaceNavLink } from './WorkspaceNavLink'
import { useUnreadCount } from '@/features/chats/unreadCount'
import { haptic } from '@/shared/motion/haptics'

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
    <ApplicationFrame
      sidebar={
        <AppSidebar
          brandHref="/app/chats"
          roleLabel={accountKind === 'business' ? 'Business workspace' : 'Customer inbox'}
          footer={
            <WorkspaceNavLink to="/app/profile" icon={UserRound} active={profileActive}>
              <span className="min-w-0">
                <span className="block truncate">{accountName}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Profile & settings
                </span>
              </span>
            </WorkspaceNavLink>
          }
        >
          <WorkspaceNavLink to="/app/chats" icon={MessageCircle} active={chatsActive}>
            Chats
          </WorkspaceNavLink>
          {accountKind === 'business' ? navigation : null}
        </AppSidebar>
      }
    >
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
        <main className="mx-auto w-full max-w-[1400px] p-3 sm:p-5 lg:p-6">{children}</main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <MobileTabBar
          activeId={activeMobile}
          items={[
            {
              id: 'chats',
              label: 'Chats',
              icon: 'chats',
              ...(unreadCount
                ? {
                    badge: unreadCount,
                    onBadgeClick: () => void navigate('/app/chats?filter=unread')
                  }
                : {})
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
    </ApplicationFrame>
  )
}
