export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="placeholder-title"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
        Phase 2 route foundation
      </p>
      <h1 id="placeholder-title" className="mt-2 text-2xl font-semibold">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        This route and its access boundary are ready. Product behavior is intentionally deferred to
        its approved implementation phase.
      </p>
    </section>
  )
}
