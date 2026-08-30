import { useAuth } from '@app/auth/useAuth'
import { useAppServices } from '@app/providers/useAppServices'
import { AccountMenu } from '@shared/components/AccountMenu'
import { Button } from '@shared/components/Button'
import { useUiStore } from '@shared/store/uiStore'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
interface ShellHeaderProps {
  title: string
  onMenu?: () => void
  contextLabel?: string
}
export function ShellHeader({ contextLabel, onMenu, title }: ShellHeaderProps) {
  const setSearch = useUiStore((state) => state.setSearchOpen)
  const setNotifications = useUiStore((state) => state.setNotificationsOpen)
  const { session } = useAuth()
  const { notifications } = useAppServices()
  const scope = useMemo(
    () =>
      session.account
        ? {
            accountId: session.account.id,
            ...(session.workspace ? { workspaceId: session.workspace.id } : {})
          }
        : undefined,
    [session]
  )
  const notificationQuery = useQuery({
    queryKey: ['notifications', scope?.accountId, scope?.workspaceId],
    queryFn: () => (scope ? notifications.list(scope) : Promise.resolve([])),
    enabled: Boolean(scope)
  })
  const unread = notificationQuery.data?.filter((item) => !item.read).length ?? 0
  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        {onMenu && (
          <Button variant="quiet" aria-label="Open navigation" onClick={onMenu}>
            Menu
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-cyan-700">
            {contextLabel ?? 'NexusOS'}
          </p>
          <p className="truncate font-semibold">{title}</p>
        </div>
        <Button variant="quiet" aria-label="Open global search" onClick={() => setSearch(true)}>
          Search <span aria-hidden="true">⌘K</span>
        </Button>
        <Button
          variant="quiet"
          aria-label="Open notifications"
          onClick={() => setNotifications(true)}
        >
          Notifications{unread > 0 ? ` (${unread})` : ''}
        </Button>
        <AccountMenu />
      </div>
    </header>
  )
}
