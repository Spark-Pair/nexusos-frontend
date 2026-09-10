import { ApiError } from '@shared/ApiError'
import { z } from 'zod'

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string().default('user'),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  account_kind: z.enum(['customer', 'business']),
  phone_verified_at: z.string().nullable(),
  is_admin: z.boolean().default(false)
})
export const authSessionSchema = z.object({
  data: userSchema,
  token: z.string(),
  requires_phone: z.boolean()
})
export type AuthSession = z.infer<typeof authSessionSchema>
const restoredSessionSchema = z.object({
  data: userSchema,
  requires_phone: z.boolean()
})
const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/u, '')
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

async function request(path: string, body: unknown, token?: string): Promise<AuthSession> {
  if (!apiUrl) throw new Error('The NexusOS API URL is not configured.')
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  })
  const json: unknown = await response.json()
  if (!response.ok) {
    const parsed = z
      .object({
        message: z.string().optional(),
        errors: z.record(z.string(), z.array(z.string())).optional()
      })
      .safeParse(json)
    throw new Error(
      parsed.success
        ? (Object.values(parsed.data.errors ?? {})[0]?.[0] ??
            parsed.data.message ??
            'Request failed.')
        : 'Request failed.'
    )
  }
  return authSessionSchema.parse(json)
}

const deviceName = `NexusOS Web (${navigator.platform || 'browser'})`
export const authApi = {
  register: (data: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => request('/auth/register', { ...data, account_kind: 'customer', device_name: deviceName }),
  login: (email: string, password: string) =>
    request('/auth/login', { email, password, device_name: deviceName }),
  google: (accessToken: string, accountKind: 'customer' | 'business') =>
    request('/auth/google/exchange', {
      id_token: accessToken,
      account_kind: accountKind,
      device_name: deviceName
    }),
  phoneChallenge: async (phone: string) => {
    if (!apiUrl) throw new Error('The NexusOS API URL is not configured.')
    const response = await fetch(`${apiUrl}/auth/phone/challenge`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    })
    const json: unknown = await response.json()
    if (!response.ok) throw new Error('Unable to send the verification code.')
    return z
      .object({
        challenge_id: z.string().uuid(),
        expires_in: z.number(),
        development_code: z.string().nullable()
      })
      .parse(json)
  },
  phoneVerify: (challengeId: string, code: string, accountKind: 'customer' | 'business') =>
    request('/auth/phone/verify', {
      challenge_id: challengeId,
      code,
      account_kind: accountKind,
      device_name: deviceName
    }),
  phoneComplete: (
    challengeId: string,
    code: string,
    accountKind: 'customer' | 'business',
    token: string
  ) =>
    request(
      '/auth/phone/complete',
      { challenge_id: challengeId, code, account_kind: accountKind, device_name: deviceName },
      token
    ),
  restore: async (token: string): Promise<AuthSession> => {
    if (!apiUrl) throw new Error('The NexusOS API URL is not configured.')
    const response = await fetch(`${apiUrl}/auth/me`, {
      signal: AbortSignal.timeout(15000),
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    })
    if (!response.ok)
      throw new ApiError('Your session has expired. Please sign in again.', response.status)
    const restored = restoredSessionSchema.parse(await response.json())
    return { ...restored, token }
  },
  logout: async (token: string): Promise<void> => {
    if (!apiUrl) return
    await fetch(`${apiUrl}/auth/logout`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    })
  }
}
