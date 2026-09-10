import {
  Ban,
  BellOff,
  CheckCircle2,
  Clock3,
  CloudOff,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  TriangleAlert
} from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'

export type DeliveryState = 'local' | 'queued' | 'server-accepted' | 'delivered' | 'failed'

const deliveryStateConfig: Record<
  DeliveryState,
  {
    label: string
    description: string
    tone: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'
    icon: typeof Clock3
  }
> = {
  local: {
    label: 'Saved locally',
    description: 'Stored on this device only.',
    tone: 'neutral',
    icon: CloudOff
  },
  queued: {
    label: 'Pending synchronization',
    description: 'Waiting for a backend connection.',
    tone: 'warning',
    icon: Clock3
  },
  'server-accepted': {
    label: 'Accepted by server',
    description: 'The backend acknowledged the request.',
    tone: 'brand',
    icon: CheckCircle2
  },
  delivered: {
    label: 'Delivered',
    description: 'External delivery was acknowledged.',
    tone: 'success',
    icon: ShieldCheck
  },
  failed: {
    label: 'Synchronization failed',
    description: 'The request needs attention or a safe retry.',
    tone: 'danger',
    icon: TriangleAlert
  }
}

export function DeliveryStateIndicator({
  compact = false,
  state
}: {
  state: DeliveryState
  compact?: boolean
}) {
  const config = deliveryStateConfig[state]
  const Icon = config.icon
  if (compact)
    return (
      <Badge tone={config.tone}>
        <Icon className="mr-1 size-3.5" aria-hidden="true" />
        {config.label}
      </Badge>
    )
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-surface)] border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-control)] border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-bold">{config.label}</p>
        <p className="mt-1 text-[11px] leading-4 text-slate-500">{config.description}</p>
      </div>
    </div>
  )
}

export function PolicyNotice({
  children,
  title,
  tone = 'privacy'
}: PropsWithChildren<{ title: string; tone?: 'privacy' | 'warning' | 'blocked' }>) {
  const Icon = tone === 'blocked' ? ShieldX : tone === 'warning' ? TriangleAlert : ShieldCheck
  const styles =
    tone === 'blocked'
      ? 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30'
      : tone === 'warning'
        ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
        : 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
  return (
    <aside className={`rounded-[var(--radius-surface)] border p-4 ${styles}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <div className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
            {children}
          </div>
        </div>
      </div>
    </aside>
  )
}

export function CommunicationPreferences({
  blocked = false,
  followed = true,
  muted = false,
  onBlock,
  onMute,
  onUnfollow
}: {
  followed?: boolean
  muted?: boolean
  blocked?: boolean
  onMute?: () => void
  onUnfollow?: () => void
  onBlock?: () => void
}) {
  return (
    <section className="rounded-[var(--radius-surface)] border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Communication controls</p>
          <p className="mt-1 text-xs text-slate-500">
            Customer-owned consent and safety preferences.
          </p>
        </div>
        <Badge tone={blocked ? 'danger' : followed ? 'success' : 'neutral'}>
          {blocked ? 'Blocked' : followed ? 'Following' : 'Not following'}
        </Badge>
      </div>
      <div className="mt-4 grid gap-2">
        <button type="button" onClick={onMute} className="preference-action">
          <BellOff className="size-4" />
          {muted ? 'Unmute updates' : 'Mute updates'}
          <span className="ml-auto text-[10px] text-slate-400">Local preference</span>
        </button>
        <button type="button" onClick={onUnfollow} className="preference-action">
          <RefreshCw className="size-4" />
          Unfollow business
          <span className="ml-auto text-[10px] text-slate-400">Confirmation required</span>
        </button>
        <button
          type="button"
          onClick={onBlock}
          className="preference-action text-rose-600 dark:text-rose-300"
        >
          <Ban className="size-4" />
          Block business
          <span className="ml-auto text-[10px] text-rose-400">Suppresses marketing</span>
        </button>
      </div>
    </section>
  )
}

export function FrequencyWarning({
  recentCount,
  onReview
}: {
  recentCount: number
  onReview?: () => void
}) {
  return (
    <PolicyNotice title="Frequency protection" tone="warning">
      <p>
        This customer received {recentCount} business updates recently. Backend policy must approve
        another delivery.
      </p>
      {onReview ? (
        <Button className="mt-3" size="sm" onClick={onReview}>
          Review audience rules
        </Button>
      ) : null}
    </PolicyNotice>
  )
}
