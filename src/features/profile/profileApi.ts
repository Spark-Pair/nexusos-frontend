import { z } from 'zod'

const settingsSchema = z.object({
  userId: z.string().uuid(),
  bio: z.string(),
  language: z.enum(['en', 'ur', 'roman-ur']),
  showLastSeen: z.boolean(),
  allowReadReceipts: z.boolean(),
  allowBroadcasts: z.boolean(),
  updatedAt: z.coerce.date()
})
const profileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  account_kind: z.enum(['customer', 'business']),
  settings: settingsSchema
})
export type Profile = z.infer<typeof profileSchema>
const baseUrl = (import.meta.env.VITE_API_URL as string).replace(/\/$/u, '')
async function call(token: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}/profile`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers
    }
  })
  const json: unknown = await response.json()
  if (!response.ok)
    throw new Error(
      z.object({ message: z.string() }).safeParse(json).data?.message ?? 'Unable to save profile.'
    )
  return json
}
export const profileApi = {
  get: async (token: string) =>
    profileSchema.parse(z.object({ data: profileSchema }).parse(await call(token)).data),
  update: async (
    token: string,
    value: {
      name: string
      username: string
      bio: string
      language: Profile['settings']['language']
      show_last_seen: boolean
      allow_read_receipts: boolean
      allow_broadcasts: boolean
    }
  ) => call(token, { method: 'PATCH', body: JSON.stringify(value) })
}
