import { Badge } from '@shared/components/Badge'
import { Button } from '@shared/components/Button'
import { OtpInput } from '@shared/components/OtpInput'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from './authApi'
import { AuthenticationScreen } from './AuthenticationScreen'
import { accountKindFromSearch, authRoutes } from './authRoutes'
import { useAuthSession } from './authSession'

export default function VerifyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, setSession } = useAuthSession()
  const initialState = location.state as {
    phone?: string
    challenge_id?: string
    development_code?: string | null
  } | null
  const [challenge, setChallenge] = useState(initialState)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(60)
  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = window.setInterval(
      () => setResendSeconds((value) => Math.max(0, value - 1)),
      1000
    )
    return () => window.clearInterval(timer)
  }, [resendSeconds])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!/^\d{6}$/u.test(code)) {
      setError('Enter all six digits.')
      return
    }
    if (!challenge?.challenge_id) {
      setError('Request a new verification code first.')
      return
    }
    setLoading(true)
    try {
      const account = session?.data.account_kind ?? accountKindFromSearch(location.search)
      const nextSession = session
        ? await authApi.phoneComplete(challenge.challenge_id, code, account, session.token)
        : await authApi.phoneVerify(challenge.challenge_id, code, account)
      setSession(nextSession)
      void navigate(authRoutes.chatPreview)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to verify the code.')
    } finally {
      setLoading(false)
    }
  }
  const resend = async () => {
    if (!challenge?.phone || resendSeconds > 0) return
    setLoading(true)
    setError(undefined)
    try {
      setChallenge({ ...challenge, ...(await authApi.phoneChallenge(challenge.phone)) })
      setCode('')
      setResendSeconds(60)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to resend the code.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthenticationScreen
      eyebrow="Secure verification"
      title="Enter the 6-digit code"
      description={
        challenge?.phone
          ? `We prepared a verification challenge for ${challenge.phone}.`
          : 'Request a new verification code to continue.'
      }
      footer={
        <Link className="text-sm font-semibold text-blue-600" to={authRoutes.phone}>
          Change phone number
        </Link>
      }
    >
      {challenge?.development_code ? (
        <div className="flex">
          <Badge tone="warning">Local development provider</Badge>
        </div>
      ) : null}
      <form className="grid gap-5" onSubmit={(event) => void submit(event)} noValidate>
        <OtpInput
          value={code}
          onChange={(value) => {
            setCode(value)
            setError(undefined)
          }}
        />
        {error ? (
          <p role="alert" className="text-sm font-semibold text-rose-600">
            {error}
          </p>
        ) : null}
        {challenge?.development_code ? (
          <p className="text-xs text-slate-500">
            Local code: <strong>{challenge.development_code}</strong>. Production never returns OTP
            codes in API responses.
          </p>
        ) : null}
        <Button type="submit" size="lg" variant="primary" loading={loading}>
          Verify code
        </Button>
        <Button
          type="button"
          variant="quiet"
          disabled={loading || resendSeconds > 0}
          onClick={() => void resend()}
        >
          {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code'}
        </Button>
      </form>
    </AuthenticationScreen>
  )
}
