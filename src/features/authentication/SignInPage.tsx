import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/FormControls'
import { Mail, Smartphone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
        width="100%"
      />
      {loading ? <p className="mt-2 text-center text-xs text-slate-500">Signing in...</p> : null}
    </div>
  )
}

function SignInForm() {
  const navigate = useNavigate()
  const { setSession } = useAuthSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const finish = (session: AuthSession) => {
    setSession(session)
    void navigate(
      session.requires_phone
        ? authRoutes.phone
        : session.data.is_admin
          ? authRoutes.adminUsers
          : authRoutes.chatPreview
    )
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(undefined)
    try {
      finish(await authApi.login(email, password))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthenticationScreen
      eyebrow="Welcome back"
      title="Sign in"
      description="Continue with email, phone, or Google."
      footer={
        <p className="text-center text-sm text-slate-500">
          New to NexusOS?{' '}
          <Link className="font-semibold text-blue-600" to={authRoutes.createAccount}>
            Create an account
          </Link>
        </p>
      }
    >
      <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? (
          <p role="alert" className="text-sm font-semibold text-rose-600">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" variant="primary" loading={loading}>
          <Mail className="size-4" />
          Sign in with email
        </Button>
      </form>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
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
          <Button disabled>Google</Button>
        )}
        <Button onClick={() => void navigate(authRoutes.phone)} disabled={loading}>
          <Smartphone className="size-4" />
          Phone
        </Button>
      </div>
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
