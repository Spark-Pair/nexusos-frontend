import { useEffect, useRef } from 'react'
import { AppIcon, type AppIconName } from './AppIcon'
import { haptic } from '@/shared/motion/haptics'

export interface MobileTabItem {
  id: string
  label: string
  icon: AppIconName
  badge?: number
  onBadgeClick?: () => void
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
  const onChangeRef = useRef(onChange)
  const itemsRef = useRef(items)
  const activeIdRef = useRef(activeId)
  onChangeRef.current = onChange
  itemsRef.current = items
  activeIdRef.current = activeId
  useEffect(() => {
    let start: { x: number; y: number; at: number } | undefined
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !event.isPrimary) return
      const target = event.target
      if (!(target instanceof Element) || !target.closest('[data-mobile-swipe]')) return
      if (
        target.closest(
          'a, button, input, textarea, select, [role="button"], [contenteditable="true"], [data-no-page-swipe]'
        )
      )
        return
      start = { x: event.clientX, y: event.clientY, at: Date.now() }
    }
    const up = (event: PointerEvent) => {
      if (!start || event.pointerType !== 'touch') return
      const dx = event.clientX - start.x
      const dy = event.clientY - start.y
      const elapsed = Date.now() - start.at
      start = undefined
      if (elapsed > 700 || Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.25) return
      const currentItems = itemsRef.current
      const currentIndex = currentItems.findIndex((item) => item.id === activeIdRef.current)
      if (currentIndex < 0) return
      const nextIndex = Math.max(
        0,
        Math.min(currentItems.length - 1, currentIndex + (dx < 0 ? 1 : -1))
      )
      if (nextIndex === currentIndex) return
      event.preventDefault()
      haptic('selection')
      onChangeRef.current(currentItems[nextIndex]!.id)
    }
    const cancel = () => {
      start = undefined
    }
    window.addEventListener('pointerdown', down, true)
    window.addEventListener('pointerup', up, true)
    window.addEventListener('pointercancel', cancel, true)
    return () => {
      window.removeEventListener('pointerdown', down, true)
      window.removeEventListener('pointerup', up, true)
      window.removeEventListener('pointercancel', cancel, true)
    }
  }, [])

  return (
    <nav aria-label="Primary" className="mobile-app-bar">
      <div
        className="mobile-app-bar-inner grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <span key={item.id} className="relative flex min-w-0 justify-center">
              <button
                type="button"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  if (!active) haptic('light')
                  onChange(item.id)
                }}
                className={`mobile-app-tab spring-interaction relative flex min-h-14 w-full flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${active ? 'mobile-app-tab-active' : ''}`}
              >
                <span className="relative grid size-8 place-items-center">
                  {active ? (
                    <span className="mobile-app-tab-indicator absolute inset-0 rounded-[var(--radius-control)]" />
                  ) : null}
                  <AppIcon name={item.icon} className="relative z-10 size-5" />
                </span>
                {item.label}
              </button>
              {item.badge ? (
                item.onBadgeClick ? (
                  <button
                    type="button"
                    data-no-page-swipe
                    aria-label={`Show ${item.badge} unread chats`}
                    onClick={() => {
                      haptic('light')
                      item.onBadgeClick?.()
                    }}
                    className="absolute left-[calc(50%+0.55rem)] top-0.5 z-30 grid min-h-5 min-w-5 place-items-center rounded-full border border-white bg-blue-600 px-1 text-[9px] font-semibold text-white shadow-sm dark:border-slate-950"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </button>
                ) : (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-[calc(50%+0.55rem)] top-0.5 z-20 grid min-h-5 min-w-5 place-items-center rounded-full border border-white bg-blue-600 px-1 text-[9px] font-semibold text-white dark:border-slate-950"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )
              ) : null}
            </span>
          )
        })}
      </div>
    </nav>
  )
}
