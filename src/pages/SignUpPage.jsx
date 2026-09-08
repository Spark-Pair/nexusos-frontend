import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { CircleUserRound, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, googleClientId } from '../features/authentication/authApi.js'
import { useAuthSession } from '../features/authentication/authSession.jsx'

function GoogleRegisterButton({ loading, onStart, onFinish, onError }) {
  const google = useGoogleLogin({
    onSuccess: (response) => {
      onStart()
      authApi
        .google(response.access_token, 'customer')
        .then(onFinish)
        .catch((cause) => onError(cause instanceof Error ? cause.message : 'Google registration failed.'))
    },
    onError: () => onError('Google registration was cancelled or failed.'),
  })

  return (
    <button className="secondary auth-google" onClick={() => google()} disabled={loading}>
      <CircleUserRound size={18} /> Register with Google
    </button>
  )
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const { setSession } = useAuthSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const finish = (session) => {
    setSession(session)
    navigate('/chats')
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      finish(await authApi.register({
        name,
        email,
        password,
        password_confirmation: password,
        account_kind: 'customer',
      }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create the account.')
    } finally {
      setLoading(false)
    }
  }

  const startGoogle = () => {
    setError('')
    setLoading(true)
  }

  const failGoogle = (message) => {
    setError(message)
    setLoading(false)
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <span className="auth-eyebrow">Create account</span>
        <h1>Customer sign up</h1>
        <p>Create a customer profile with email or register with Google.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Full name<input autoComplete="name" placeholder="Ali Khan" value={name} onChange={(event) => setName(event.target.value)} required /></label>
          <label>Email address<input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error ? <p className="auth-error" role="alert">{error}</p> : null}
          <button className="primary auth-submit" type="submit" disabled={loading}><UserRound size={19} /> {loading ? 'Creating account...' : 'Create customer account'}</button>
        </form>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleRegisterButton loading={loading} onStart={startGoogle} onFinish={finish} onError={failGoogle} />
          </GoogleOAuthProvider>
        ) : (
          <button className="secondary auth-google" disabled><CircleUserRound size={18} /> Register with Google</button>
        )}
        {!googleClientId ? <p className="auth-note">Google registration is available after `VITE_GOOGLE_CLIENT_ID` is configured.</p> : null}
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
      <aside className="auth-aside">
        <UserRound size={30} />
        <h2>Business login stays on the sign-in page</h2>
        <p>This sign-up screen is customer-first, matching the requested split while preserving shared login.</p>
      </aside>
    </main>
  )
}
