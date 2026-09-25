import { Button } from '@shared/components/Button'
import { useToast } from '@shared/components/toastContext'
import { CheckCircle2, Link2, RefreshCw, ShieldAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { inviteApi, type ResolvedBusinessInvite } from './inviteApi'
import { clearPendingInvite, savePendingInvite } from './pendingInvite'
import { authRoutes } from '@/features/authentication/authRoutes'
import { useAuthSession } from '@/features/authentication/authSession'
import { usePushNotifications } from '@/features/notifications/usePushNotifications'

type State = 'loading' | 'auth-required' | 'connecting' | 'connected' | 'error'

export default function JoinInvitePage() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { session, status, serverConfirmed } = useAuthSession()
  const push = usePushNotifications(session?.token ?? '')
  const [state, setState] = useState<State>('loading')
  const [business, setBusiness] = useState<ResolvedBusinessInvite>()
  const [error, setError] = useState('')
  const connectedConversation = useRef<string | undefined>(undefined)
  const lastRunKey = useRef('')

  const finish = useCallback(
    async (conversationId: string) => {
      clearPendingInvite()
      connectedConversation.current = conversationId
      setState('connected')
      if (push.permission === 'granted' && !push.enabled) await push.enable().catch(() => undefined)
      toast({
        title: 'Connected',
        ...(business ? { description: `${business.name} is now in your NexusOS inbox.` } : {}),
        tone: 'success'
      })
      void navigate(`/app/chats/${conversationId}`, { replace: true })
    },
    [business, navigate, push, toast]
  )

  const run = useCallback(async () => {
    if (!token) {
      setError('Invite link is missing.')
      setState('error')
      return
    }
    try {
      setError('')
      const resolved = await inviteApi.resolve(token)
      setBusiness(resolved.business)
      if (status === 'restoring') return
      if (!session) {
        savePendingInvite(token)
        setState('auth-required')
        void navigate(authRoutes.signIn, { replace: true })
        return
      }
      if (!serverConfirmed) {
        setState('connecting')
        return
      }
      setState('connecting')
      const connected = await inviteApi.connect(token, session.token)
      setBusiness(connected.business)
      await finish(connected.connection.id)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to use this invite link.'
      if (
        message.toLowerCase().includes('not found') ||
        message.toLowerCase().includes('expired') ||
        message.toLowerCase().includes('active')
      ) {
        clearPendingInvite()
      }
      setError(message)
      setState('error')
    }
  }, [finish, serverConfirmed, session, status, token])

  useEffect(() => {
    const runKey = `${token}:${status}:${session?.token ?? 'anonymous'}:${String(serverConfirmed)}`
    if (lastRunKey.current === runKey) return
    lastRunKey.current = runKey
    if (!connectedConversation.current) void run()
  }, [run, serverConfirmed, session?.token, status, token])

  if (!token) return <Navigate to="/" replace />

  return (
    <main className="app-canvas grid min-h-dvh place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {state === 'connected' ? (
          <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden="true" />
        ) : state === 'error' ? (
          <ShieldAlert className="mx-auto size-10 text-rose-600" aria-hidden="true" />
        ) : (
          <Link2 className="mx-auto size-10 text-blue-600" aria-hidden="true" />
        )}
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {state === 'auth-required'
            ? 'Sign in to connect'
            : state === 'error'
              ? 'Invite unavailable'
              : business
                ? `Connecting to ${business.name}`
                : 'Opening invite'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {state === 'auth-required'
            ? 'After Google sign-in, NexusOS will finish connecting this business automatically.'
            : state === 'error'
              ? error
              : 'NexusOS is validating the invite and preparing your inbox.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {state === 'auth-required' ? (
            <Button disabled>Please wait</Button>
          ) : state === 'error' ? (
            <>
              <Button onClick={() => void run()}>
                <RefreshCw className="size-4" aria-hidden="true" />
                Retry
              </Button>
              <Button variant="quiet" onClick={() => void navigate('/app/chats')}>
                Open NexusOS
              </Button>
            </>
          ) : (
            <Button disabled>Please wait</Button>
          )}
        </div>
      </section>
    </main>
  )
}
