import { ApiError } from '@shared/ApiError'
import { z } from 'zod'

const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/u, '')

const businessSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string(),
  accountKind: z.literal('business'),
  followed: z.boolean()
})

const conversationSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  businessId: z.string().uuid(),
  invitedBy: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export type ResolvedBusinessInvite = z.infer<typeof businessSchema>

async function call(path: string, init?: RequestInit): Promise<unknown> {
  if (!apiUrl) throw new Error('The NexusOS API URL is not configured.')
  const response = await fetch(`${apiUrl}${path}`, {
    signal: AbortSignal.timeout(15000),
    ...init,
    headers: { Accept: 'application/json', ...init?.headers }
  })
  if (!response.ok) {
    const data = z
      .object({ message: z.string().optional() })
      .safeParse(await response.json().catch(() => null))
    throw new ApiError(
      data.success ? (data.data.message ?? 'Request failed.') : 'Request failed.',
      response.status
    )
  }
  return response.status === 204 ? null : response.json()
}

export const inviteApi = {
  resolve: async (token: string) =>
    z
      .object({ data: z.object({ id: z.string().uuid(), business: businessSchema }) })
      .parse(await call(`/invites/${encodeURIComponent(token)}`)).data,
  connect: async (token: string, authToken: string) =>
    z
      .object({
        success: z.literal(true),
        alreadyConnected: z.boolean(),
        business: businessSchema,
        connection: conversationSchema
      })
      .parse(
        await call(`/invites/${encodeURIComponent(token)}/connect`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ),
  getBusinessInvite: async (authToken: string) =>
    z.object({ data: z.object({ inviteUrl: z.string().url() }) }).parse(
      await call('/business/invite', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
    ).data,
  regenerateBusinessInvite: async (authToken: string) =>
    z.object({ data: z.object({ inviteUrl: z.string().url() }) }).parse(
      await call('/business/invite', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      })
    ).data,
  revokeBusinessInvite: (authToken: string) =>
    call('/business/invite', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    })
}
