interface OfflineStateProps {
  compact?: boolean
}

export function OfflineState({ compact = false }: OfflineStateProps) {
  return (
    <aside
      className={
        compact
          ? 'rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950'
          : 'rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-950'
      }
      role="status"
    >
      <strong>You are offline.</strong>{' '}
      <span>Previously available data remains accessible; network actions will wait.</span>
    </aside>
  )
}
