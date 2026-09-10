import {
  Bell,
  Compass,
  History,
  ListChecks,
  MessageCircle,
  Package,
  PencilLine,
  Send,
  Search,
  UserRound,
  type LucideIcon,
  type LucideProps
} from 'lucide-react'

export type AppIconName =
  | 'broadcasts'
  | 'chat'
  | 'chats'
  | 'compose'
  | 'discover'
  | 'history'
  | 'orders'
  | 'profile'
  | 'search'
  | 'send'
  | 'updates'

const icons: Record<AppIconName, LucideIcon> = {
  broadcasts: ListChecks,
  chat: MessageCircle,
  chats: MessageCircle,
  compose: PencilLine,
  discover: Compass,
  history: History,
  orders: Package,
  profile: UserRound,
  search: Search,
  send: Send,
  updates: Bell
}

export function AppIcon({ name, ...props }: LucideProps & { name: AppIconName }) {
  const Icon = icons[name]
  return <Icon aria-hidden="true" strokeWidth={1.8} {...props} />
}
