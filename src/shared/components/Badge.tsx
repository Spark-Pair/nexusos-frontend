import type { PropsWithChildren } from 'react'

type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: BadgeTone }>) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
