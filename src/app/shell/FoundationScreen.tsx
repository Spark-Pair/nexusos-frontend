import { useAppServices } from '@app/providers/useAppServices'
import { OfflineState } from '@shared/components/states/OfflineState'
import { useNetworkStatus } from '@shared/hooks/useNetworkStatus'
import { usePwaLifecycle } from '@shared/hooks/usePwaLifecycle'
import { useState } from 'react'

export default function FoundationScreen() {
  const { demoData, showDevelopmentControls } = useAppServices()
  const isOnline = useNetworkStatus()
  const { canInstall, install, needRefresh, offlineReady, update } = usePwaLifecycle()
  const [resetMessage, setResetMessage] = useState<string>()

  const resetDemoData = async () => {
    if (!window.confirm('Reset all local NexusOS demo data on this device?')) return
    await demoData.reset()
    setResetMessage('Local demo data was reset.')
  }

  return (
    <main className="min-h-dvh bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-5xl flex-col">
        {!isOnline && <OfflineState compact />}
        <header className="flex items-center justify-between py-4">
          <a className="text-lg font-semibold tracking-tight" href="/" aria-label="NexusOS home">
            NexusOS
          </a>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            Foundation · Phase 1
          </span>
        </header>

        <section className="my-auto max-w-3xl py-20" aria-labelledby="foundation-title">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            SparkPair
          </p>
          <h1 id="foundation-title" className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Everything around your business, connected.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            The production foundation is ready. Customer, Business, and Platform Admin experiences
            begin in later approved phases.
          </p>

          <div className="mt-10 flex flex-wrap gap-3" aria-live="polite">
            {canInstall && (
              <button className="button-primary" type="button" onClick={() => void install()}>
                Install NexusOS
              </button>
            )}
            {needRefresh && (
              <button className="button-primary" type="button" onClick={() => void update()}>
                Update available · reload
              </button>
            )}
            {showDevelopmentControls && (
              <button
                className="button-secondary"
                type="button"
                onClick={() => void resetDemoData()}
              >
                Reset demo data
              </button>
            )}
          </div>
          {offlineReady && (
            <p className="mt-4 text-sm text-emerald-700">NexusOS is ready for offline use.</p>
          )}
          {resetMessage && <p className="mt-4 text-sm text-slate-600">{resetMessage}</p>}
        </section>

        <footer className="border-t border-slate-200 py-5 text-sm text-slate-500">
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          <span aria-hidden="true"> · </span>
          <span>Local-first foundation</span>
        </footer>
      </div>
    </main>
  )
}
