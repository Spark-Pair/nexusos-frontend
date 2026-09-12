import { ApiError } from '@shared/ApiError'
import { z } from 'zod'

const profileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string(),
  accountKind: z.enum(['customer', 'business']),
  followed: z.boolean()
})
const messageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  body: z.string(),
  createdAt: z.coerce.date(),
  readAt: z.coerce.date().nullable(),
  broadcastId: z.string().uuid().nullable().optional(),
  title: z.string().default(''),
  imageUrls: z.array(z.string()).default([])
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
const summarySchema = conversationSchema.extend({
  counterpart: profileSchema,
  lastMessage: messageSchema.nullable(),
  unreadCount: z.number().int().nonnegative(),
  archived: z.boolean(),
  muted: z.boolean()
})
export type DirectoryProfile = z.infer<typeof profileSchema>
export type ConversationSummary = z.infer<typeof summarySchema>
export type Message = z.infer<typeof messageSchema>
export interface ConversationDetail {
  conversation: z.infer<typeof conversationSchema>
  counterpart: DirectoryProfile
  messages: Message[]
}
const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/u, '')

async function call(path: string, token: string, init?: RequestInit): Promise<unknown> {
  if (!baseUrl) throw new Error('The NexusOS API URL is not configured.')
  const response = await fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.timeout(15000),
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...init?.headers
    }
  })
  if (!response.ok) {
    const data = z
      .object({ message: z.string().optional() })
      .safeParse(await response.json().catch(() => null))
    if ([401, 403].includes(response.status))
      window.dispatchEvent(new Event('nexusos-session-expired'))
    throw new ApiError(
      data.success ? (data.data.message ?? 'Request failed.') : 'Request failed.',
      response.status
    )
  }
  return response.status === 204 ? null : response.json()
}
export const messagingApi = {
  search: async (token: string, query: string) =>
    z
      .object({ data: z.array(profileSchema) })
      .parse(await call(`/directory?q=${encodeURIComponent(query)}`, token)).data,
  follow: (token: string, businessId: string, following: boolean) =>
    call(`/businesses/${businessId}/follow`, token, {
      method: 'PUT',
      body: JSON.stringify({ following })
    }),
  list: async (token: string) =>
    z.object({ data: z.array(summarySchema) }).parse(await call('/conversations', token)).data,
  detail: async (token: string, id: string): Promise<ConversationDetail> =>
    z
      .object({
        data: z.object({
          conversation: conversationSchema,
          counterpart: profileSchema,
          messages: z.array(messageSchema)
        })
      })
      .parse(await call(`/conversations/${id}`, token)).data,
  invite: (token: string, counterpartId: string, message: string) =>
    call('/conversations/invite', token, {
      method: 'POST',
      body: JSON.stringify({ counterpart_id: counterpartId, message })
    }),
  respond: (token: string, id: string, decision: 'accepted' | 'rejected') =>
    call(`/conversations/${id}/respond`, token, {
      method: 'POST',
      body: JSON.stringify({ decision })
    }),
  upload: async (token: string, files: File[]) => {
    const body = new FormData()
    files.forEach((file) => body.append('images', file))
    const response = await fetch(`${baseUrl}/media/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body
    })
    const json: unknown = await response.json().catch(() => null)
    if (!response.ok) throw new Error('Image upload failed.')
    return z
      .object({ data: z.array(z.object({ url: z.string() })) })
      .parse(json)
      .data.map((item) => item.url)
  },
  send: async (
    token: string,
    id: string,
    body: string,
    clientId?: string,
    imageUrls: string[] = []
  ) =>
    z.object({ data: messageSchema }).parse(
      await call(`/conversations/${id}/messages`, token, {
        method: 'POST',
        body: JSON.stringify({
          body,
          image_urls: imageUrls,
          ...(clientId ? { client_id: clientId } : {})
        })
      })
    ).data,
  state: (token: string, id: string, state: { archived?: boolean; muted?: boolean }) =>
    call(`/conversations/${id}/state`, token, { method: 'PATCH', body: JSON.stringify(state) })
}
