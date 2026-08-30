import { appRoutes } from '@app/routing/routes'
import { ShellFrame } from '@app/shell/ShellFrame'
import { NavigationItem } from '@shared/components/NavigationItem'
import { ShellHeader } from '@shared/components/ShellHeader'
import { Outlet } from 'react-router'
const nav = appRoutes.filter((route) => route.area === 'admin' && route.primaryNav)
export default function AdminShell() {
  const sidebar = (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-y-auto bg-slate-950 p-4 text-white lg:block">
      <p className="text-xl font-semibold">NexusOS</p>
      <p className="mb-6 mt-1 text-xs uppercase tracking-wider text-cyan-300">
        Platform Administration
      </p>
      <nav aria-label="Platform administration" className="space-y-1">
        {nav.map((route) => (
          <NavigationItem
            key={route.id}
            to={route.path}
            label={route.title}
            end={route.path === '/admin'}
          />
        ))}
      </nav>
    </aside>
  )
  return (
    <ShellFrame
      navigation={sidebar}
      header={
        <ShellHeader title="Platform Administration" contextLabel="Restricted demo context" />
      }
    >
      <div
        className="mb-4 grid gap-2 lg:hidden"
        aria-label="Platform administration mobile navigation"
      >
        {nav.map((route) => (
          <NavigationItem
            key={route.id}
            to={route.path}
            label={route.title}
            end={route.path === '/admin'}
          />
        ))}
      </div>
      <Outlet />
    </ShellFrame>
  )
}
