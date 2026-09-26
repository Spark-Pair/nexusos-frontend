import { Button } from '@shared/components/Button'
import { motion } from 'framer-motion'
import { useEffect, useId, useRef, type PropsWithChildren } from 'react'

interface DialogProps extends PropsWithChildren {
  open: boolean
  title: string
  description?: string
  initialFocusSelector?: string
  onClose: () => void
  placement?: 'center' | 'right'
}

function asHistoryState(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function Dialog({
  children,
  description,
  initialFocusSelector,
  onClose,
  open,
  placement = 'center',
  title
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const previous = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!open) return
    const currentState = asHistoryState(window.history.state as unknown)
    window.history.pushState(
      { ...currentState, __nexusDialogId: titleId },
      '',
      window.location.href
    )
    let dismissedByBack = false
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
        onCloseRef.current()
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
    const popstate = () => {
      if (asHistoryState(window.history.state as unknown).__nexusDialogId === titleId) return
      dismissedByBack = true
      onCloseRef.current()
    }
    document.addEventListener('keydown', keydown)
    window.addEventListener('popstate', popstate)
    return () => {
      document.removeEventListener('keydown', keydown)
      window.removeEventListener('popstate', popstate)
      document.body.style.overflow = previousOverflow
      previous.current?.focus()
      if (
        !dismissedByBack &&
        asHistoryState(window.history.state as unknown).__nexusDialogId === titleId
      )
        window.history.back()
    }
  }, [initialFocusSelector, open, titleId])
  if (!open) return null
  return (
    <motion.div
      className={`fixed inset-0 z-50 grid bg-slate-950/40  ${
        placement === 'right'
          ? 'justify-items-end'
          : 'items-end justify-items-center p-0 sm:place-items-center sm:p-4'
      }`}
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.div
        ref={panel}
        className={
          placement === 'right'
            ? 'h-dvh w-full max-w-md overflow-auto border-l border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950'
            : 'max-h-[88dvh] w-full max-w-xl overflow-auto rounded-t-[var(--radius-surface)] border border-slate-200 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:border-slate-700 dark:bg-slate-950 sm:max-h-[85dvh] sm:rounded-[var(--radius-surface)] sm:pb-5'
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <Button variant="quiet" aria-label="Close dialog" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </motion.div>
    </motion.div>
  )
}
