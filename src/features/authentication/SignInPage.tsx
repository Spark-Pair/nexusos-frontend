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
    <div className="overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
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
        width="260"
      />
      {loading ? <p className="mt-2 text-center text-xs text-slate-500">Signing in...</p> : null}
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
        <p className="text-center text-sm text-slate-500">
          Business access starts from your profile after sign in. Admins approve requests after a
          call.
        </p>
      }
    >
      {error ? (
        <p role="alert" className="text-sm font-semibold text-rose-600">
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
        <Button disabled>Google sign-in is not configured</Button>
      )}
      {!googleClientId ? (
        <p className="text-xs text-slate-500">
          Google sign-in becomes available when its public client ID is configured.
        </p>
      ) : null}
    </AuthenticationScreen>
  )
}

export default function SignInPage() {
  return <SignInForm />
}
