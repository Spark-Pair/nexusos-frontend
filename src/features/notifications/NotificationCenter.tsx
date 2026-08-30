import { useAuth } from '@app/auth/useAuth'
import { useAppServices } from '@app/providers/useAppServices'
import { Button } from '@shared/components/Button'
import { Drawer } from '@shared/components/Drawer'
import { EmptyState } from '@shared/components/states/EmptyState'
import { useUiStore } from '@shared/store/uiStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

export function NotificationCenter() {
  const open = useUiStore((state) => state.notificationsOpen)
  const setOpen = useUiStore((state) => state.setNotificationsOpen)
  const { session } = useAuth()
  const { notifications } = useAppServices()
  const client = useQueryClient()
  const navigate = useNavigate()
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
  const key = ['notifications', scope?.accountId, scope?.workspaceId] as const
  const query = useQuery({
    queryKey: key,
    queryFn: () => (scope ? notifications.list(scope) : Promise.resolve([])),
    enabled: Boolean(scope)
  })
  const action = useMutation({
    mutationFn: async (command: {
      type: 'read' | 'all' | 'delete'
      id?: string
      read?: boolean
    }) => {
      if (!scope) return
      if (command.type === 'all') await notifications.markAllRead(scope)
      else if (command.type === 'delete' && command.id)
        await notifications.delete(scope, command.id)
      else if (command.id) await notifications.setRead(scope, command.id, command.read ?? true)
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key })
  })
  return (
    <Drawer open={open} title="Notifications" onClose={() => setOpen(false)}>
      <div className="mb-4 flex justify-end">
        <Button
          disabled={!query.data?.some((item) => !item.read)}
          onClick={() => action.mutate({ type: 'all' })}
        >
          Mark all as read
        </Button>
      </div>
      {query.data?.length ? (
        <ul className="space-y-3">
          {query.data.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border p-4 ${item.read ? 'bg-white' : 'border-cyan-200 bg-cyan-50'}`}
            >
              <button
                className="w-full text-left"
                onClick={() => {
                  action.mutate({ type: 'read', id: item.id, read: true })
                  setOpen(false)
                  void navigate(item.targetPath)
                }}
              >
                <strong className="text-sm">{item.title}</strong>
                <span className="mt-1 block text-sm text-slate-600">{item.description}</span>
              </button>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="quiet"
                  onClick={() => action.mutate({ type: 'read', id: item.id, read: !item.read })}
                >
                  Mark as {item.read ? 'unread' : 'read'}
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => action.mutate({ type: 'delete', id: item.id })}
                >
                  Delete local
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No notifications"
          description="There are no local notifications in this scope."
        />
      )}
    </Drawer>
  )
}
