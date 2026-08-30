import { Button } from '@shared/components/Button'
import { useEffect, useId, useRef, type PropsWithChildren } from 'react'

interface DialogProps extends PropsWithChildren {
  open: boolean
  title: string
  description?: string
  initialFocusSelector?: string
  onClose: () => void
}
export function Dialog({
  children,
  description,
  initialFocusSelector,
  onClose,
  open,
  title
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const previous = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!open) return
    previous.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const node = panel.current
    const focusable = () =>
      [
        ...(node?.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        ) ?? [])
      ].filter((item) => !item.hasAttribute('disabled'))
    const initialFocus = initialFocusSelector
      ? node?.querySelector<HTMLElement>(initialFocusSelector)
      : undefined
    ;(initialFocus ?? focusable()[0])?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.removeEventListener('keydown', keydown)
      document.body.style.overflow = previousOverflow
      previous.current?.focus()
    }
  }, [initialFocusSelector, onClose, open])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panel}
        className="max-h-[85dvh] w-full max-w-xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-600">
                {description}
              </p>
            )}
          </div>
          <Button variant="quiet" aria-label="Close dialog" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
