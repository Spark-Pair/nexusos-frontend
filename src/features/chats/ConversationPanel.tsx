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
  Pin,
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Copy,
  Forward,
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
  ArrowDown,
  Download
} from 'lucide-react'
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useMediaUrl } from './mediaCache'
import type { ConversationDetail, ConversationSummary } from './messagingApi'
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

function downloadName(url: string, fallback: string) {
  const name = url.split('/').pop()?.split('?')[0]
  return name ?? fallback
}

function escapeSearchPattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function HighlightedMessageText({ text, query }: { text: string; query: string }) {
  const needle = query.trim()
  if (!needle) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeSearchPattern(needle)})`, 'giu'))
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === needle.toLowerCase() ? (
          <mark
            key={index}
            className="rounded bg-amber-200/80 px-0.5 text-inherit dark:bg-amber-400/40"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  )
}

function CachedImage({
  path,
  actorId,
  alt,
  className,
  onLoad
}: {
  path: string
  actorId: string
  alt: string
  className?: string
  onLoad?: () => void
}) {
  const src = useMediaUrl(path, actorId)
  return <img src={src} alt={alt} loading="lazy" onLoad={onLoad} className={className} />
}

function CachedAudio({
  path,
  actorId,
  className
}: {
  path: string
  actorId: string
  className?: string
}) {
  const src = useMediaUrl(path, actorId)
  return <audio controls src={src} className={className} />
}

function CachedDialogImage({ path, actorId, alt }: { path: string; actorId: string; alt: string }) {
  const src = useMediaUrl(path, actorId)
  return <img src={src} alt={alt} className="max-h-[70dvh] w-full object-contain" />
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
  pinned,
  onStateChange,
  queued,
  onRetry,
  onDiscard,
  onReact,
  onEditMessage,
  onDeleteMessage,
  onForwardMessages,
  forwardTargets,
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
  pinned: boolean
  onStateChange: (state: { archived?: boolean; muted?: boolean; pinned?: boolean }) => Promise<void>
  queued: QueuedMessage[]
  onRetry: (item: QueuedMessage) => Promise<void>
  onDiscard: (id: string) => Promise<void>
  onReact: (messageId: string, emoji: string | null) => Promise<void>
  onEditMessage: (messageId: string, body: string) => Promise<void>
  onDeleteMessage: (messageId: string) => Promise<void>
  onForwardMessages: (
    conversationId: string,
    messages: ConversationDetail['messages']
  ) => Promise<void>
  forwardTargets: ConversationSummary[]
  starred: Record<string, true>
  onToggleStar: (messageId: string) => Promise<void>
  offline: boolean
  onReportBroadcast: (id: string) => Promise<void>
}) {
  const toast = useToast()
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [starredOnly, setStarredOnly] = useState(false)
  const [activeSearchIndex, setActiveSearchIndex] = useState(0)
  const [info, setInfo] = useState(false)
  const [image, setImage] = useState<{ urls: string[]; index: number }>()
  const [report, setReport] = useState<string>()
  const [replyTo, setReplyTo] = useState<ConversationDetail['messages'][number] | null>(null)
  const [editing, setEditing] = useState<ConversationDetail['messages'][number] | null>(null)
  const [forwarding, setForwarding] = useState<ConversationDetail['messages']>([])
  const [editBody, setEditBody] = useState('')
  const [reported, setReported] = useState<string[]>([])
  const [busy, setBusy] = useState('')
  const [scrolledUp, setScrolledUp] = useState(false)
  const [newMessages, setNewMessages] = useState(0)
  const [newMessageStartId, setNewMessageStartId] = useState<string>()
  const [activeMessageMenu, setActiveMessageMenu] = useState<string>()
  const [selectedMessages, setSelectedMessages] = useState<Record<string, true>>({})
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
    setNewMessageStartId(undefined)
  }, [])
  const closeInfo = useCallback(() => setInfo(false), [])
  const closeImage = useCallback(() => setImage(undefined), [])
  const currentImage = image?.urls[image.index]
  const closeReport = useCallback(() => {
    if (!pending.current) setReport(undefined)
  }, [])
  const selectedIds = Object.keys(selectedMessages)
  const selecting = selectedIds.length > 0
  const selectedMessageRows = detail.messages.filter((message) => selectedMessages[message.id])
  const latest = detail.messages.at(-1)?.id
  useLayoutEffect(() => {
    stickToBottom.current = true
    setNewMessages(0)
    setNewMessageStartId(undefined)
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
    setNewMessageStartId((current) => current ?? latest)
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
  const toggleSelectedMessage = (id: string) => {
    setSelectedMessages((current) => {
      const next = { ...current }
      if (next[id]) delete next[id]
      else next[id] = true
      return next
    })
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
      { id: 'forward', label: 'Forward', icon: Forward },
      { id: 'select', label: 'Select', icon: Check },
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
    if (id === 'forward') setForwarding([message])
    if (id === 'select') toggleSelectedMessage(message.id)
    if (id === 'edit') {
      setEditing(message)
      setEditBody(message.body)
    }
    if (id === 'delete')
      void run(`delete:${message.id}`, () => onDeleteMessage(message.id), 'Message deleted')
  }
  const forwardableSelectedMessages = selectedMessageRows.filter((message) => !message.deletedAt)
  const forwardTargetOptions = forwardTargets.filter(
    (item) => item.id !== detail.conversation.id && item.status !== 'rejected'
  )
  const copySelectedMessages = async () => {
    const text = selectedMessageRows
      .map((message) => {
        const sender = message.senderId === currentUserId ? 'You' : detail.counterpart.name
        return `[${message.createdAt.toLocaleString()}] ${sender}: ${replyLabel(message)}`
      })
      .join('\n')
    await copyMessage(text)
    setSelectedMessages({})
  }
  const starSelectedMessages = async () => {
    await Promise.all(selectedIds.filter((id) => !starred[id]).map((id) => onToggleStar(id)))
    setSelectedMessages({})
  }
  const deleteSelectedMessages = async () => {
    const ownIds = selectedMessageRows
      .filter((message) => message.senderId === currentUserId && !message.deletedAt)
      .map((message) => message.id)
    await Promise.all(ownIds.map((id) => onDeleteMessage(id)))
    setSelectedMessages({})
    if (ownIds.length !== selectedIds.length)
      toast({
        title: 'Some messages were not deleted',
        description: 'Only your own messages can be deleted.',
        tone: 'danger'
      })
    else toast({ title: 'Selected messages deleted', tone: 'success' })
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
  const matchingMessageIds = useMemo(
    () =>
      normalizedQuery
        ? detail.messages
            .filter((message) =>
              (message.title + ' ' + message.body).toLowerCase().includes(normalizedQuery)
            )
            .map((message) => message.id)
        : [],
    [detail.messages, normalizedQuery]
  )
  const activeSearchMessageId = matchingMessageIds[activeSearchIndex]
  const visible = detail.messages.filter((message) => {
    if (starredOnly && !starred[message.id]) return false
    if (!normalizedQuery) return true
    return matchingMessageIds.includes(message.id)
  })
  const visibleImages = useMemo(
    () => visible.flatMap((message) => (message.deletedAt ? [] : message.imageUrls)),
    [visible]
  )
  const openImage = (url: string, scope: string[] = visibleImages) => {
    const urls = scope.length ? scope : [url]
    const index = Math.max(0, urls.indexOf(url))
    setImage({ urls, index })
  }
  const moveImage = (direction: 1 | -1) => {
    setImage((current) => {
      if (!current?.urls.length) return current
      return {
        urls: current.urls,
        index: (current.index + direction + current.urls.length) % current.urls.length
      }
    })
  }
  useEffect(() => {
    setActiveSearchIndex(0)
  }, [normalizedQuery, detail.conversation.id])
  useEffect(() => {
    if (!matchingMessageIds.length) return
    const index = Math.min(activeSearchIndex, matchingMessageIds.length - 1)
    if (index !== activeSearchIndex) {
      setActiveSearchIndex(index)
      return
    }
    document
      .getElementById(`message-${matchingMessageIds[index]}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeSearchIndex, matchingMessageIds])
  const goToSearchResult = (direction: 1 | -1) => {
    if (!matchingMessageIds.length) return
    setActiveSearchIndex(
      (current) => (current + direction + matchingMessageIds.length) % matchingMessageIds.length
    )
  }
  useEffect(() => {
    if (!image) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeImage()
      if (event.key === 'ArrowLeft') moveImage(-1)
      if (event.key === 'ArrowRight') moveImage(1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeImage, image])
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
              id: 'pin',
              label: pinned ? 'Unpin chat' : 'Pin chat',
              icon: Pin,
              disabled: !!busy
            },
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
                () =>
                  onStateChange(
                    id === 'pin'
                      ? { pinned: !pinned }
                      : id === 'mute'
                        ? { muted: !muted }
                        : { archived: !archived }
                  ),
                id === 'pin'
                  ? pinned
                    ? 'Chat unpinned'
                    : 'Chat pinned'
                  : id === 'mute'
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
          {normalizedQuery ? (
            <div className="hidden items-center gap-1 rounded-[var(--radius-control)] border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:flex">
              <span>
                {matchingMessageIds.length
                  ? `${activeSearchIndex + 1}/${matchingMessageIds.length}`
                  : '0/0'}
              </span>
              <IconButton
                label="Previous search result"
                icon={<ChevronUp className="size-4" />}
                size="sm"
                variant="quiet"
                disabled={!matchingMessageIds.length}
                onClick={() => goToSearchResult(-1)}
              />
              <IconButton
                label="Next search result"
                icon={<ChevronDown className="size-4" />}
                size="sm"
                variant="quiet"
                disabled={!matchingMessageIds.length}
                onClick={() => goToSearchResult(1)}
              />
            </div>
          ) : null}
          <IconButton
            label="Close search"
            icon={<X className="size-4" />}
            variant="quiet"
            onClick={() => {
              setSearching(false)
              setQuery('')
              setStarredOnly(false)
              setActiveSearchIndex(0)
            }}
          />
        </div>
      )}
      {selecting && (
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-[var(--radius-surface)] border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
          <span className="mr-auto font-semibold">{selectedIds.length} selected</span>
          <IconButton
            label="Copy selected messages"
            icon={<Copy className="size-4" />}
            size="sm"
            variant="quiet"
            onClick={() => void copySelectedMessages()}
          />
          <IconButton
            label="Star selected messages"
            icon={<Star className="size-4" />}
            size="sm"
            variant="quiet"
            onClick={() => void starSelectedMessages()}
          />
          <IconButton
            label="Forward selected messages"
            icon={<Forward className="size-4" />}
            size="sm"
            variant="quiet"
            disabled={!forwardableSelectedMessages.length}
            onClick={() => setForwarding(forwardableSelectedMessages)}
          />
          <IconButton
            label="Delete selected own messages"
            icon={<Trash2 className="size-4" />}
            size="sm"
            variant="danger"
            onClick={() => void deleteSelectedMessages()}
          />
          <IconButton
            label="Cancel selection"
            icon={<X className="size-4" />}
            size="sm"
            variant="quiet"
            onClick={() => setSelectedMessages({})}
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
            if (stickToBottom.current) {
              setNewMessages(0)
              setNewMessageStartId(undefined)
            }
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
                {message.id === newMessageStartId && !query && !starredOnly ? (
                  <div className="my-3 flex items-center gap-3" role="status">
                    <span className="h-px flex-1 bg-emerald-200 dark:bg-emerald-900" />
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-[var(--color-primary)] dark:border-emerald-900 dark:bg-emerald-950/50">
                      New messages
                    </span>
                    <span className="h-px flex-1 bg-emerald-200 dark:bg-emerald-900" />
                  </div>
                ) : null}
                <article
                  id={`message-${message.id}`}
                  className={
                    'message-bubble group relative ' +
                    (own ? 'message-bubble-outgoing' : 'message-bubble-incoming') +
                    (message.id === activeSearchMessageId
                      ? ' ring-2 ring-amber-300 ring-offset-2 ring-offset-transparent'
                      : '')
                  }
                  aria-selected={!!selectedMessages[message.id]}
                  onClick={() => {
                    if (selecting && !message.deletedAt) toggleSelectedMessage(message.id)
                  }}
                  onContextMenu={(event) => {
                    if (message.deletedAt) return
                    event.preventDefault()
                    setActiveMessageMenu(message.id)
                  }}
                  onPointerDown={(event) => {
                    if (message.deletedAt || event.pointerType === 'mouse') return
                    clearLongPress()
                    longPress.current = window.setTimeout(() => {
                      if (selecting) toggleSelectedMessage(message.id)
                      else setActiveMessageMenu(message.id)
                    }, 450)
                  }}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                >
                  {selectedMessages[message.id] && (
                    <span className="absolute -left-3 -top-3 z-10 grid size-6 place-items-center rounded-full bg-[var(--color-primary)] text-white shadow-sm">
                      <Check className="size-3.5" />
                    </span>
                  )}
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
                  {!message.deletedAt && message.forwardedAt && !message.broadcastId && (
                    <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Forward className="size-3" />
                      Forwarded
                    </p>
                  )}
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
                        onClick={() => openImage(url)}
                      >
                        <CachedImage
                          path={url}
                          actorId={currentUserId}
                          alt={'Message image ' + (imageIndex + 1)}
                          onLoad={() => {
                            if (stickToBottom.current) scrollToBottom()
                          }}
                          className="max-h-72 w-full object-cover"
                        />
                      </button>
                    ))}
                  {!message.deletedAt && message.audioUrl && (
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <CachedAudio
                        path={message.audioUrl}
                        actorId={currentUserId}
                        className="h-10 w-64 max-w-full"
                      />
                      <a
                        className="button button-sm button-quiet"
                        href={broadcastMediaUrl(message.audioUrl)}
                        download={downloadName(message.audioUrl, 'voice-message.webm')}
                      >
                        <Download className="size-4" />
                        Download
                      </a>
                    </div>
                  )}
                  {!message.deletedAt && message.body.trim() ? (
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      <HighlightedMessageText text={message.body} query={query} />
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
                    onClick={() => openImage(url, item.imageUrls ?? [url])}
                  >
                    <CachedImage
                      path={url}
                      actorId={currentUserId}
                      alt={'Queued image ' + (imageIndex + 1)}
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
                      onOpen={(url) => openImage(url, [url])}
                    />
                  ))}
                {item.audioUrl ? (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <CachedAudio
                      path={item.audioUrl}
                      actorId={currentUserId}
                      className="h-10 w-64 max-w-full"
                    />
                    <a
                      className="button button-sm button-quiet"
                      href={broadcastMediaUrl(item.audioUrl)}
                      download={downloadName(item.audioUrl, 'voice-message.webm')}
                    >
                      <Download className="size-4" />
                      Download
                    </a>
                  </div>
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
        open={forwarding.length > 0}
        title="Forward message"
        description="Choose a chat to forward the selected message content."
        onClose={() => setForwarding([])}
      >
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {forwardTargetOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chat-list-item"
              disabled={!!busy}
              onClick={() =>
                void run(
                  `forward:${item.id}`,
                  async () => {
                    await onForwardMessages(item.id, forwarding)
                    setForwarding([])
                    setSelectedMessages({})
                  },
                  forwarding.length === 1 ? 'Message forwarded' : 'Messages forwarded'
                )
              }
            >
              <Avatar label={item.counterpart.name} />
              <span className="min-w-0 text-left">
                <span className="block truncate text-sm font-semibold">
                  {item.counterpart.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {item.lastMessage?.body ?? 'No messages yet'}
                </span>
              </span>
            </button>
          ))}
          {!forwardTargetOptions.length && (
            <p className="py-6 text-center text-sm text-slate-500">No other chats available.</p>
          )}
        </div>
      </Dialog>
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
      <Dialog open={!!image} title="Media viewer" onClose={closeImage}>
        {currentImage && image ? (
          <div className="space-y-3">
            <div className="relative grid min-h-[45dvh] place-items-center overflow-hidden rounded-2xl bg-slate-950/95">
              <CachedDialogImage
                path={currentImage}
                actorId={currentUserId}
                alt={`Chat media ${image.index + 1}`}
              />
              {image.urls.length > 1 ? (
                <>
                  <IconButton
                    label="Previous image"
                    icon={<ChevronLeft className="size-5" />}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-900/90"
                    onClick={() => moveImage(-1)}
                  />
                  <IconButton
                    label="Next image"
                    icon={<ChevronRight className="size-5" />}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-900/90"
                    onClick={() => moveImage(1)}
                  />
                </>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                {image.urls.length > 1
                  ? `${image.index + 1} of ${image.urls.length}`
                  : 'Image preview'}
              </span>
              <span className="flex items-center gap-2">
                <a
                  className="button button-sm button-secondary"
                  href={broadcastMediaUrl(currentImage)}
                  download={downloadName(currentImage, `chat-media-${image.index + 1}.jpg`)}
                >
                  <Download className="size-4" />
                  Download
                </a>
                <Button variant="quiet" size="sm" onClick={closeImage}>
                  Close
                </Button>
              </span>
            </div>
          </div>
        ) : null}
      </Dialog>
    </section>
  )
}
