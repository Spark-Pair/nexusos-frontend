import { ActionMenu } from '@shared/components/ActionMenu'
import { ApplicationFrame } from '@shared/components/ApplicationFrame'
import { AppSidebar } from '@shared/components/AppSidebar'
import { Button } from '@shared/components/Button'
import {
  ChatListScreen,
  type ChatFilter,
  type ChatPreview
} from '@shared/components/ChatListScreen'
import { Dialog } from '@shared/components/Dialog'
import { IconButton } from '@shared/components/IconButton'
import { MobileTabBar, type MobileTabItem } from '@shared/components/MobileTabBar'
import { useToast } from '@shared/components/toastContext'
import { WorkspaceNavLink } from '@shared/components/WorkspaceNavLink'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { History, ListChecks, Megaphone, MessageCircle, RefreshCw, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ConnectionsPanel } from './ConnectionsPanel'
import { ConversationPanel } from './ConversationPanel'
import { messagingApi } from './messagingApi'
import { setUnreadCount, useUnreadCount } from './unreadCount'
import { useMessaging } from './useMessaging'
import { useAuthSession } from '@/features/authentication/authSession'
import { usePushNotifications } from '@/features/notifications/usePushNotifications'
import { haptic } from '@/shared/motion/haptics'

export default function ChatsPage() {
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { session, serverConfirmed } = useAuthSession()
  usePushNotifications(session!.token)
  const messaging = useMessaging(session!.token, session!.data.id, serverConfirmed)
  const unreadCount = useUnreadCount(session!.data.id)
  const { open, setSelected } = messaging
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ChatFilter>(() =>
    searchParams.get('filter') === 'unread' ? 'unread' : 'all'
  )
  const [messageMatches, setMessageMatches] = useState<Record<string, string>>({})
  const [messageSearchStatus, setMessageSearchStatus] = useState('')
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [discovering, setDiscovering] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)').matches : false
  )
  const reducedMotion = useReducedMotion()
  const conversationSwipe = useRef<{ x: number; y: number } | undefined>(undefined)
  const closeDiscover = useCallback(() => setDiscovering(false), [])
  useEffect(() => {
    setFilter(searchParams.get('filter') === 'unread' ? 'unread' : 'all')
  }, [searchParams])
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  useEffect(() => {
    if (conversationId) void open(conversationId).catch(() => undefined)
    else setSelected(undefined)
  }, [conversationId, open, setSelected])
  const previews = useMemo<ChatPreview[]>(
    () =>
      messaging.conversations.map((item) => ({
        id: item.id,
        name: item.counterpart.name,
        message: item.lastMessage
          ? (item.lastMessage.broadcastId ? 'Broadcast: ' : '') + item.lastMessage.body
          : 'Invitation pending',
        time: new Intl.DateTimeFormat(
          'en',
          item.updatedAt.toDateString() === new Date().toDateString()
            ? { hour: 'numeric', minute: '2-digit' }
            : { month: 'short', day: 'numeric' }
        ).format(item.updatedAt),
        unreadCount: item.unreadCount,
        pinned: item.pinned,
        muted: item.muted,
        category: item.archived ? 'archived' : item.unreadCount ? 'unread' : 'all'
      })),
    [messaging.conversations]
  )
  useEffect(() => {
    if (messaging.loading) return
    setUnreadCount(
      session!.data.id,
      messaging.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0)
    )
  }, [messaging.conversations, messaging.loading, session])
  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setMessageMatches({})
      setMessageSearchStatus('')
      return
    }
    if (!isOnline || !serverConfirmed) {
      setMessageMatches({})
      setMessageSearchStatus('Offline: searching chat names and saved previews only.')
      return
    }
    let current = true
    setMessageSearchStatus('Searching message history...')
    const timer = window.setTimeout(() => {
      void messagingApi
        .searchMessages(session!.token, term)
        .then((results) => {
          if (!current) return
          const matches: Record<string, string> = {}
          for (const result of results) {
            if (matches[result.conversationId]) continue
            matches[result.conversationId] = [result.title, result.body].filter(Boolean).join(': ')
          }
          setMessageMatches(matches)
          setMessageSearchStatus('')
        })
        .catch(() => {
          if (!current) return
          setMessageMatches({})
          setMessageSearchStatus(
            'Message history search is unavailable. Showing chat names and previews.'
          )
        })
    }, 250)
    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [isOnline, query, serverConfirmed, session])
  const business = session!.data.account_kind === 'business'
  const current = messaging.conversations.find((item) => item.id === conversationId)
  const onConversationPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isMobile || event.pointerType !== 'touch') return
    const target = event.target
    if (
      target instanceof Element &&
      target.closest('button, a, input, textarea, select, [role="button"], [data-no-page-swipe]')
    )
      return
    conversationSwipe.current = { x: event.clientX, y: event.clientY }
  }
  const onConversationPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = conversationSwipe.current
    conversationSwipe.current = undefined
    if (!start || event.pointerType !== 'touch') return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (dx < 76 || Math.abs(dy) > 64 || dx < Math.abs(dy) * 1.3) return
    event.preventDefault()
    haptic('selection')
    void navigate('/app/chats')
  }
  const mobileItems: MobileTabItem[] = business
    ? [
        {
          id: 'chats',
          label: 'Chats',
          icon: 'chats',
          ...(unreadCount
            ? {
                badge: unreadCount,
                onBadgeClick: () => {
                  setFilter('unread')
                  setQuery('')
                  setSearchParams({ filter: 'unread' })
                }
              }
            : {})
        },
        { id: 'broadcasts', label: 'Lists', icon: 'broadcasts' },
        { id: 'compose', label: 'Send', icon: 'send' },
        { id: 'history', label: 'History', icon: 'history' },
        { id: 'profile', label: 'Profile', icon: 'profile' }
      ]
    : [
        {
          id: 'chats',
          label: 'Chats',
          icon: 'chats',
          ...(unreadCount
            ? {
                badge: unreadCount,
                onBadgeClick: () => {
                  setFilter('unread')
                  setQuery('')
                  setSearchParams({ filter: 'unread' })
                }
              }
            : {})
        },
        { id: 'profile', label: 'Profile', icon: 'profile' }
      ]
  return (
    <ApplicationFrame
      className={
        'inbox-shell inbox-shell-with-sidebar overflow-x-hidden ' +
        (!conversationId ? 'max-lg:pb-[var(--mobile-app-bar-height)]' : '')
      }
      sidebar={
        <AppSidebar
          brandHref="/app/chats"
          roleLabel={business ? 'Business workspace' : 'Customer inbox'}
          footer={
            <WorkspaceNavLink to="/app/profile" icon={UserRound}>
              <span className="min-w-0">
                <span className="block truncate">{session!.data.name}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Profile & settings
                </span>
              </span>
            </WorkspaceNavLink>
          }
        >
          <WorkspaceNavLink to="/app/chats" icon={MessageCircle} active>
            Chats
          </WorkspaceNavLink>
          {business ? (
            <div className="grid gap-1">
              <WorkspaceNavLink to="/business/broadcasts/lists" icon={ListChecks}>
                Broadcast lists
              </WorkspaceNavLink>
              <WorkspaceNavLink to="/business/broadcasts/compose" icon={Megaphone}>
                New broadcast
              </WorkspaceNavLink>
              <WorkspaceNavLink to="/business/broadcasts/history" icon={History}>
                Broadcast history
              </WorkspaceNavLink>
            </div>
          ) : null}
        </AppSidebar>
      }
    >
      <aside aria-label="Chat inbox" className="inbox-list flex">
        <ChatListScreen
          mode="app"
          activeTab="chats"
          tabs={[]}
          conversations={previews}
          filter={filter}
          query={query}
          messageMatches={messageMatches}
          selectedId={conversationId ?? null}
          headerActions={
            <ActionMenu
              label="Inbox actions"
              items={[
                ...(business
                  ? [{ id: 'broadcasts', label: 'Broadcast lists', icon: Megaphone }]
                  : []),
                { id: 'profile', label: 'Profile and settings', icon: UserRound },
                {
                  id: 'refresh',
                  label: 'Refresh chats',
                  icon: RefreshCw,
                  disabled: messaging.loading
                }
              ]}
              onAction={(id) => {
                if (id === 'refresh') void messaging.refresh()
                else void navigate(id === 'broadcasts' ? '/business/broadcasts' : '/app/profile')
              }}
            />
          }
          {...(business ? { onCompose: () => setDiscovering(true) } : {})}
          onActiveTabChange={() => undefined}
          onFilterChange={setFilter}
          onOpenConversation={(chat) => {
            haptic('light')
            const search =
              messageMatches[chat.id] && query.trim()
                ? `?search=${encodeURIComponent(query.trim())}`
                : ''
            void navigate('/app/chats/' + chat.id + search)
          }}
          onQuickAction={(chat, action) => {
            const conversation = messaging.conversations.find((item) => item.id === chat.id)
            if (!conversation) return
            const state =
              action === 'pin'
                ? { pinned: !conversation.pinned }
                : action === 'mute'
                  ? { muted: !conversation.muted }
                  : { archived: !conversation.archived }
            void messaging.setConversationStateFor(chat.id, state)
          }}
          onQueryChange={setQuery}
          status={
            messageSearchStatus || messaging.loading || messaging.error ? (
              <div className="grid gap-2">
                {messageSearchStatus ? <p role="status">{messageSearchStatus}</p> : null}
                {messaging.loading ? <p role="status">Loading chats...</p> : null}
                {messaging.error ? (
                  <div className="flex items-center justify-between gap-2">
                    <p role="status">{messaging.error}</p>
                    <IconButton
                      label="Retry loading chats"
                      size="sm"
                      variant="quiet"
                      icon={<RefreshCw className="size-4" />}
                      onClick={() => void messaging.refresh()}
                    />
                  </div>
                ) : null}
              </div>
            ) : null
          }
        />
      </aside>
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={conversationId ?? 'chat-empty'}
          className={
            'inbox-conversation ' +
            (conversationId ? 'flex inbox-conversation-mobile-overlay' : 'hidden lg:flex')
          }
          initial={isMobile && conversationId && !reducedMotion ? { x: '100%' } : false}
          animate={{ x: 0 }}
          {...(isMobile && !reducedMotion ? { exit: { x: '100%' } } : {})}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 360, damping: 30, mass: 0.8 }
          }
          onPointerDown={onConversationPointerDown}
          onPointerUp={onConversationPointerUp}
          onPointerCancel={() => {
            conversationSwipe.current = undefined
          }}
        >
          {messaging.selected?.conversation.id === conversationId && messaging.selected ? (
            <ConversationPanel
              key={conversationId}
              detail={messaging.selected}
              currentUserId={session!.data.id}
              initialSearch={searchParams.get('search') ?? ''}
              onBack={() => {
                haptic('light')
                void navigate('/app/chats')
              }}
              onRespond={messaging.respond}
              onSend={messaging.send}
              counterpartTyping={messaging.counterpartTyping}
              onTyping={messaging.setTyping}
              archived={current?.archived ?? false}
              muted={current?.muted ?? false}
              pinned={current?.pinned ?? false}
              onStateChange={messaging.setConversationState}
              queued={messaging.queued.filter((item) => item.conversationId === conversationId)}
              onRetry={messaging.retry}
              onDiscard={messaging.discard}
              onReact={messaging.react}
              onEditMessage={messaging.editMessage}
              onDeleteMessage={messaging.deleteMessage}
              onForwardMessages={messaging.forwardMessages}
              forwardTargets={messaging.conversations}
              starred={messaging.starred}
              onToggleStar={messaging.toggleStar}
              offline={!serverConfirmed}
              onReportBroadcast={messaging.reportBroadcast}
            />
          ) : (
            <section className="inbox-empty">
              <MessageCircle className="size-12 text-blue-600" strokeWidth={1.25} />
              <h1 className="mt-5 text-2xl font-semibold tracking-tight">
                {messaging.opening
                  ? 'Opening chat...'
                  : conversationId
                    ? 'Unable to open chat'
                    : 'NexusOS for your everyday conversations'}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                {conversationId
                  ? messaging.error
                  : 'Messages and broadcasts, together in your inbox. Choose a chat to get started.'}
              </p>
              {conversationId && (
                <Button className="mt-5" onClick={() => void navigate('/app/chats')}>
                  Back to chats
                </Button>
              )}
              {!conversationId && (
                <p className="mt-8 text-xs text-slate-500">
                  Your recently opened chats are available offline on this device.
                </p>
              )}
            </section>
          )}
        </motion.div>
      </AnimatePresence>
      <Dialog
        open={discovering}
        title="New chat"
        description="Invite a customer to connect with your business."
        onClose={closeDiscover}
      >
        <ConnectionsPanel
          profiles={messaging.directory}
          actorKind={session!.data.account_kind}
          onSearch={messaging.search}
          onInvite={async (id, body) => {
            await messaging.invite(id, body)
            closeDiscover()
            toast({
              title: 'Invitation sent',
              description: 'Messaging opens when the customer accepts.',
              tone: 'success'
            })
          }}
        />
      </Dialog>
      {!conversationId && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <MobileTabBar
            activeId="chats"
            items={mobileItems}
            onChange={(id) => {
              if (id === 'profile') void navigate('/app/profile')
              else if (id === 'compose') void navigate('/business/broadcasts/compose')
              else if (id === 'history') void navigate('/business/broadcasts/history')
              else if (id === 'broadcasts') void navigate('/business/broadcasts/lists')
              else void navigate('/app/chats')
            }}
          />
        </div>
      )}
    </ApplicationFrame>
  )
}
