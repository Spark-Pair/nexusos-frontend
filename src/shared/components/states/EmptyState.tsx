interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </section>
  )
}
