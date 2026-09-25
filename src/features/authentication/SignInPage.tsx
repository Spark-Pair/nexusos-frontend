import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { Button } from '@shared/components/Button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, googleClientId, type AuthSession } from './authApi'
import { AuthenticationScreen } from './AuthenticationScreen'
import { authRoutes } from './authRoutes'
import { useAuthSession } from './authSession'
import { readPendingInvite } from '@/features/invites/pendingInvite'

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
    <div className="grid justify-items-center gap-2">
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
        shape="rectangular"
        size="large"
        text="continue_with"
        width="300"
      />
      {loading ? (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Signing in...</p>
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
    const pendingInvite = readPendingInvite()
    void navigate(
      pendingInvite
        ? `/join/${pendingInvite.token}`
        : session.data.is_admin
          ? authRoutes.adminUsers
          : authRoutes.chatPreview
    )
  }
  return (
    <AuthenticationScreen
      eyebrow="Welcome back"
      title="Sign in with Google"
      description="Use Google to open your workspace. New customer accounts are created automatically."
      footer={
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
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
