interface ErrorStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function ErrorState({ title, description, actionLabel, onAction }: ErrorStateProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-6" role="alert">
      <section className="max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        {actionLabel && onAction && (
          <button className="button-primary mt-6" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </section>
    </main>
  )
}
