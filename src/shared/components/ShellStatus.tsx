import { useAuth } from '@app/auth/useAuth'
import { useAppServices } from '@app/providers/useAppServices'
import { Badge } from '@shared/components/Badge'
import { Button } from '@shared/components/Button'
import { Dialog } from '@shared/components/Dialog'
import { OfflineState } from '@shared/components/states/OfflineState'
import { useNetworkStatus } from '@shared/hooks/useNetworkStatus'
import { usePwaLifecycle } from '@shared/hooks/usePwaLifecycle'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'

export function ShellStatus() {
  const online = useNetworkStatus()
  const previous = useRef(online)
  const [restored, setRestored] = useState(false)
  const [installHelp, setInstallHelp] = useState(false)
  const { session } = useAuth()
  const { syncStatus } = useAppServices()
  const pwa = usePwaLifecycle()
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
  const pending = useQuery({
    queryKey: ['sync-count', scope?.accountId, scope?.workspaceId],
    queryFn: () => (scope ? syncStatus.countPending(scope) : Promise.resolve(0)),
    enabled: Boolean(scope),
    refetchInterval: 10_000
  })
  useEffect(() => {
    if (!previous.current && online) {
      previous.current = true
      setRestored(true)
      const timer = window.setTimeout(() => setRestored(false), 4000)
      return () => window.clearTimeout(timer)
    }
    previous.current = online
  }, [online])
  return (
    <>
      <div className="space-y-2" aria-live="polite">
        {!online && <OfflineState compact />}
        {restored && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
            Connection restored. Pending actions still require server acknowledgement.
          </p>
        )}
        {pwa.needRefresh && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-cyan-50 px-4 py-3 text-sm">
            <span>Application update available.</span>
            <Button variant="primary" onClick={() => void pwa.update()}>
              Reload to update
            </Button>
            <Button variant="quiet" onClick={pwa.dismissUpdate}>
              Dismiss
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{online ? 'Online' : 'Offline'}</Badge>
        <Badge>{pending.data ?? 0} pending synchronization</Badge>
        {pwa.canInstall ? (
          <Button variant="quiet" onClick={() => void pwa.install()}>
            Install app
          </Button>
        ) : (
          <Button variant="quiet" onClick={() => setInstallHelp(true)}>
            Install help
          </Button>
        )}
      </div>
      <Dialog open={installHelp} title="Install NexusOS" onClose={() => setInstallHelp(false)}>
        <p className="text-sm leading-6 text-slate-600">
          Use your browser’s Install App command. On iPhone or iPad, open Share and choose Add to
          Home Screen. Availability depends on browser support.
        </p>
      </Dialog>
    </>
  )
}
