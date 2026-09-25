import { MoreHorizontal, MoreVertical, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { IconButton } from './IconButton'

export interface ActionMenuItem {
  id: string
  label: string
  icon: LucideIcon
  tone?: 'default' | 'danger'
  disabled?: boolean
}

export function ActionMenu({
  items,
  label = 'Open actions',
  onAction,
  direction = 'horizontal'
}: {
  items: readonly ActionMenuItem[]
  label?: string
  onAction: (id: string) => void
  direction?: 'horizontal' | 'vertical'
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeWhenAnotherOpens = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) setOpen(false)
    }
    window.addEventListener('nexusos-action-menu-open', closeWhenAnotherOpens)
    return () => window.removeEventListener('nexusos-action-menu-open', closeWhenAnotherOpens)
  }, [id])

  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus()
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        root.current?.querySelector<HTMLButtonElement>('[aria-haspopup]')?.focus()
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <IconButton
        label={label}
        icon={
          direction === 'vertical' ? (
            <MoreVertical className="size-5" />
          ) : (
            <MoreHorizontal className="size-5" />
          )
        }
        variant="quiet"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          setOpen((current) => {
            const next = !current
            if (next)
              window.dispatchEvent(new CustomEvent('nexusos-action-menu-open', { detail: id }))
            return next
          })
        }}
      />
      {open ? (
        <motion.div
          id={id}
          role="menu"
          className="action-menu"
          initial={{ opacity: 0, scale: 0.97, y: -3 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.55 }}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const buttons = [
              ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
                '[role="menuitem"]:not(:disabled)'
              )
            ]
            const index = buttons.findIndex((button) => button === document.activeElement)
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? buttons.length - 1
                  : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
            buttons[next]?.focus()
          }}
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={(event) => {
                  event.stopPropagation()
                  onAction(item.id)
                  setOpen(false)
                }}
                className={`action-menu-item ${item.tone === 'danger' ? 'text-rose-600 dark:text-rose-300' : ''}`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </motion.div>
      ) : null}
    </div>
  )
}
