import { ShellStatus } from '@shared/components/ShellStatus'
import type { PropsWithChildren, ReactNode } from 'react'
import { GlobalSearch } from '@/features/global-search/GlobalSearch'
import { NotificationCenter } from '@/features/notifications/NotificationCenter'
interface ShellFrameProps extends PropsWithChildren {
  header: ReactNode
  navigation?: ReactNode
  mobileNavigation?: ReactNode
}
export function ShellFrame({ children, header, mobileNavigation, navigation }: ShellFrameProps) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      {navigation}
      <div className={navigation ? 'lg:pl-72' : ''}>
        {header}
        <div className="px-4 py-4">
          <ShellStatus />
        </div>
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-3 lg:pb-8">{children}</main>
      </div>
      {mobileNavigation}
      <GlobalSearch />
      <NotificationCenter />
    </div>
  )
}
