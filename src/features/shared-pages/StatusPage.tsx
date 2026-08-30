import { Link } from 'react-router'
export function UnauthorizedPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 p-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold text-rose-700">Access boundary</p>
        <h1 className="mt-2 text-3xl font-semibold">Unauthorized</h1>
        <p className="mt-3 text-slate-600">
          This development identity does not have access to that NexusOS area.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 text-white"
          to="/"
        >
          Return home
        </Link>
      </section>
    </main>
  )
}
export function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 p-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold text-cyan-700">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-slate-600">The requested NexusOS route does not exist.</p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 text-white"
          to="/"
        >
          Return home
        </Link>
      </section>
    </main>
  )
}
