import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { Button } from '@shared/components/Button'
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
    <div className="grid gap-3">
      <div className="relative overflow-hidden rounded-[var(--radius-control)]">
        <button
          type="button"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-control)] border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          tabIndex={-1}
          aria-hidden="true"
        >
          <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"
            />
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
        <div className="absolute inset-0 opacity-0">
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
            type="standard"
            theme="outline"
            width="360"
          />
        </div>
      </div>
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
      description="Use your Google account. If this is your first time, NexusOS creates your customer account automatically."
      footer={
        <p className="text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
          Business access is requested from settings after sign in.
        </p>
      }
    >
      <div className="grid gap-4">
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
