import { CircleAlert } from 'lucide-react'
import { StatePanel } from './StatePanel'

interface ErrorStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

export function ErrorState({
  title,
  description,
  actionLabel,
  compact = false,
  onAction
}: ErrorStateProps) {
  return (
    <StatePanel
      title={title}
      description={description}
      icon={CircleAlert}
      tone="danger"
      role="alert"
      compact={compact}
      fullPage={!compact}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}
