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
    <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:min-h-[660px] lg:grid-cols-[1.05fr_0.95fr] dark:border-white/10 dark:bg-slate-950/90 dark:shadow-none">
      <div className="pointer-events-none absolute -left-28 -top-28 size-72 rounded-full bg-emerald-100 blur-3xl dark:bg-emerald-950/40" />
      <div className="pointer-events-none absolute -bottom-36 right-10 size-80 rounded-full bg-blue-100 blur-3xl dark:bg-blue-950/30" />
      {toolbar ? <div className="absolute right-4 top-4 z-10">{toolbar}</div> : null}
      <section className="relative hidden border-r border-slate-200/80 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-10 lg:flex lg:flex-col dark:border-white/10 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/30">
        <div className="flex items-center gap-3">
          <span className="brand-mark shadow-sm">N</span>
          <div>
            <p className="text-sm font-bold">NexusOS</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Messaging workspace</p>
          </div>
        </div>
        <div className="my-auto max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            SparkPair workspace
          </p>
          <h2 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-slate-950 dark:text-white xl:text-5xl">
            Business chats, broadcasts and customers in one calm inbox.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
            Sign in once, keep your conversations available on this device, and let NexusOS sync
            your updates when the internet comes back.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'Google-only sign in for normal users.',
              'Offline PWA keeps recent chats ready.',
              'Business access is requested after login.'
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-[11px] text-[var(--color-primary)] dark:bg-emerald-950">
                  ?
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          NexusOS ? A SparkPair product
        </p>
      </section>
      <section className="relative grid place-items-center p-3 pt-16 sm:min-h-[700px] sm:p-8 lg:min-h-0 lg:p-10">
        <div className="w-full max-w-[29rem] rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none dark:border-white/10 dark:bg-slate-900/90 dark:lg:bg-transparent">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
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
