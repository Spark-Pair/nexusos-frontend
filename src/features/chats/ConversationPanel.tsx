import { ActionMenu } from '@shared/components/ActionMenu'
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
  Info,
  Megaphone,
  Search,
  Volume2,
  VolumeX,
  X,
  ArrowDown
} from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import type { ConversationDetail } from './messagingApi'
import type { QueuedMessage } from './offlineStore'
import { broadcastMediaUrl } from '@/features/broadcasts/broadcastApi'

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
  offline,
  onReportBroadcast
}: {
  detail: ConversationDetail
  currentUserId: string
  onBack: () => void
  onRespond: (decision: 'accepted' | 'rejected') => Promise<void>
  onSend: (body: string, files?: File[]) => Promise<'queued' | 'failed' | 'sent'>
  counterpartTyping: boolean
  onTyping: (active: boolean) => void
  archived: boolean
  muted: boolean
  onStateChange: (state: { archived?: boolean; muted?: boolean }) => Promise<void>
  queued: QueuedMessage[]
  onRetry: (item: QueuedMessage) => Promise<void>
  onDiscard: (id: string) => Promise<void>
  offline: boolean
  onReportBroadcast: (id: string) => Promise<void>
}) {
  const toast = useToast()
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [info, setInfo] = useState(false)
  const [image, setImage] = useState<string>()
  const [report, setReport] = useState<string>()
  const [reported, setReported] = useState<string[]>([])
  const [busy, setBusy] = useState('')
  const [scrolledUp, setScrolledUp] = useState(false)
  const pending = useRef(false)
  const scroll = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const closeInfo = useCallback(() => setInfo(false), [])
  const closeImage = useCallback(() => setImage(undefined), [])
  const closeReport = useCallback(() => {
    if (!pending.current) setReport(undefined)
  }, [])
  const latest = detail.messages.at(-1)?.id
  useEffect(() => {
    if (stickToBottom.current && scroll.current)
      scroll.current.scrollTop = scroll.current.scrollHeight
  }, [latest, queued.length, searching])
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
  const pendingForCustomer =
    detail.conversation.status === 'pending' &&
    detail.conversation.customerId === currentUserId &&
    detail.conversation.invitedBy !== currentUserId
  const visible = detail.messages.filter((message) =>
    (message.title + ' ' + message.body).toLowerCase().includes(query.toLowerCase())
  )
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
          <IconButton
            label="Close search"
            icon={<X className="size-4" />}
            variant="quiet"
            onClick={() => {
              setSearching(false)
              setQuery('')
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
          }
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          {!visible.length && (
            <p className="py-10 text-center text-sm text-slate-500">
              {query
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
                  className={
                    'message-bubble ' +
                    (own ? 'message-bubble-outgoing' : 'message-bubble-incoming')
                  }
                >
                  {message.broadcastId && (
                    <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                      <Megaphone className="size-3" />
                      Broadcast
                    </p>
                  )}
                  {message.title && <h2 className="mb-1 text-sm font-semibold">{message.title}</h2>}
                  {message.imageUrls.map((url, imageIndex) => (
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
                        className="max-h-72 w-full object-cover"
                      />
                    </button>
                  ))}
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {message.body}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500 dark:text-slate-400">
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
                      (message.readAt ? (
                        <CheckCheck className="size-3.5 text-blue-600" aria-label="Read" />
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
                      className="max-h-72 w-full object-cover"
                    />
                  </button>
                ))}
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
                  <Clock3 className="size-3" />
                  {item.status === 'failed' ? 'Not sent' : 'Queued on this device'}
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
          <IconButton
            label="Jump to latest message"
            icon={<ArrowDown className="size-5" />}
            onClick={() => {
              if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight
            }}
          />
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
            <MessageComposer
              onSubmit={async (body, files) => {
                stickToBottom.current = true
                try {
                  const result = await onSend(body, files)
                  if (result === 'queued')
                    toast({
                      title: 'Message queued',
                      description: 'It will send after reconnecting.',
                      tone: 'info'
                    })
                  else if (result === 'failed')
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
