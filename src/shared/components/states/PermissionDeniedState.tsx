import { ShieldX } from 'lucide-react'
import { StatePanel } from './StatePanel'

export function PermissionDeniedState({ onGoBack }: { onGoBack?: () => void }) {
  return (
    <StatePanel
      compact
      icon={ShieldX}
      tone="danger"
      role="alert"
      title="Permission required"
      description="Your current account or workspace cannot access this action. Server permissions remain authoritative."
      actionLabel={onGoBack ? 'Go back' : undefined}
      onAction={onGoBack}
    />
  )
}
