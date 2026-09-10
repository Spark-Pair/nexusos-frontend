import { GitCompareArrows } from 'lucide-react'
import { StatePanel } from './StatePanel'

export function ConflictState({ onReview }: { onReview?: () => void }) {
  return (
    <StatePanel
      compact
      icon={GitCompareArrows}
      tone="warning"
      title="Changes need review"
      description="A newer authoritative version exists. Review both versions before choosing what to keep."
      actionLabel={onReview ? 'Review conflict' : undefined}
      onAction={onReview}
    />
  )
}
