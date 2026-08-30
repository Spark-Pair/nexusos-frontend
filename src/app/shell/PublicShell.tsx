import { useAppServices } from '@app/providers/useAppServices'
import { Outlet, Link } from 'react-router'
import { DevelopmentIdentitySwitcher } from '@/features/authentication/DevelopmentIdentitySwitcher'
export default function PublicShell() {
  const { showDevelopmentControls } = useAppServices()
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link className="mr-auto text-xl font-semibold" to="/">
            NexusOS
          </Link>
          <Link className="min-h-11 px-3 py-3 text-sm" to="/help">
            Help
          </Link>
          <Link className="min-h-11 px-3 py-3 text-sm" to="/sign-in">
            Sign in
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
      {showDevelopmentControls && (
        <aside className="fixed bottom-4 right-4 z-30 w-72 rounded-2xl border border-amber-200 bg-white p-3 shadow-lg">
          <DevelopmentIdentitySwitcher />
        </aside>
      )}
    </div>
  )
}
