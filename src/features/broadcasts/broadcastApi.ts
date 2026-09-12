import { z } from 'zod'
const list = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  name: z.string(),
  customerIds: z.array(z.string().uuid()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
const broadcast = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  listId: z.string().uuid(),
  listIds: z.array(z.string().uuid()).optional(),
  title: z.string(),
  body: z.string(),
  imageUrls: z.array(z.string()),
  publishedAt: z.coerce.date(),
  scheduledFor: z.coerce.date().nullable().optional(),
  deliveredAt: z.coerce.date().nullable().optional(),
  businessName: z.string().optional(),
  readAt: z.coerce.date().nullable().optional(),
  saved: z.boolean().default(false),
  muted: z.boolean().default(false),
  reported: z.boolean().default(false)
})
const customer = z.object({ id: z.string().uuid(), name: z.string(), username: z.string() })
const draft = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  listId: z.string().uuid().nullable(),
  title: z.string(),
  body: z.string(),
  imageUrls: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type BroadcastList = z.infer<typeof list>
export type BroadcastCustomer = z.infer<typeof customer>
export type BroadcastDraft = z.infer<typeof draft>
export type Broadcast = z.infer<typeof broadcast>
const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/u, '') ?? '/api'
export const broadcastMediaUrl = (path: string) =>
  new URL(path, new URL(base, window.location.origin)).href
async function call(token: string, path: string, init?: RequestInit) {
  const r = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {})
    }
  })
  if (!r.ok) {
    const error = z
      .object({ message: z.string().optional() })
      .safeParse(await r.json().catch(() => null))
    throw new Error(
      error.success
        ? (error.data.message ?? 'Request failed. Please try again.')
        : 'Unable to reach NexusOS. Please try again.'
    )
  }
  return r.status === 204 ? null : ((await r.json()) as unknown)
}
export const broadcastApi = {
  upload: async (t: string, files: File[]) => {
    const body = new FormData()
    files.forEach((file) => body.append('images', file))
    const r = await fetch(`${base}/media/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body
    })
    const json: unknown = await r.json()
    if (!r.ok) throw new Error('Image upload failed.')
    return z
      .object({ data: z.array(z.object({ url: z.string() })) })
      .parse(json)
      .data.map((x) => x.url)
  },
  lists: async (t: string) =>
    z.object({ data: z.array(list) }).parse(await call(t, '/broadcast-lists')).data,
  createList: async (t: string, name: string, ids: string[]) =>
    list.parse(
      z.object({ data: list }).parse(
        await call(t, '/broadcast-lists', {
          method: 'POST',
          body: JSON.stringify({ name, customer_ids: ids })
        })
      ).data
    ),
  customers: async (t: string) =>
    z.object({ data: z.array(customer) }).parse(await call(t, '/business/customers')).data,
  updateList: async (t: string, id: string, name: string, ids: string[]) =>
    list.parse(
      z.object({ data: list }).parse(
        await call(t, `/broadcast-lists/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, customer_ids: ids })
        })
      ).data
    ),
  removeList: (t: string, id: string) => call(t, `/broadcast-lists/${id}`, { method: 'DELETE' }),
  all: async (t: string) =>
    z.object({ data: z.array(broadcast) }).parse(await call(t, '/broadcasts')).data,
  publish: (
    t: string,
    v: {
      list_id?: string
      list_ids?: string[]
      title: string
      body: string
      image_urls?: string[]
      scheduled_for?: string
    }
  ) => call(t, '/broadcasts', { method: 'POST', body: JSON.stringify(v) }),
  state: (t: string, id: string, value: { read?: true; saved?: boolean; reported?: true }) =>
    call(t, `/broadcasts/${id}/state`, { method: 'PATCH', body: JSON.stringify(value) }),
  mute: (t: string, id: string, muted: boolean) =>
    call(t, `/businesses/${id}/mute`, { method: 'PUT', body: JSON.stringify({ muted }) }),
  drafts: async (t: string) =>
    z.object({ data: z.array(draft) }).parse(await call(t, '/broadcast-drafts')).data,
  saveDraft: (
    t: string,
    id: string,
    value: { list_id: string | null; title: string; body: string; image_urls: string[] }
  ) => call(t, `/broadcast-drafts/${id}`, { method: 'PUT', body: JSON.stringify(value) }),
  removeDraft: (t: string, id: string) => call(t, `/broadcast-drafts/${id}`, { method: 'DELETE' })
}
