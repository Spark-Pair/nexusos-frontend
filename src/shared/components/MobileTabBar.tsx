import { AppIcon, type AppIconName } from './AppIcon'

export interface MobileTabItem {
  id: string
  label: string
  icon: AppIconName
  badge?: number
}

export function MobileTabBar({
  activeId,
  items,
  onChange
}: {
  activeId: string
  items: MobileTabItem[]
  onChange: (id: string) => void
}) {
  return (
    <nav
      aria-label="Primary"
      className="bg-slate-50/80 px-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2.5 dark:bg-slate-950"
    >
      <div
        className="floating-nav grid gap-1 p-1.5"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange(item.id)}
              className={`spring-interaction relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-control)] border text-[10px] font-semibold transition duration-200  ${active ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200' : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-400 dark:hover:border-slate-800 dark:hover:bg-slate-900'}`}
            >
              <span className="relative">
                <AppIcon name={item.icon} className="size-[21px]" />
                {item.badge ? (
                  <span className="absolute -right-2 -top-1 grid min-w-4 place-items-center rounded-full border border-white bg-blue-600 px-1 text-[9px] text-white dark:border-slate-950">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
