import { ActionMenu, type ActionMenuItem } from '@shared/components/ActionMenu'
import { Button } from '@shared/components/Button'
import { Dialog } from '@shared/components/Dialog'
import { IconButton } from '@shared/components/IconButton'
import { MessageComposer } from '@shared/components/Messaging'
import { SearchField } from '@shared/components/SearchField'
import { Avatar } from '@shared/components/Surface'
import { useToast } from '@shared/components/toastContext'
import {
  Archive,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock3,
  Copy,
  Info,
  LoaderCircle,
  Megaphone,
  Pencil,
  Reply,
  Search,
  Star,
  Volume2,
  VolumeX,
  X,
  Trash2,
  ArrowDown
} from 'lucide-react'
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ConversationDetail } from './messagingApi'
import type { QueuedMessage } from './offlineStore'
import { broadcastMediaUrl } from '@/features/broadcasts/broadcastApi'

const outboxLabels: Record<QueuedMessage['status'], string> = {
  queued: 'Waiting for connection',
  uploading: 'Uploading media',
  sending: 'Sending',
  failed: 'Not sent'
}
const reactionChoices = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const

function outboxIcon(status: QueuedMessage['status']) {
  return status === 'uploading' || status === 'sending' ? (
    <LoaderCircle className="size-3 animate-spin" />
  ) : status === 'failed' ? (
    <Clock3 className="size-3 text-rose-600" />
  ) : (
    <Clock3 className="size-3" />
  )
}

function QueuedImagePreview({
  image,
  index,
  onLoad,
  onOpen
}: {
  image: { blob: Blob; name: string }
  index: number
  onLoad?: () => void
  onOpen: (url: string) => void
}) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const next = URL.createObjectURL(image.blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [image.blob])
  if (!url) return null
  return (
    <button
      type="button"
      className="mb-2 block overflow-hidden rounded-xl"
      aria-label={'View queued image ' + (index + 1)}
      onClick={() => onOpen(url)}
    >
      <img
        src={url}
        alt={image.name || 'Queued image ' + (index + 1)}
        loading="lazy"
        onLoad={onLoad}
        className="max-h-72 w-full object-cover"
      />
    </button>
  )
}

function QueuedAudioPreview({ audio }: { audio: { blob: Blob; name: string } }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const next = URL.createObjectURL(audio.blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [audio.blob])
  return url ? <audio controls src={url} className="mb-2 h-10 w-64 max-w-full" /> : null
}

export function ConversationPanel({
  detail,
  currentUserId,
  onBack,
  onRespond,
  onSend,
  counterpartTyping,
  onTyping,
  archived,
  muted,
  onStateChange,
  queued,
  onRetry,
  onDiscard,
  onReact,
  onEditMessage,
  onDeleteMessage,
  starred,
  onToggleStar,
  offline,
  onReportBroadcast
}: {
  detail: ConversationDetail
  currentUserId: string
  onBack: () => void
  onRespond: (decision: 'accepted' | 'rejected') => Promise<void>
  onSend: (
    body: string,
    files?: File[],
    audio?: File | null,
    replyTo?: ConversationDetail['messages'][number] | null
  ) => Promise<'queued' | 'uploading' | 'sending' | 'failed' | 'sent'>
  counterpartTyping: boolean
  onTyping: (active: boolean) => void
  archived: boolean
  muted: boolean
  onStateChange: (state: { archived?: boolean; muted?: boolean }) => Promise<void>
  queued: QueuedMessage[]
  onRetry: (item: QueuedMessage) => Promise<void>
  onDiscard: (id: string) => Promise<void>
  onReact: (messageId: string, emoji: string | null) => Promise<void>
  onEditMessage: (messageId: string, body: string) => Promise<void>
  onDeleteMessage: (messageId: string) => Promise<void>
  starred: Record<string, true>
  onToggleStar: (messageId: string) => Promise<void>
  offline: boolean
  onReportBroadcast: (id: string) => Promise<void>
}) {
  const toast = useToast()
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [starredOnly, setStarredOnly] = useState(false)
  const [info, setInfo] = useState(false)
  const [image, setImage] = useState<string>()
  const [report, setReport] = useState<string>()
  const [replyTo, setReplyTo] = useState<ConversationDetail['messages'][number] | null>(null)
  const [editing, setEditing] = useState<ConversationDetail['messages'][number] | null>(null)
  const [editBody, setEditBody] = useState('')
  const [reported, setReported] = useState<string[]>([])
  const [busy, setBusy] = useState('')
  const [scrolledUp, setScrolledUp] = useState(false)
  const [newMessages, setNewMessages] = useState(0)
  const [activeMessageMenu, setActiveMessageMenu] = useState<string>()
  const pending = useRef(false)
  const scroll = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const lastSeenLatest = useRef<string | undefined>(detail.messages.at(-1)?.id)
  const longPress = useRef<number | undefined>(undefined)
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const node = scroll.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior })
    setScrolledUp(false)
    setNewMessages(0)
  }, [])
  const closeInfo = useCallback(() => setInfo(false), [])
  const closeImage = useCallback(() => setImage(undefined), [])
  const closeReport = useCallback(() => {
    if (!pending.current) setReport(undefined)
  }, [])
  const latest = detail.messages.at(-1)?.id
  useLayoutEffect(() => {
    stickToBottom.current = true
    setNewMessages(0)
    lastSeenLatest.current = undefined
    scrollToBottom()
    const frame = window.requestAnimationFrame(() => scrollToBottom())
    return () => window.cancelAnimationFrame(frame)
  }, [detail.conversation.id, scrollToBottom])
  useEffect(() => {
    if (!activeMessageMenu) return
    const close = () => setActiveMessageMenu(undefined)
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [activeMessageMenu])
  useLayoutEffect(() => {
    if (!latest || latest === lastSeenLatest.current) return
    if (stickToBottom.current) {
      lastSeenLatest.current = latest
      scrollToBottom()
      return
    }
    lastSeenLatest.current = latest
    setNewMessages((count) => count + 1)
  }, [latest, scrollToBottom])
  useLayoutEffect(() => {
    if (stickToBottom.current) scrollToBottom()
  }, [queued.length, searching, scrollToBottom])
  const run = async (id: string, action: () => Promise<void>, success: string) => {
    if (pending.current) return
    pending.current = true
    setBusy(id)
    try {
      await action()
      toast({ title: success, tone: 'success' })
    } catch (cause) {
      toast({
        title: 'Action failed',
        description: cause instanceof Error ? cause.message : 'Please try again.',
        tone: 'danger'
      })
    } finally {
      pending.current = false
      setBusy('')
    }
  }
  const copyMessage = async (body: string) => {
    if (!body.trim()) return
    try {
      await navigator.clipboard.writeText(body)
      toast({ title: 'Message copied', tone: 'success' })
    } catch {
      toast({
        title: 'Could not copy message',
        description: 'Select the message text manually.',
        tone: 'danger'
      })
    }
  }
  const replyLabel = (
    message: Pick<ConversationDetail['messages'][number], 'body' | 'imageUrls' | 'audioUrl'>
  ) => {
    const body = message.body.trim()
    if (body) return body
    if (message.audioUrl) return 'Voice message'
    return message.imageUrls.length ? `${message.imageUrls.length} photo attachment` : 'Message'
  }
  const clearLongPress = () => {
    window.clearTimeout(longPress.current)
    longPress.current = undefined
  }
  const menuItems = (message: ConversationDetail['messages'][number], own: boolean) =>
    [
      { id: 'reply', label: 'Reply', icon: Reply },
      { id: 'copy', label: 'Copy', icon: Copy, disabled: !message.body.trim() },
      { id: 'star', label: starred[message.id] ? 'Unstar' : 'Star', icon: Star },
      ...(own && message.body.trim() && !message.imageUrls.length && !message.audioUrl
        ? [{ id: 'edit', label: 'Edit', icon: Pencil }]
        : []),
      ...(own ? [{ id: 'delete', label: 'Delete', icon: Trash2, tone: 'danger' as const }] : [])
    ] satisfies ActionMenuItem[]
  const handleMessageAction = (
    message: ConversationDetail['messages'][number],
    id: string,
    close = false
  ) => {
    if (close) setActiveMessageMenu(undefined)
    if (id === 'reply') setReplyTo(message)
    if (id === 'copy') void copyMessage(message.body)
    if (id === 'star')
      void run(
        `star:${message.id}`,
        () => onToggleStar(message.id),
        starred[message.id] ? 'Removed from starred' : 'Added to starred'
      )
    if (id === 'edit') {
      setEditing(message)
      setEditBody(message.body)
    }
    if (id === 'delete')
      void run(`delete:${message.id}`, () => onDeleteMessage(message.id), 'Message deleted')
  }
  const toggleReaction = (message: ConversationDetail['messages'][number], emoji: string) => {
    const alreadyMine = (message.reactions?.[emoji] ?? []).includes(currentUserId)
    void run(
      `${message.id}:${emoji}`,
      () => onReact(message.id, alreadyMine ? null : emoji),
      alreadyMine ? 'Reaction removed' : 'Reaction added'
    )
  }
  const pendingForCustomer =
    detail.conversation.status === 'pending' &&
    detail.conversation.customerId === currentUserId &&
    detail.conversation.invitedBy !== currentUserId
  const normalizedQuery = query.trim().toLowerCase()
  const visible = detail.messages.filter((message) => {
    if (starredOnly && !starred[message.id]) return false
    if (!normalizedQuery) return true
    return (message.title + ' ' + message.body).toLowerCase().includes(normalizedQuery)
  })
  const unsent = queued.filter((item) => !detail.messages.some((message) => message.id === item.id))
  return (
    <section
      aria-label={'Conversation with ' + detail.counterpart.name}
      className="conversation-panel"
    >
      <header className="conversation-header m-2 flex min-h-16 items-center gap-2 px-2 sm:m-3 sm:gap-3 sm:px-4">
        <IconButton
          onClick={onBack}
          label="Back to chats"
          icon={<ArrowLeft className="size-5" />}
          variant="quiet"
          className="lg:hidden"
        />
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-control)] text-left"
          onClick={() => setInfo(true)}
          aria-label="Contact details"
        >
          <Avatar label={detail.counterpart.name} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{detail.counterpart.name}</span>
            <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
              {counterpartTyping
                ? 'Typing...'
                : offline
                  ? 'Offline'
                  : detail.conversation.status === 'accepted'
                    ? muted
                      ? 'Notifications muted'
                      : 'Connected'
                    : detail.conversation.status === 'pending'
                      ? 'Invitation pending'
                      : 'Invitation declined'}
            </span>
          </span>
        </button>
        <IconButton
          label="Search conversation"
          icon={<Search className="size-5" />}
          variant="quiet"
          aria-expanded={searching}
          onClick={() => {
            setSearching((value) => !value)
            setQuery('')
          }}
        />
        <ActionMenu
          label="Conversation actions"
          items={[
            { id: 'info', label: 'Contact details', icon: Info },
            {
              id: 'mute',
              label: muted ? 'Unmute notifications' : 'Mute notifications',
              icon: muted ? Volume2 : VolumeX,
              disabled: !!busy
            },
            {
              id: 'archive',
              label: archived ? 'Unarchive chat' : 'Archive chat',
              icon: Archive,
              disabled: !!busy
            }
          ]}
          onAction={(id) => {
            if (id === 'info') setInfo(true)
            else
              void run(
                id,
                () => onStateChange(id === 'mute' ? { muted: !muted } : { archived: !archived }),
                id === 'mute'
                  ? muted
                    ? 'Notifications unmuted'
                    : 'Notifications muted'
                  : archived
                    ? 'Chat unarchived'
                    : 'Chat archived'
              )
          }}
        />
      </header>
      {searching && (
        <div className="mx-3 mb-2 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchField
              label="Search in this conversation"
              placeholder="Search messages"
              value={query}
              onChange={setQuery}
            />
          </div>
          <button
            type="button"
            className={
              'inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-control)] border px-3 text-sm font-medium transition active:scale-95 ' +
              (starredOnly
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-200'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800')
            }
            aria-pressed={starredOnly}
            onClick={() => setStarredOnly((value) => !value)}
          >
            <Star className={'size-4 ' + (starredOnly ? 'fill-current' : '')} />
            Starred
          </button>
          <IconButton
            label="Close search"
            icon={<X className="size-4" />}
            variant="quiet"
            onClick={() => {
              setSearching(false)
              setQuery('')
              setStarredOnly(false)
            }}
          />
        </div>
      )}
      {offline && (
        <p
          role="status"
          className="mx-3 mb-2 rounded-[var(--radius-control)] bg-amber-50 px-3 py-2 text-center text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          Offline. Messages are saved on this device and sent after reconnecting.
        </p>
      )}
      {busy && (
        <p role="status" className="px-4 text-center text-xs text-slate-500">
          Updating...
        </p>
      )}
      <div
        ref={scroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6"
        onScroll={() => {
          const node = scroll.current
          if (node) {
            stickToBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 100
            setScrolledUp(!stickToBottom.current)
            if (stickToBottom.current) setNewMessages(0)
          }
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          {!visible.length && (
            <p className="py-10 text-center text-sm text-slate-500">
              {starredOnly
                ? 'No starred messages in this conversation.'
                : query
                  ? 'No matching messages in this conversation.'
                  : 'This is the start of your conversation.'}
            </p>
          )}
          {visible.map((message, index) => {
            const date = message.createdAt.toDateString()
            const own = message.senderId === currentUserId
            return (
              <Fragment key={message.id}>
                {(index === 0 || visible[index - 1]?.createdAt.toDateString() !== date) && (
                  <div className="my-3 self-center rounded-full bg-white/80 px-3 py-1.5 text-[11px] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                    {date === new Date().toDateString()
                      ? 'Today'
                      : message.createdAt.toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                  </div>
                )}
                <article
                  id={`message-${message.id}`}
                  className={
                    'message-bubble group relative ' +
                    (own ? 'message-bubble-outgoing' : 'message-bubble-incoming')
                  }
                  onContextMenu={(event) => {
                    if (message.deletedAt) return
                    event.preventDefault()
                    setActiveMessageMenu(message.id)
                  }}
                  onPointerDown={(event) => {
                    if (message.deletedAt || event.pointerType === 'mouse') return
                    clearLongPress()
                    longPress.current = window.setTimeout(() => {
                      setActiveMessageMenu(message.id)
                    }, 450)
                  }}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                >
                  {!message.deletedAt &&
                    (message.body.trim() || message.imageUrls.length || message.audioUrl) && (
                      <div className="absolute -top-4 right-2 z-20 flex items-center rounded-full border border-slate-200 bg-white/95 p-1 opacity-0 shadow-lg shadow-slate-950/10 transition group-hover:opacity-100 group-focus-within:opacity-100 dark:border-slate-700 dark:bg-slate-900/95">
                        {reactionChoices.map((emoji) => (
                          <button
                            type="button"
                            key={emoji}
                            className="grid size-7 place-items-center rounded-full text-sm transition hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-800"
                            aria-label={`React ${emoji}`}
                            disabled={!!busy}
                            onClick={() => toggleReaction(message, emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                        <ActionMenu
                          label="Message actions"
                          items={menuItems(message, own)}
                          onAction={(id) => handleMessageAction(message, id)}
                        />
                      </div>
                    )}
                  {activeMessageMenu === message.id && !message.deletedAt ? (
                    <div
                      role="menu"
                      className="message-context-menu"
                      style={{ top: '2.5rem', right: own ? 0 : 'auto', left: own ? 'auto' : 0 }}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="message-context-reactions" aria-label="Quick reactions">
                        {reactionChoices.map((emoji) => (
                          <button
                            type="button"
                            key={emoji}
                            className="message-context-reaction"
                            aria-label={`React ${emoji}`}
                            disabled={!!busy}
                            onClick={() => {
                              setActiveMessageMenu(undefined)
                              toggleReaction(message, emoji)
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="message-context-actions">
                        {menuItems(message, own).map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.id}
                              type="button"
                              role="menuitem"
                              disabled={item.disabled}
                              className={`action-menu-item ${item.tone === 'danger' ? 'text-rose-600 dark:text-rose-300' : ''}`}
                              onClick={() => handleMessageAction(message, item.id, true)}
                            >
                              <Icon className="size-4" aria-hidden="true" />
                              {item.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                  {!message.deletedAt && message.replyToMessageId && (
                    <button
                      type="button"
                      className="mb-2 w-full rounded-xl border-l-4 border-[var(--color-primary)] bg-white/70 px-3 py-2 text-left text-xs text-slate-600 dark:bg-slate-950/50 dark:text-slate-300"
                      onClick={() =>
                        document
                          .getElementById(`message-${message.replyToMessageId}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    >
                      <span className="block font-semibold text-[var(--color-primary)]">
                        {message.replyToSenderId === currentUserId
                          ? 'You'
                          : detail.counterpart.name}
                      </span>
                      <span className="line-clamp-2">
                        {message.replyToBody?.trim() ? message.replyToBody.trim() : 'Attachment'}
                      </span>
                    </button>
                  )}
                  {message.deletedAt ? (
                    <p className="text-sm italic text-slate-500 dark:text-slate-400">
                      This message was deleted
                    </p>
                  ) : null}
                  {!message.deletedAt && message.broadcastId && (
                    <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                      <Megaphone className="size-3" />
                      Broadcast
                    </p>
                  )}
                  {!message.deletedAt && message.title && (
                    <h2 className="mb-1 text-sm font-semibold">{message.title}</h2>
                  )}
                  {!message.deletedAt &&
                    message.imageUrls.map((url, imageIndex) => (
                      <button
                        type="button"
                        key={url}
                        className="mb-2 block overflow-hidden rounded-xl"
                        aria-label={'View image ' + (imageIndex + 1)}
                        onClick={() => setImage(url)}
                      >
                        <img
                          src={broadcastMediaUrl(url)}
                          alt={'Message image ' + (imageIndex + 1)}
                          loading="lazy"
                          onLoad={() => {
                            if (stickToBottom.current) scrollToBottom()
                          }}
                          className="max-h-72 w-full object-cover"
                        />
                      </button>
                    ))}
                  {!message.deletedAt && message.audioUrl && (
                    <audio
                      controls
                      src={broadcastMediaUrl(message.audioUrl)}
                      className="mb-2 h-10 w-64 max-w-full"
                    />
                  )}
                  {!message.deletedAt && message.body.trim() ? (
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.body}
                      {message.editedAt ? (
                        <span className="ml-1 text-[10px] text-slate-500">(edited)</span>
                      ) : null}
                    </p>
                  ) : null}
                  {!message.deletedAt && Object.entries(message.reactions ?? {}).length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(message.reactions ?? {}).map(([emoji, users]) => (
                        <button
                          type="button"
                          key={emoji}
                          className={
                            'inline-flex min-h-7 items-center gap-1 rounded-full border px-2 text-xs transition active:scale-95 ' +
                            (users.includes(currentUserId)
                              ? 'border-[var(--color-primary)] bg-emerald-50 text-[var(--color-primary)] dark:bg-emerald-950/40'
                              : 'border-slate-200 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300')
                          }
                          onClick={() => toggleReaction(message, emoji)}
                        >
                          <span>{emoji}</span>
                          <span>{users.length}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    {starred[message.id] && (
                      <Star
                        className="mr-auto size-3 fill-amber-400 text-amber-500"
                        aria-label="Starred"
                      />
                    )}
                    {message.broadcastId && !own && (
                      <button
                        type="button"
                        className="mr-auto min-h-8 rounded-lg px-1 text-xs hover:text-rose-600"
                        disabled={reported.includes(message.broadcastId)}
                        onClick={() => setReport(message.broadcastId ?? undefined)}
                      >
                        {reported.includes(message.broadcastId) ? 'Reported' : 'Report'}
                      </button>
                    )}
                    <time dateTime={message.createdAt.toISOString()}>
                      {message.createdAt.toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </time>
                    {own &&
                      (message.localStatus ? (
                        <span
                          className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400"
                          aria-label={outboxLabels[message.localStatus]}
                        >
                          {outboxIcon(message.localStatus)}
                        </span>
                      ) : message.readAt ? (
                        <CheckCheck className="size-3.5 text-blue-600" aria-label="Read" />
                      ) : message.deliveredAt ? (
                        <CheckCheck className="size-3.5" aria-label="Delivered" />
                      ) : (
                        <Check className="size-3.5" aria-label="Sent to server" />
                      ))}
                  </div>
                </article>
              </Fragment>
            )
          })}
          {!query &&
            unsent.map((item) => (
              <article key={item.id} className="message-bubble message-bubble-outgoing">
                {item.imageUrls?.map((url, imageIndex) => (
                  <button
                    type="button"
                    key={url}
                    className="mb-2 block overflow-hidden rounded-xl"
                    aria-label={'View queued image ' + (imageIndex + 1)}
                    onClick={() => setImage(url)}
                  >
                    <img
                      src={broadcastMediaUrl(url)}
                      alt={'Queued image ' + (imageIndex + 1)}
                      loading="lazy"
                      onLoad={() => {
                        if (stickToBottom.current) scrollToBottom()
                      }}
                      className="max-h-72 w-full object-cover"
                    />
                  </button>
                ))}
                {!item.imageUrls?.length &&
                  item.images?.map((image, imageIndex) => (
                    <QueuedImagePreview
                      key={`${item.id}-${imageIndex}`}
                      image={image}
                      index={imageIndex}
                      onLoad={() => {
                        if (stickToBottom.current) scrollToBottom()
                      }}
                      onOpen={setImage}
                    />
                  ))}
                {item.audioUrl ? (
                  <audio
                    controls
                    src={broadcastMediaUrl(item.audioUrl)}
                    className="mb-2 h-10 w-64 max-w-full"
                  />
                ) : item.audio ? (
                  <QueuedAudioPreview audio={item.audio} />
                ) : null}
                {item.body ? (
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">{item.body}</p>
                ) : null}
                <p
                  role="status"
                  className={
                    'mt-1 flex items-center justify-end gap-1 text-[11px] ' +
                    (item.status === 'failed'
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-slate-500 dark:text-slate-400')
                  }
                >
                  {outboxIcon(item.status)}
                  {outboxLabels[item.status]}
                </p>
                {item.status === 'failed' && (
                  <>
                    <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">{item.error}</p>
                    <div className="mt-2 flex justify-end gap-1">
                      <Button
                        size="sm"
                        disabled={!!busy}
                        loading={busy === item.id}
                        onClick={() =>
                          void run(item.id, () => onRetry(item), 'Message retry processed')
                        }
                      >
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        variant="quiet"
                        disabled={!!busy}
                        onClick={() =>
                          void run(item.id, () => onDiscard(item.id), 'Unsent message removed')
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </>
                )}
              </article>
            ))}
        </div>
      </div>
      {scrolledUp && (
        <div className="absolute bottom-28 right-5">
          {newMessages ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition active:scale-95"
              onClick={() => scrollToBottom('smooth')}
            >
              <ArrowDown className="size-4" />
              {newMessages === 1 ? '1 new message' : `${newMessages} new messages`}
            </button>
          ) : (
            <IconButton
              label="Jump to latest message"
              icon={<ArrowDown className="size-5" />}
              onClick={() => scrollToBottom('smooth')}
            />
          )}
        </div>
      )}
      {pendingForCustomer ? (
        <footer className="p-4">
          <p className="mb-3 text-center text-sm text-slate-500">
            Accept this invitation to start messaging.
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="quiet"
              disabled={!!busy}
              loading={busy === 'reject'}
              onClick={() => void run('reject', () => onRespond('rejected'), 'Invitation declined')}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              disabled={!!busy}
              loading={busy === 'accept'}
              onClick={() => void run('accept', () => onRespond('accepted'), 'Invitation accepted')}
            >
              Accept invitation
            </Button>
          </div>
        </footer>
      ) : detail.conversation.status === 'accepted' ? (
        <footer className="px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 sm:px-3 sm:pb-3">
          <div className="mx-auto max-w-3xl">
            {replyTo && (
              <div className="mb-2 flex items-start gap-3 rounded-[var(--radius-surface)] border border-slate-300 bg-white/90 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/90">
                <div className="min-w-0 flex-1 border-l-4 border-[var(--color-primary)] pl-3">
                  <p className="text-xs font-semibold text-[var(--color-primary)]">
                    Replying to{' '}
                    {replyTo.senderId === currentUserId ? 'your message' : detail.counterpart.name}
                  </p>
                  <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                    {replyLabel(replyTo)}
                  </p>
                </div>
                <IconButton
                  label="Cancel reply"
                  icon={<X className="size-4" />}
                  size="sm"
                  variant="quiet"
                  onClick={() => setReplyTo(null)}
                />
              </div>
            )}
            <MessageComposer
              onSubmit={async (body, files, audio) => {
                stickToBottom.current = true
                try {
                  const result = await onSend(body, files, audio, replyTo)
                  setReplyTo(null)
                  if (result === 'failed')
                    toast({
                      title: 'Message not sent',
                      description: 'Use Retry on the message to try again.',
                      tone: 'danger'
                    })
                } catch (cause) {
                  toast({
                    title: 'Message not sent',
                    description: cause instanceof Error ? cause.message : 'Please retry.',
                    tone: 'danger'
                  })
                  throw cause
                }
              }}
              onTyping={onTyping}
            />
          </div>
        </footer>
      ) : (
        <footer className="p-4 text-center text-sm text-slate-500">
          Messaging becomes available after the invitation is accepted.
        </footer>
      )}
      <Dialog
        open={!!report}
        title="Report broadcast?"
        description="This broadcast will be sent to the moderation team for review."
        onClose={closeReport}
      >
        <div className="flex justify-end gap-2">
          <Button disabled={!!busy} onClick={closeReport}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={busy === 'report'}
            disabled={!!busy}
            onClick={() => {
              if (report)
                void run(
                  'report',
                  async () => {
                    await onReportBroadcast(report)
                    setReported((items) => [...items, report])
                    setReport(undefined)
                  },
                  'Broadcast reported'
                )
            }}
          >
            Report broadcast
          </Button>
        </div>
      </Dialog>
      <Dialog open={info} title="Contact details" onClose={closeInfo}>
        <div className="flex flex-col items-center gap-3 py-5">
          <Avatar label={detail.counterpart.name} />
          <h2 className="text-xl font-semibold">{detail.counterpart.name}</h2>
          <p className="text-sm text-slate-500">@{detail.counterpart.username}</p>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize dark:bg-slate-800">
            {detail.counterpart.accountKind}
          </p>
        </div>
        <dl className="space-y-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
          <div className="flex justify-between">
            <dt>Connection</dt>
            <dd className="capitalize">{detail.conversation.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Notifications</dt>
            <dd>{muted ? 'Muted' : 'On'}</dd>
          </div>
        </dl>
      </Dialog>
      <Dialog
        open={!!editing}
        title="Edit message"
        description="Update this text message for everyone in the chat."
        onClose={() => setEditing(null)}
      >
        <textarea
          value={editBody}
          maxLength={4000}
          rows={4}
          onChange={(event) => setEditBody(event.target.value)}
          className="field-control min-h-28 resize-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="quiet" disabled={!!busy} onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button
            loading={busy === 'edit'}
            disabled={!!busy || !editBody.trim()}
            onClick={() => {
              if (!editing) return
              void run(
                'edit',
                async () => {
                  await onEditMessage(editing.id, editBody)
                  setEditing(null)
                },
                'Message updated'
              )
            }}
          >
            Save changes
          </Button>
        </div>
      </Dialog>
      <Dialog open={!!image} title="Broadcast image" onClose={closeImage}>
        {image && (
          <img
            src={broadcastMediaUrl(image)}
            alt="Broadcast attachment"
            className="max-h-[65dvh] w-full rounded-2xl object-contain"
          />
        )}
      </Dialog>
    </section>
  )
}
