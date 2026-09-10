import type { LucideIcon } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'

export interface FrameNavigationItem {
  id: string
  label: string
  icon: LucideIcon
  count?: number
}

export function ApplicationFrame({
  activeId,
  brandLabel,
  children,
  navigation,
  roleLabel,
  toolbar
}: PropsWithChildren<{
  activeId: string
  brandLabel: string
  navigation: readonly FrameNavigationItem[]
  roleLabel: string
  toolbar?: ReactNode
}>) {
  return (
    <div className="layout-frame">
      <aside className="layout-sidebar">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="brand-mark">N</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{brandLabel}</p>
            <p className="truncate text-[11px] text-slate-500">{roleLabel}</p>
          </div>
        </div>
        <nav className="mt-5 grid gap-1" aria-label={`${roleLabel} preview navigation`}>
          {navigation.map((item) => {
            const Icon = item.icon
            const active = item.id === activeId
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                className={`layout-nav-item ${active ? 'layout-nav-item-active' : ''}`}
              >
                <Icon className="size-[18px]" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                {item.count ? (
                  <span className="rounded-full border border-blue-300 bg-blue-50 px-1.5 text-[10px] text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                    {item.count}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto rounded-[var(--radius-surface)] border border-slate-300 p-3 text-xs text-slate-500 dark:border-slate-700">
          Mock layout preview
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="layout-header">
          <div>
            <p className="text-[11px] font-semibold text-slate-500">{roleLabel}</p>
            <p className="text-sm font-bold">
              {navigation.find((item) => item.id === activeId)?.label}
            </p>
          </div>
          <div className="flex items-center gap-2">{toolbar}</div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">{children}</div>
        <nav className="layout-mobile-nav" aria-label={`${roleLabel} mobile preview navigation`}>
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = item.id === activeId
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                className={`layout-mobile-nav-item ${active ? 'layout-mobile-nav-item-active' : ''}`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export function AuthenticationFrame({
  children,
  toolbar
}: PropsWithChildren<{ toolbar?: ReactNode }>) {
  return (
    <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-300 bg-white lg:min-h-[620px] lg:grid-cols-[0.95fr_1.05fr] dark:border-slate-700 dark:bg-slate-900">
      {toolbar ? <div className="absolute right-4 top-4 z-10">{toolbar}</div> : null}
      <section className="hidden border-r border-slate-200 bg-slate-50/80 p-10 lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex items-center gap-3">
          <span className="brand-mark">N</span>
          <div>
            <p className="text-sm font-bold">NexusOS</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Messaging workspace</p>
          </div>
        </div>
        <div className="my-auto">
          <p className="max-w-md text-4xl font-bold tracking-tight">
            Messages, broadcasts and customer chats in one quiet workspace.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'Customer signup stays simple.',
              'Business accounts come from the admin panel.',
              'Chats and broadcasts land in the same inbox.'
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="size-2 rounded-full bg-blue-600" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">NexusOS - A SparkPair product</p>
      </section>
      <section className="grid place-items-center p-4 pt-16 sm:min-h-[680px] sm:p-10 lg:min-h-0">
        <div className="w-full max-w-[28rem] rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:border-0 lg:bg-transparent lg:p-0 dark:border-slate-800 dark:bg-slate-900 dark:lg:bg-transparent">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <span className="brand-mark">N</span>
            <div>
              <p className="text-sm font-bold">NexusOS</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Messaging workspace</p>
            </div>
          </div>
          {children}
        </div>
      </section>
    </div>
  )
}
