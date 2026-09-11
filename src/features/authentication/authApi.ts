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
  google: (accessToken: string, accountKind: 'customer' | 'business') =>
    request('/auth/google/exchange', {
      id_token: accessToken,
      account_kind: accountKind,
      device_name: deviceName
    }),
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
