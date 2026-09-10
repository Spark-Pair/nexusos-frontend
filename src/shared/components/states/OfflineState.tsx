import { WifiOff } from 'lucide-react'
import { StatePanel } from './StatePanel'

interface OfflineStateProps {
  compact?: boolean
}

export function OfflineState({ compact = false }: OfflineStateProps) {
  return (
    <StatePanel
      compact={compact}
      icon={WifiOff}
      tone="warning"
      title="You are offline"
      description="Previously available data remains accessible; network actions will wait."
    />
  )
}
