export function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-6" aria-busy="true">
      <div className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-700"
        />
        <p className="mt-4 text-sm text-slate-600">Loading NexusOS…</p>
      </div>
    </main>
  )
}
