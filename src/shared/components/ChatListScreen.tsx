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
      className={`flex w-full flex-col overflow-hidden bg-white dark:bg-[#111b21] ${mode === 'preview' ? 'mx-auto min-h-[720px] max-w-[430px] rounded-[var(--radius-surface)] border-2 border-slate-300 dark:border-slate-700' : 'h-full min-h-0 rounded-none border-0'}`}
    >
      <header className="shrink-0 border-b border-slate-100 px-5 pb-3 pt-5 dark:border-[#26343d]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[24px] font-semibold tracking-[-0.03em]">Chats</h3>
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
            placeholder="Search or start a new chat"
            value={query}
            onChange={onQueryChange}
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Chat filters">
          {(['all', 'unread', 'archived'] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => onFilterChange(item)}
              className={`spring-interaction min-h-9 shrink-0 rounded-full border px-4 text-xs font-semibold capitalize transition  ${filter === item ? 'border-[#00a884] bg-[#00a884] text-white dark:bg-[#00a884] dark:text-[#111b21]' : 'border-transparent bg-[#f0f2f5] text-slate-700 hover:bg-slate-200 dark:bg-[#202c33] dark:text-slate-200 dark:hover:bg-[#2a3942]'}`}
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
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {visible.length ? (
          visible.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => onOpenConversation(chat)}
              aria-current={selectedId === chat.id ? 'true' : undefined}
              className={`chat-list-item group ${selectedId === chat.id ? 'chat-list-item-selected' : ''}`}
            >
              <span
                className={
                  selectedId === chat.id ? 'rounded-full ring-2 ring-[#00a884]/25' : 'rounded-full'
                }
              >
                <Avatar label={chat.name} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[15px] font-bold tracking-[-0.01em]">
                    {chat.name}
                  </span>
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
                  <span className="grid min-w-5 place-items-center rounded-full bg-[#00a884] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
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
