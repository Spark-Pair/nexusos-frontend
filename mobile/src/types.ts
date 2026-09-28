export type AccountKind = 'customer' | 'business'

export interface User {
  id: string
  name: string
  username: string
  email: string | null
  phone: string | null
  account_kind: AccountKind
  phone_verified_at: string | null
  is_admin: boolean
}

export interface Session {
  data: User
  token: string
  requires_phone: boolean
  invite_connection?: { alreadyConnected: boolean; business: { id: string; name: string }; connection: { id: string } }
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
  deliveredAt?: string | null
  readAt: string | null
  imageUrls?: string[]
  audioUrl?: string | null
  deletedAt?: string | null
}

export interface Conversation {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  counterpart: { id: string; name: string; username: string; accountKind: AccountKind }
  lastMessage: Message | null
  unreadCount: number
  archived: boolean
  muted: boolean
  pinned: boolean
}

export interface ConversationDetail {
  conversation: { id: string; status: Conversation['status'] }
  counterpart: Conversation['counterpart']
  messages: Message[]
}
