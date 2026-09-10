import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/FormControls'
import {
  normalizePakistanPhone,
  validationMessage,
  validationRules
} from '@shared/validation/formValidation'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from './authApi'
import { AuthenticationScreen } from './AuthenticationScreen'
import { accountKindFromSearch, authPath, authRoutes } from './authRoutes'
import { useAuthSession } from './authSession'

export default function PhonePage() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const account = accountKindFromSearch(search)
  const { session } = useAuthSession()
  const effectiveAccount = session?.data.account_kind ?? account
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const message = validationMessage(validationRules.pakistanPhone, phone)
    setError(message)
    if (message) return
    setLoading(true)
    try {
      const normalized = normalizePakistanPhone(phone)
      if (!normalized) {
        setError('Enter a valid Pakistani mobile number.')
        return
      }
      const challenge = await authApi.phoneChallenge(normalized)
      void navigate(authPath(authRoutes.verify, effectiveAccount), {
        state: { phone: normalized, ...challenge }
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send the code.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthenticationScreen
      eyebrow="Phone verification"
      title="Enter your mobile number"
      description={
        session
          ? 'Add and verify a phone number to complete your account setup.'
          : `Use phone sign-in now, or add it later when ${effectiveAccount} setup requires contact details.`
      }
      footer={
        <Link className="text-sm font-semibold text-blue-600" to={authRoutes.signIn}>
          Back to sign in
        </Link>
      }
    >
      <form className="grid gap-5" onSubmit={(event) => void submit(event)} noValidate>
        <Input
          label="Pakistan mobile number"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value)
            setError(undefined)
          }}
          error={error}
          inputMode="tel"
          autoComplete="tel"
          placeholder="0300 1234567"
        />
        <Button type="submit" size="lg" variant="primary" loading={loading}>
          Send verification code
        </Button>
      </form>
    </AuthenticationScreen>
  )
}
