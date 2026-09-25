import { AppIcon, type AppIconName } from './AppIcon'
import { haptic } from '@/shared/motion/haptics'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

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
  const reducedMotion = useReducedMotion()
  const onChangeRef = useRef(onChange)
  const itemsRef = useRef(items)
  const activeIdRef = useRef(activeId)
  onChangeRef.current = onChange
  itemsRef.current = items
  activeIdRef.current = activeId
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId)
  )

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
            <button
              key={item.id}
              type="button"
              aria-label={
                item.badge
                  ? `${item.label}, ${item.badge > 99 ? '99+' : item.badge} unread`
                  : item.label
              }
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                if (!active) haptic('light')
                onChange(item.id)
              }}
              className={`mobile-app-tab spring-interaction relative flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${active ? 'mobile-app-tab-active' : ''}`}
            >
              <span className="relative grid size-8 place-items-center">
                {active ? (
                  <motion.span
                    layoutId="mobile-active-tab-indicator"
                    className="mobile-app-tab-indicator absolute inset-0 rounded-[var(--radius-control)]"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 32, mass: 0.72 }
                    }
                  />
                ) : null}
                <AppIcon name={item.icon} className="relative z-10 size-5" />
                {item.badge ? (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-0.5 z-20 grid min-w-4 place-items-center rounded-full border border-white bg-blue-600 px-1 text-[9px] text-white dark:border-slate-950"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
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
