import { AdminShell } from '@shared/components/AdminShell'
import { Button } from '@shared/components/Button'
import { EmptyState } from '@shared/components/states/EmptyState'
import { ArrowLeft, Flag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from './adminApi'
import { useAuthSession } from '@/features/authentication/authSession'
export default function AdminReportsPage() {
  const { session, signOut } = useAuthSession()
  const nav = useNavigate()
  const [reports, setReports] = useState<Awaited<ReturnType<typeof adminApi.reports>>>([])
  const [error, setError] = useState('')
  const resolve = async (
    broadcastId: string,
    customerId: string,
    action: 'dismissed' | 'suppressed'
  ) => {
    try {
      await adminApi.resolveReport(session!.token, broadcastId, customerId, action)
      setReports((current) =>
        current.filter((item) => item.broadcastId !== broadcastId || item.customerId !== customerId)
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to resolve report.')
    }
  }
  useEffect(() => {
    void adminApi
      .reports(session!.token)
      .then(setReports)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unable to load reports.'))
  }, [session])
  return (
    <AdminShell onSignOut={() => void signOut()}>
      <div className="mx-auto max-w-4xl">
        <header className="app-panel flex items-center gap-3 p-5">
          <Button variant="quiet" onClick={() => void nav('/admin/users')}>
            <ArrowLeft className="size-4" />
            Users
          </Button>
          <Flag />
          <h1 className="text-2xl font-bold">Reported broadcasts</h1>
        </header>
        {error ? <p role="alert">{error}</p> : null}
        <section className="mt-3 grid gap-3">
          {reports.length ? (
            reports.map((report) => (
              <article className="app-panel p-5" key={`${report.broadcastId}-${report.customerId}`}>
                <p className="text-xs text-slate-500">
                  Reported by {report.customerName} · {report.reportedAt.toLocaleString()}
                </p>
                <h2 className="mt-2 font-bold">
                  {report.businessName}: {report.title}
                </h2>
                <p className="mt-2 text-sm">{report.body}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() => void resolve(report.broadcastId, report.customerId, 'dismissed')}
                  >
                    Dismiss report
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      void resolve(report.broadcastId, report.customerId, 'suppressed')
                    }
                  >
                    Suppress broadcast
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="No reports"
              description="Reported broadcast content will appear here for review."
            />
          )}
        </section>
      </div>
    </AdminShell>
  )
}
