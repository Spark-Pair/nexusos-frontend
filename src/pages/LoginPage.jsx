import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { CircleUserRound, LogIn, Mail, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, googleClientId } from '../features/authentication/authApi.js'
import { useAuthSession } from '../features/authentication/authSession.jsx'

function GoogleLoginButton({ loading, onStart, onFinish, onError }) {
  const google = useGoogleLogin({
    onSuccess: (response) => {
      onStart()
      authApi
        .google(response.access_token, 'customer')
        .then(onFinish)
        .catch((cause) => onError(cause instanceof Error ? cause.message : 'Google sign-in failed.'))
    },
    onError: () => onError('Google sign-in was cancelled or failed.'),
  })

  return (
    <button className="secondary" onClick={() => google()} disabled={loading}>
      <CircleUserRound size={18} /> Google
    </button>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuthSession()
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
      finish(await authApi.login(email, password))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in.')
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
        <span className="auth-eyebrow">Welcome back</span>
        <h1>Sign in to NexusOS</h1>
        <p>Customers and businesses can use email, phone, or Google to continue.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Email address<input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error ? <p className="auth-error" role="alert">{error}</p> : null}
          <button className="primary auth-submit" type="submit" disabled={loading}><Mail size={19} /> {loading ? 'Signing in...' : 'Sign in with email'}</button>
        </form>
        <div className="auth-actions">
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleLoginButton loading={loading} onStart={startGoogle} onFinish={finish} onError={failGoogle} />
            </GoogleOAuthProvider>
          ) : (
            <button className="secondary" disabled><CircleUserRound size={18} /> Google</button>
          )}
          <button className="secondary"><Smartphone size={18} /> Phone</button>
        </div>
        {!googleClientId ? <p className="auth-note">Google sign-in is available after `VITE_GOOGLE_CLIENT_ID` is configured.</p> : null}
        <p className="auth-footer">New to NexusOS? <Link to="/signup">Create a customer account</Link></p>
      </section>
      <aside className="auth-aside">
        <LogIn size={30} />
        <h2>One inbox for customers and businesses</h2>
        <p>Prototype auth only. Google registration is represented here and can be wired to the configured OAuth client later.</p>
      </aside>
    </main>
  )
}
