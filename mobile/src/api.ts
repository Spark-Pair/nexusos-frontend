import type { AccountKind, Conversation, ConversationDetail, Session } from './types'

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://api-nexusos.sparkpair.dev/api').replace(/\/$/u, '')
export const API_ORIGIN = API_URL.replace(/\/api$/u, '')

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface BroadcastList { id: string; name: string; customerIds: string[]; createdAt: string; updatedAt: string }
export interface ConnectedCustomer { id: string; name: string; username: string }
export interface Broadcast { id: string; title: string; body: string; imageUrls: string[]; publishedAt: string; scheduledFor?: string | null; businessName?: string; businessId: string; saved?: boolean; muted?: boolean; readAt?: string | null }
export interface ProfileSettings { bio: string; language: 'en' | 'ur' | 'roman-ur'; showLastSeen: boolean; allowReadReceipts: boolean; allowBroadcasts: boolean; quietHoursEnabled: boolean; quietHoursStart: string; quietHoursEnd: string; timeZone: string }

async function request<T>(path: string, token?: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError('Could not reach NexusOS. Check your connection and try again.', 0)
  }
  if (response.status === 204) return undefined as T
  const result = await response.json().catch(() => null) as { error?: string; message?: string; data?: T } | null
  if (!response.ok) throw new ApiError(result?.error || result?.message || 'Request failed. Please try again.', response.status)
  return result as T
}

export const api = {
  async login(email: string, password: string) {
    return request<Session>('/auth/login', undefined, { method: 'POST', body: JSON.stringify({ email, password }) })
  },
  async register(name: string, email: string, password: string) {
    return request<Session>('/auth/register', undefined, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation: password, account_kind: 'customer' }),
    })
  },
  async googleLogin(idToken: string, pendingInviteToken?: string) {
    return request<Session>('/auth/google/exchange', undefined, {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken, account_kind: 'customer', device_name: 'NexusOS mobile', ...(pendingInviteToken ? { pending_invite_token: pendingInviteToken } : {}) }),
    })
  },
  async resolveInvite(inviteToken: string) {
    const result = await request<{ data: { id: string; business: { id: string; name: string; username: string; accountKind: AccountKind } } }>(`/invites/${inviteToken}`)
    return result.data
  },
  async connectInvite(token: string, inviteToken: string) {
    const result = await request<{ connection: { id: string }; business: { id: string; name: string } }>(`/invites/${inviteToken}/connect`, token, { method: 'POST' })
    return result
  },
  async businessInvite(token: string) {
    const result = await request<{ data: { inviteUrl: string } }>('/business/invite', token)
    return result.data
  },
  async regenerateBusinessInvite(token: string) {
    const result = await request<{ data: { inviteUrl: string } }>('/business/invite', token, { method: 'POST' })
    return result.data
  },
  async broadcastLists(token: string) {
    return (await request<{ data: BroadcastList[] }>('/broadcast-lists', token)).data
  },
  async connectedCustomers(token: string) {
    return (await request<{ data: ConnectedCustomer[] }>('/business/customers', token)).data
  },
  async createBroadcastList(token: string, name: string, customerIds: string[]) {
    return (await request<{ data: BroadcastList }>('/broadcast-lists', token, { method: 'POST', body: JSON.stringify({ name, customer_ids: customerIds }) })).data
  },
  async deleteBroadcastList(token: string, id: string) {
    return request<void>(`/broadcast-lists/${id}`, token, { method: 'DELETE' })
  },
  async broadcasts(token: string) {
    return (await request<{ data: Broadcast[] }>('/broadcasts', token)).data
  },
  async publishBroadcast(token: string, listId: string, title: string, body: string) {
    return (await request<{ data: Broadcast }>('/broadcasts', token, { method: 'POST', body: JSON.stringify({ list_id: listId, title, body }) })).data
  },
  async updateBroadcast(token: string, id: string, state: { read?: true; saved?: boolean }) {
    return request<void>(`/broadcasts/${id}/state`, token, { method: 'PATCH', body: JSON.stringify(state) })
  },
  async muteBusiness(token: string, id: string, muted: boolean) {
    return request<void>(`/businesses/${id}/mute`, token, { method: 'PUT', body: JSON.stringify({ muted }) })
  },
  async profile(token: string) {
    return (await request<{ data: { settings: ProfileSettings } }>('/profile', token)).data
  },
  async saveProfileSettings(token: string, user: Session['data'], settings: ProfileSettings) {
    return request('/profile', token, { method: 'PATCH', body: JSON.stringify({ name: user.name, username: user.username, ...{
      bio: settings.bio, language: settings.language, show_last_seen: settings.showLastSeen,
      allow_read_receipts: settings.allowReadReceipts, allow_broadcasts: settings.allowBroadcasts,
      quiet_hours_enabled: settings.quietHoursEnabled, quiet_hours_start: settings.quietHoursStart,
      quiet_hours_end: settings.quietHoursEnd, time_zone: settings.timeZone,
    } }) })
  },
  async restore(token: string) {
    return request<{ data: Session['data'] }>('/auth/me', token)
  },
  async logout(token: string) {
    return request<void>('/auth/logout', token, { method: 'POST' })
  },
  async conversations(token: string) {
    const result = await request<{ data: Conversation[] }>('/conversations', token)
    return result.data
  },
  async conversation(token: string, id: string) {
    const result = await request<{ data: ConversationDetail }>(`/conversations/${id}`, token)
    return result.data
  },
  async sendMessage(token: string, id: string, body: string) {
    return this.sendContent(token, id, body, [])
  },
  async uploadImage(token: string, uri: string) {
    const body = new FormData()
    body.append('images', { uri, name: 'nexusos-photo.jpg', type: 'image/jpeg' } as unknown as Blob)
    const result = await request<{ data: Array<{ url: string }> }>('/media/images', token, { method: 'POST', body })
    return result.data.map(image => image.url)
  },
  async uploadAudio(token: string, uri: string) {
    const body = new FormData()
    body.append('audio', { uri, name: 'nexusos-voice.m4a', type: 'audio/mp4' } as unknown as Blob)
    const result = await request<{ data: { url: string } }>('/media/audio', token, { method: 'POST', body })
    return result.data.url
  },
  async registerPushToken(token: string, expoToken: string, deviceId: string) {
    return request<void>('/push/expo-tokens', token, {
      method: 'POST', body: JSON.stringify({ token: expoToken, device_id: deviceId }),
    })
  },
  async removePushToken(token: string, expoToken: string) {
    return request<void>('/push/expo-tokens', token, { method: 'DELETE', body: JSON.stringify({ token: expoToken }) })
  },
  async sendContent(token: string, id: string, body: string, imageUrls: string[], audioUrl?: string | null) {
    const result = await request<{ data: ConversationDetail['messages'][number] }>(
      `/conversations/${id}/messages`, token,
      { method: 'POST', body: JSON.stringify({ body, image_urls: imageUrls, audio_url: audioUrl ?? undefined }) },
    )
    return result.data
  },
  async setConversationState(token: string, id: string, state: { archived?: boolean; muted?: boolean; pinned?: boolean }) {
    return request<void>(`/conversations/${id}/state`, token, { method: 'PATCH', body: JSON.stringify(state) })
  },
}
