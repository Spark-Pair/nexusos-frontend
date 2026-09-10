import { BadgeCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { AppIcon } from './AppIcon'
import { IconButton } from './IconButton'
import { MobileTabBar, type MobileTabItem } from './MobileTabBar'
import { SearchField } from './SearchField'
import { Avatar } from './Surface'

export type ChatFilter = 'all' | 'unread' | 'archived'
export interface ChatPreview {
  id: string
  name: string
  message: string
  time: string
  unreadCount: number
  verified?: boolean
  category: ChatFilter
}

export function ChatListScreen({
  activeTab,
  conversations,
  filter,
  onActiveTabChange,
  onCompose,
  onFilterChange,
  onOpenConversation,
  onQueryChange,
  query,
  headerActions,
  status,
  mode = 'preview',
  selectedId,
  tabs = [
    { id: 'discover', label: 'Discover', icon: 'discover' },
    { id: 'chats', label: 'Chats', icon: 'chat' }
  ]
}: {
  activeTab: string
  conversations: ChatPreview[]
  filter: ChatFilter
  query: string
  onActiveTabChange: (id: string) => void
  onCompose?: () => void
  onFilterChange: (filter: ChatFilter) => void
  onOpenConversation: (chat: ChatPreview) => void
  onQueryChange: (query: string) => void
  headerActions?: ReactNode
  status?: ReactNode
  mode?: 'preview' | 'app'
  selectedId?: string | null
  tabs?: MobileTabItem[]
}) {
  const visible = conversations.filter((chat) => {
    const matchesFilter = filter === 'all' ? chat.category !== 'archived' : chat.category === filter
    return (
      matchesFilter && `${chat.name} ${chat.message}`.toLowerCase().includes(query.toLowerCase())
    )
  })
  return (
    <div
      className={`flex w-full flex-col overflow-hidden bg-white dark:bg-slate-950 ${mode === 'preview' ? 'mx-auto min-h-[720px] max-w-[430px] rounded-[var(--radius-surface)] border-2 border-slate-300 dark:border-slate-700' : 'h-full min-h-0 rounded-[var(--radius-surface)] border border-slate-300 dark:border-slate-700'}`}
    >
      <header className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
              NexusOS
            </p>
            <h3 className="mt-1 text-[28px] font-bold tracking-[-0.035em]">Chats</h3>
          </div>
          <div className="flex items-center gap-1">
            {headerActions}
            {onCompose ? (
              <IconButton
                onClick={onCompose}
                label="Start a new chat"
                icon={<AppIcon name="compose" className="size-5" />}
                variant="brand"
              />
            ) : null}
          </div>
        </div>
        <div className="mt-4">
          <SearchField
            label="Search chats"
            placeholder="Search chats"
            value={query}
            onChange={onQueryChange}
          />
        </div>
        <div className="mt-3 flex gap-2" aria-label="Chat filters">
          {(['all', 'unread', 'archived'] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => onFilterChange(item)}
              className={`spring-interaction min-h-9 rounded-[var(--radius-control)] border px-4 text-xs font-semibold capitalize transition  ${filter === item ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200' : 'border-slate-300 text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>
      {status && (
        <div className="mx-4 mb-3 rounded-xl bg-slate-100 px-3 py-2 text-xs leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {status}
        </div>
      )}
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2.5 pb-3">
        {visible.length ? (
          visible.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => onOpenConversation(chat)}
              aria-current={selectedId === chat.id ? 'true' : undefined}
              className={`chat-list-item ${selectedId === chat.id ? 'chat-list-item-selected' : ''}`}
            >
              <Avatar label={chat.name} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold">{chat.name}</span>
                  {chat.verified ? (
                    <BadgeCheck
                      aria-label="Verified"
                      className="size-4 fill-blue-600 text-white dark:text-slate-950"
                    />
                  ) : null}
                </span>
                <span
                  className={`mt-1 block truncate text-xs ${chat.unreadCount ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {chat.message}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`text-[10px] ${chat.unreadCount ? 'font-bold text-blue-600' : 'text-slate-400'}`}
                >
                  {chat.time}
                </span>
                {chat.unreadCount ? (
                  <span className="grid min-w-5 place-items-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {chat.unreadCount}
                  </span>
                ) : null}
              </span>
            </button>
          ))
        ) : (
          <div className="grid min-h-56 place-items-center px-8 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-[var(--radius-control)] border border-slate-300 text-slate-400 dark:border-slate-700">
                <AppIcon name="chat" className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold">No chats found</p>
              <p className="mt-1 text-xs text-slate-500">Try another search or filter.</p>
            </div>
          </div>
        )}
      </div>
      {tabs.length > 0 && (
        <MobileTabBar items={tabs} activeId={activeTab} onChange={onActiveTabChange} />
      )}
    </div>
  )
}
