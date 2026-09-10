import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { IconButton } from './IconButton'

export type ToastTone = 'info' | 'success' | 'warning' | 'danger'

export function Toast({
  action,
  children,
  onClose,
  title,
  tone = 'info'
}: PropsWithChildren<{
  title: string
  tone?: ToastTone
  onClose?: () => void
  action?: { label: string; onClick: () => void }
}>) {
  const config = {
    info: { icon: Info, style: 'text-blue-600 dark:text-blue-300' },
    success: { icon: CheckCircle2, style: 'text-emerald-600 dark:text-emerald-300' },
    warning: { icon: TriangleAlert, style: 'text-amber-600 dark:text-amber-300' },
    danger: { icon: XCircle, style: 'text-rose-600 dark:text-rose-300' }
  }[tone]
  const Icon = config.icon
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className="toast-surface">
      <Icon className={`mt-0.5 size-5 shrink-0 ${config.style}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{title}</p>
        <div className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {children}
        </div>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 rounded-[var(--radius-control)] border border-slate-300 px-2.5 py-1 text-xs font-semibold dark:border-slate-700"
          >
            {action.label}
          </button>
        ) : null}
      </div>
      {onClose ? (
        <IconButton
          onClick={onClose}
          label="Dismiss notification"
          icon={<X className="size-4" />}
          size="sm"
          variant="quiet"
        />
      ) : null}
    </div>
  )
}
