import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/FormControls'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from './authApi'
import { AuthenticationScreen } from './AuthenticationScreen'
import { authRoutes } from './authRoutes'
import { useAuthSession } from './authSession'

export default function CreateAccountPage() {
  const navigate = useNavigate()
  const { setSession } = useAuthSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(undefined)
    try {
      const session = await authApi.register({
        name,
        email,
        password,
        password_confirmation: password
      })
      setSession(session)
      void navigate(authRoutes.chatPreview)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create the account.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthenticationScreen
      eyebrow="Create account"
      title="Create account"
      description="Name, email, password. Bas itna hi."
      footer={
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-semibold text-blue-600" to={authRoutes.signIn}>
            Sign in
          </Link>
        </p>
      }
    >
      <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
        <Input
          label="Your name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="Use at least 8 characters."
        />
        {error ? (
          <p role="alert" className="text-sm font-semibold text-rose-600">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" variant="primary" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthenticationScreen>
  )
}
