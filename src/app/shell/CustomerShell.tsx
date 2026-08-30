import { appRoutes } from '@app/routing/routes'
import { ShellFrame } from '@app/shell/ShellFrame'
import { NavigationItem } from '@shared/components/NavigationItem'
import { ShellHeader } from '@shared/components/ShellHeader'
import { Outlet } from 'react-router'
const nav = appRoutes.filter((route) => route.area === 'customer' && route.primaryNav)
export default function CustomerShell() {
  return (
    <ShellFrame
      header={<ShellHeader title="Customer" contextLabel="NexusOS Customer" />}
      mobileNavigation={
        <nav
          aria-label="Customer primary"
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-white p-2 pb-[max(.5rem,env(safe-area-inset-bottom))] lg:hidden"
        >
          {nav.map((route) => (
            <NavigationItem compact key={route.id} to={route.path} label={route.title} />
          ))}
        </nav>
      }
    >
      <div className="mb-4 hidden gap-2 lg:flex" aria-label="Customer primary navigation">
        {nav.map((route) => (
          <NavigationItem key={route.id} to={route.path} label={route.title} />
        ))}
      </div>
      <Outlet />
    </ShellFrame>
  )
}
