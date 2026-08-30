import { useAuth } from '@app/auth/useAuth'
import { appRoutes, buildPath } from '@app/routing/routes'
import { ShellFrame } from '@app/shell/ShellFrame'
import { Badge } from '@shared/components/Badge'
import { Button } from '@shared/components/Button'
import { Drawer } from '@shared/components/Drawer'
import { NavigationItem } from '@shared/components/NavigationItem'
import { ShellHeader } from '@shared/components/ShellHeader'
import { useUiStore } from '@shared/store/uiStore'
import { Outlet } from 'react-router'

export default function BusinessShell() {
  const { session } = useAuth()
  const open = useUiStore((state) => state.navigationOpen)
  const setOpen = useUiStore((state) => state.setNavigationOpen)
  const workspace = session.workspace
  const nav = appRoutes.filter(
    (route) =>
      route.area === 'business' &&
      route.primaryNav &&
      (!route.permission || session.permissions.includes(route.permission))
  )
  const items = (
    <nav aria-label="Business workspace" className="space-y-1">
      {nav.map((route) => (
        <NavigationItem
          key={route.id}
          to={buildPath(route, { businessId: workspace?.id ?? 'select' })}
          label={route.title}
          onNavigate={() => setOpen(false)}
        />
      ))}
    </nav>
  )
  const sidebar = (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-y-auto border-r bg-white p-4 lg:block">
      <a href="/" className="text-xl font-semibold">
        NexusOS
      </a>
      <div className="my-5 rounded-xl bg-slate-50 p-3">
        <p className="text-sm font-semibold">{workspace?.name}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge>{workspace?.verificationStatus}</Badge>
          <Badge>{workspace?.subscriptionLabel}</Badge>
        </div>
        <Button className="mt-3 w-full" variant="quiet" disabled>
          Workspace selector
        </Button>
      </div>
      {items}
    </aside>
  )
  return (
    <ShellFrame
      navigation={sidebar}
      header={
        <ShellHeader
          title={workspace?.name ?? 'Business'}
          contextLabel="Business Workspace"
          onMenu={() => setOpen(true)}
        />
      }
    >
      <Drawer open={open} title="Business navigation" onClose={() => setOpen(false)}>
        {items}
      </Drawer>
      <Outlet />
    </ShellFrame>
  )
}
