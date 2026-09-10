import { z } from 'zod'

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  accountKind: z.enum(['customer', 'business']),
  signupMethod: z.enum(['email', 'phone', 'google']),
  lastLoginMethod: z.enum(['email', 'phone', 'google']).nullable(),
  lastLoginAt: z.coerce.date().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable()
})
const reportSchema = z.object({
  broadcastId: z.string().uuid(),
  customerId: z.string().uuid(),
  customerName: z.string(),
  businessId: z.string().uuid(),
  businessName: z.string(),
  title: z.string(),
  body: z.string(),
  reportedAt: z.coerce.date()
})
export type AdminUser = z.infer<typeof userSchema>
const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/u, '')
async function call(path: string, token: string, init?: RequestInit) {
  if (!baseUrl) throw new Error('The NexusOS API URL is not configured.')
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`
    }
  })
  const json: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = z.object({ message: z.string().optional() }).safeParse(json)
    throw new Error(error.success ? (error.data.message ?? 'Request failed.') : 'Request failed.')
  }
  return json
}
export const adminApi = {
  reports: async (token: string) =>
    z.object({ data: z.array(reportSchema) }).parse(await call('/admin/broadcast-reports', token))
      .data,
  resolveReport: (
    token: string,
    broadcastId: string,
    customerId: string,
    action: 'dismissed' | 'suppressed'
  ) =>
    call(`/admin/broadcast-reports/${broadcastId}/resolve`, token, {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, action })
    }),
  users: async (token: string, query: string) =>
    z
      .object({ data: z.array(userSchema) })
      .parse(await call(`/admin/users?q=${encodeURIComponent(query)}`, token)).data,
  createBusiness: async (token: string, data: { name: string; email: string; password: string }) =>
    z.object({ data: userSchema }).parse(
      await call('/admin/users', token, {
        method: 'POST',
        body: JSON.stringify({ ...data, account_kind: 'business', device_name: 'admin panel' })
      })
    ).data,
  setActive: async (token: string, id: string, active: boolean) =>
    z.object({ data: userSchema }).parse(
      await call(`/admin/users/${id}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ active })
      })
    ).data,
  deleteUser: async (token: string, id: string) =>
    z
      .object({ data: userSchema })
      .parse(await call(`/admin/users/${id}`, token, { method: 'DELETE' })).data
}
