import { AdminShell } from '@shared/components/AdminShell'
import { Button } from '@shared/components/Button'
import { DataTable, type DataColumn } from '@shared/components/DataTable'
import { Dialog } from '@shared/components/Dialog'
import { PageHeader } from '@shared/components/PageHeader'
import { SearchField } from '@shared/components/SearchField'
import { useToast } from '@shared/components/toastContext'
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Flag,
  Phone,
  Trash2,
  Users,
  XCircle
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, type AdminUser, type BusinessRequest } from './adminApi'
import { useAuthSession } from '@/features/authentication/authSession'

const date = (value: Date | null) =>
  value
    ? new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
    : 'Never'

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const { session, signOut } = useAuthSession()
  const toast = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [requests, setRequests] = useState<BusinessRequest[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string>()
  const [deleteTarget, setDeleteTarget] = useState<AdminUser>()
  const [deleting, setDeleting] = useState(false)
  const [resolvingRequest, setResolvingRequest] = useState('')
  const load = useCallback(
    async (search: string) => {
      try {
        const [nextUsers, nextRequests] = await Promise.all([
          adminApi.users(session!.token, search),
          adminApi.businessRequests(session!.token)
        ])
        setUsers(nextUsers)
        setRequests(nextRequests)
        setError(undefined)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Unable to load administration data.')
      }
    },
    [session]
  )
  useEffect(() => {
    void load('')
  }, [load])
  const resolveRequest = async (request: BusinessRequest, decision: 'approved' | 'rejected') => {
    if (resolvingRequest) return
    setResolvingRequest(request.id + ':' + decision)
    try {
      const updated = await adminApi.resolveBusinessRequest(session!.token, request.id, decision)
      setRequests((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      if (decision === 'approved') await load(query)
      toast({
        title: decision === 'approved' ? 'Business approved' : 'Request rejected',
        description:
          decision === 'approved'
            ? `${request.businessName} can now use business tools.`
            : `${request.businessName} was not upgraded.`,
        tone: 'success'
      })
    } catch (cause) {
      toast({
        title: 'Request not updated',
        description: cause instanceof Error ? cause.message : 'Please try again.',
        tone: 'danger'
      })
    } finally {
      setResolvingRequest('')
    }
  }
  const columns: DataColumn<AdminUser>[] = [
    {
      id: 'user',
      header: 'User',
      cell: (user) => (
        <span>
          <span className="block font-bold">{user.name}</span>
          <span className="text-xs text-slate-500">@{user.username}</span>
        </span>
      )
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: (user) => (
        <span>
          <span className="block">{user.email ?? 'No email'}</span>
          <span className="text-xs text-slate-500">{user.phone ?? 'No phone'}</span>
        </span>
      )
    },
    {
      id: 'type',
      header: 'Type',
      cell: (user) => <span className="capitalize">{user.accountKind}</span>
    },
    {
      id: 'signup',
      header: 'Signed up',
      cell: (user) => <span className="capitalize">{user.signupMethod}</span>
    },
    {
      id: 'login',
      header: 'Last login',
      cell: (user) => (
        <span>
          <span className="block capitalize">{user.lastLoginMethod ?? 'Never'}</span>
          <span className="text-xs text-slate-500">{date(user.lastLoginAt)}</span>
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      cell: (user) => (
        <span className={user.isActive ? 'text-emerald-700' : 'text-red-600'}>
          {user.deletedAt ? 'Deleted' : user.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (user) => (
        <span className="flex gap-2">
          <Button
            size="sm"
            variant={user.isActive ? 'quiet' : 'primary'}
            disabled={Boolean(user.deletedAt)}
            onClick={() =>
              void adminApi
                .setActive(session!.token, user.id, !user.isActive)
                .then((updated) =>
                  setUsers((current) =>
                    current.map((item) => (item.id === updated.id ? updated : item))
                  )
                )
                .catch((cause: unknown) =>
                  setError(cause instanceof Error ? cause.message : 'Update failed.')
                )
            }
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={Boolean(user.deletedAt)}
            aria-label={`Delete ${user.name}`}
            onClick={() => setDeleteTarget(user)}
          >
            <Trash2 className="size-4" />
          </Button>
        </span>
      )
    }
  ]
  const pending = requests.filter((request) => request.status === 'pending')
  const resolvedRequests = requests.filter((request) => request.status !== 'pending').slice(0, 6)
  return (
    <AdminShell onSignOut={() => void signOut()}>
      <div className="grid gap-3">
        <PageHeader
          className="app-panel p-5"
          eyebrow="NexusOS administration"
          title="Users & business requests"
          actions={
            <Button variant="quiet" onClick={() => void navigate('/admin/moderation')}>
              <Flag className="size-4" />
              Reports
            </Button>
          }
        />
        <section className="app-panel p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <BriefcaseBusiness className="size-5 text-[var(--color-primary)]" /> Business
                requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Call the listed contact person, then approve only verified businesses.
              </p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              {pending.length} pending
            </span>
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            {pending.length ? (
              pending.map((request) => (
                <article
                  key={request.id}
                  className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900 dark:bg-emerald-950/20"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[var(--color-primary)] shadow-sm dark:bg-slate-950">
                      <BriefcaseBusiness className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold">{request.businessName}</h3>
                          <p className="text-sm text-slate-500">
                            Requested by {request.userName}
                            {request.userEmail ? ` ? ${request.userEmail}` : ''}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-slate-950 dark:text-amber-300">
                          <Clock3 className="size-3" /> Pending
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 rounded-2xl bg-white/80 p-3 text-sm dark:bg-slate-950/70">
                        <span className="flex items-center gap-2 font-semibold">
                          <Phone className="size-4 text-[var(--color-primary)]" /> Call{' '}
                          {request.contactPersonName}
                        </span>
                        <a
                          href={`tel:${request.phone}`}
                          className="text-[var(--color-primary)] underline-offset-4 hover:underline"
                        >
                          {request.phone}
                        </a>
                        <span className="text-xs text-slate-500">
                          Requested {date(request.createdAt)}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={!!resolvingRequest}
                          loading={resolvingRequest === request.id + ':rejected'}
                          onClick={() => void resolveRequest(request, 'rejected')}
                        >
                          <XCircle className="size-4" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={!!resolvingRequest}
                          loading={resolvingRequest === request.id + ':approved'}
                          onClick={() => void resolveRequest(request, 'approved')}
                        >
                          <CheckCircle2 className="size-4" /> Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800 xl:col-span-2">
                No pending business requests.
              </p>
            )}
          </div>
          {resolvedRequests.length ? (
            <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-sm font-bold">Recent decisions</h3>
              <div className="mt-3 grid gap-2">
                {resolvedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {request.businessName} ? {request.userName}
                    </span>
                    <span
                      className={
                        'rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ' +
                        (request.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200')
                      }
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
        <section className="app-panel p-5">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Users className="size-5" /> All accounts
              </h2>
              <p className="mt-1 text-sm text-slate-500">{users.length} users visible</p>
            </div>
            <div className="w-full max-w-sm">
              <SearchField
                label="Search users"
                placeholder="Name, username, email or phone"
                value={query}
                onChange={(value) => {
                  setQuery(value)
                  void load(value)
                }}
              />
            </div>
          </div>
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-2xl border border-red-300 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}
          <div className="hidden md:block">
            <DataTable caption="NexusOS users" columns={columns} rows={users} />
          </div>
          <div className="grid gap-2 md:hidden">
            {users.length ? (
              users.map((user) => (
                <article
                  key={user.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold">{user.name}</h3>
                      <p className="truncate text-xs text-slate-500">@{user.username}</p>
                    </div>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold capitalize text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      {user.accountKind}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-slate-500">
                    <span className="truncate">{user.email ?? 'No email'}</span>
                    <span>{user.phone ?? 'No phone'}</span>
                    <span>
                      {user.deletedAt ? 'Deleted' : user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
                No records found
              </div>
            )}
          </div>
        </section>
      </div>
      <Dialog
        open={Boolean(deleteTarget)}
        title="Delete user account?"
        description="This immediately revokes access and permanently removes the user's email, phone, password and Google identity. Conversation audit records remain anonymized."
        initialFocusSelector="[data-delete-confirm]"
        onClose={() => setDeleteTarget(undefined)}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          You are deleting <strong>{deleteTarget?.name}</strong> (@{deleteTarget?.username}). This
          action cannot be reversed from the admin panel.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="quiet" onClick={() => setDeleteTarget(undefined)}>
            Cancel
          </Button>
          <Button
            data-delete-confirm
            variant="danger"
            loading={deleting}
            onClick={() => {
              if (!deleteTarget) return
              setDeleting(true)
              void adminApi
                .deleteUser(session!.token, deleteTarget.id)
                .then((updated) => {
                  setUsers((current) =>
                    current.map((item) => (item.id === updated.id ? updated : item))
                  )
                  setDeleteTarget(undefined)
                })
                .catch((cause: unknown) =>
                  setError(cause instanceof Error ? cause.message : 'Delete failed.')
                )
                .finally(() => setDeleting(false))
            }}
          >
            Delete account
          </Button>
        </div>
      </Dialog>
    </AdminShell>
  )
}
