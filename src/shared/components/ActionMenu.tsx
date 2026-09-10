import { MoreHorizontal, type LucideIcon } from 'lucide-react'
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
  onAction
}: {
  items: readonly ActionMenuItem[]
  label?: string
  onAction: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)

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
        icon={<MoreHorizontal className="size-5" />}
        variant="quiet"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
      />
      {open ? (
        <div
          id={id}
          role="menu"
          className="action-menu"
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
                onClick={() => {
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
        </div>
      ) : null}
    </div>
  )
}
