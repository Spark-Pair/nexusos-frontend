import { Button } from '@shared/components/Button'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type StateTone = 'neutral' | 'brand' | 'warning' | 'danger'

interface StatePanelProps {
  title: string
  description: ReactNode
  icon: LucideIcon
  tone?: StateTone
  role?: 'alert' | 'status'
  actionLabel?: string | undefined
  onAction?: (() => void) | undefined
  compact?: boolean
  fullPage?: boolean
}

const toneClass: Record<StateTone, string> = {
  neutral: 'state-panel-neutral',
  brand: 'state-panel-brand',
  warning: 'state-panel-warning',
  danger: 'state-panel-danger'
}

export function StatePanel({
  actionLabel,
  compact = false,
  description,
  fullPage = false,
  icon: Icon,
  onAction,
  role = 'status',
  title,
  tone = 'neutral'
}: StatePanelProps) {
  const panel = (
    <section className={`state-panel ${compact ? 'state-panel-compact' : ''} ${toneClass[tone]}`}>
      <span className="state-panel-icon" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <h2 className="font-semibold">{title}</h2>
        <div className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </div>
        {actionLabel && onAction ? (
          <Button className="mt-4" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </section>
  )

  return fullPage ? (
    <main
      className="grid min-h-dvh place-items-center bg-slate-50 px-6 dark:bg-slate-950"
      role={role}
    >
      {panel}
    </main>
  ) : (
    <div role={role}>{panel}</div>
  )
}
