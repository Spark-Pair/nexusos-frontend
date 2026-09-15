import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { Button } from '@shared/components/Button'
import { CheckCircle2, Cloud, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, googleClientId, type AuthSession } from './authApi'
import { AuthenticationScreen } from './AuthenticationScreen'
import { authRoutes } from './authRoutes'
import { useAuthSession } from './authSession'

function GoogleAction({
  finish,
  setError,
  setLoading,
  loading
}: {
  finish: (session: AuthSession) => void
  setError: (message: string) => void
  setLoading: (loading: boolean) => void
  loading: boolean
}) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-3 shadow-inner dark:border-white/10 dark:bg-white/5">
      <GoogleLogin
        onSuccess={(response) => {
          if (!response.credential) {
            setError('Google did not return an identity token.')
            return
          }
          setLoading(true)
          void authApi
            .google(response.credential, 'customer')
            .then(finish)
            .catch((cause: unknown) =>
              setError(cause instanceof Error ? cause.message : 'Google sign-in failed.')
            )
            .finally(() => setLoading(false))
        }}
        onError={() => setError('Google sign-in was cancelled or failed.')}
        useOneTap={false}
        width="320"
      />
      {loading ? (
        <p className="text-center text-xs font-semibold text-[var(--color-primary)]">
          Preparing your workspace...
        </p>
      ) : (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Continue with the Google account you want to use in NexusOS.
        </p>
      )}
    </div>
  )
}

function SignInForm() {
  const navigate = useNavigate()
  const { setSession } = useAuthSession()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const finish = (session: AuthSession) => {
    setSession(session)
    void navigate(session.data.is_admin ? authRoutes.adminUsers : authRoutes.chatPreview)
  }
  return (
    <AuthenticationScreen
      eyebrow="Welcome back"
      title="Sign in with Google"
      description="Use Google to open your NexusOS workspace. New customer accounts are created automatically on first sign in."
      footer={
        <div className="grid gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" />
            <p>Business access is requested from settings after login and approved by admins.</p>
          </div>
          <div className="flex items-start gap-3">
            <Cloud className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" />
            <p>Recent chats stay available on this device and sync again after reconnect.</p>
          </div>
        </div>
      }
    >
      <div className="grid gap-5">
        <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-slate-200">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white text-[var(--color-primary)] shadow-sm dark:bg-white/10">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">One account, simple access</p>
              <p className="mt-1 leading-6">
                No phone signup here. Just pick your Google account and continue.
              </p>
            </div>
          </div>
        </div>
        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
          >
            {error}
          </p>
        ) : null}
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleAction
              finish={finish}
              setError={setError}
              setLoading={setLoading}
              loading={loading}
            />
          </GoogleOAuthProvider>
        ) : (
          <Button disabled className="justify-center">
            Google sign-in is not configured
          </Button>
        )}
        {!googleClientId ? (
          <p className="text-xs text-slate-500">
            Google sign-in becomes available when its public client ID is configured.
          </p>
        ) : null}
      </div>
    </AuthenticationScreen>
  )
}

export default function SignInPage() {
  return <SignInForm />
}
