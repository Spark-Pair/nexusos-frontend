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
    <div className="grid gap-3 rounded-[var(--radius-control)] border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#111815]">
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
        theme="filled_black"
        shape="pill"
        size="large"
        width="300"
      />
      {loading ? (
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
          Signing in...
        </p>
      ) : null}
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
