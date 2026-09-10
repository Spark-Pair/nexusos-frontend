import { PackageOpen } from 'lucide-react'
import { StatePanel } from './StatePanel'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ actionLabel, description, onAction, title }: EmptyStateProps) {
  return (
    <StatePanel
      title={title}
      description={description}
      icon={PackageOpen}
      tone="brand"
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}
