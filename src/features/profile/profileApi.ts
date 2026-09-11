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

const businessRequestSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  userEmail: z.string().nullable(),
  businessName: z.string(),
  contactPersonName: z.string(),
  phone: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  createdAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
  reviewedBy: z.string().nullable()
})
export type BusinessRequest = z.infer<typeof businessRequestSchema>
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
  ) => call(token, { method: 'PATCH', body: JSON.stringify(value) }),
  requestBusiness: async (
    token: string,
    value: { business_name: string; contact_person_name: string; phone: string }
  ) => {
    const response = await fetch(`${baseUrl}/business-requests`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value)
    })
    const json: unknown = await response.json()
    if (!response.ok)
      throw new Error(
        z.object({ message: z.string() }).safeParse(json).data?.message ??
          'Unable to submit business request.'
      )
    return businessRequestSchema.parse(z.object({ data: businessRequestSchema }).parse(json).data)
  }
}
