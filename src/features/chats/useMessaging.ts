import { ApiError } from '@shared/ApiError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { compressImages } from './media/imageCompression'
import {
  cacheMediaUrls,
  conversationMediaUrls,
  detailMediaUrls,
  messageMediaUrls
} from './mediaCache'
import {
  messagingApi,
  type ConversationDetail,
  type ConversationSummary,
  type DirectoryProfile,
  type Message
} from './messagingApi'
import { queueOfflineAction, syncOfflineActions } from './offlineActions'
import { offlineStore, type QueuedMessage } from './offlineStore'
import { syncOutbox } from './outbox'
import { broadcastApi } from '@/features/broadcasts/broadcastApi'

const socketUrl = (import.meta.env.VITE_SOCKET_URL as string | undefined)?.replace(/\/$/u, '')

interface ConversationUpdatedPayload {
  conversationId?: string
  title?: string
  body?: string
  url?: string
  message?: Message
  readBy?: string
  readAt?: string
  deliveredBy?: string
  deliveredAt?: string
}

function asDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

function normalizeMessage(message: Message): Message {
  return {
    ...message,
    createdAt: asDate(message.createdAt),
    deliveredAt: message.deliveredAt ? asDate(message.deliveredAt) : null,
    readAt: message.readAt ? asDate(message.readAt) : null,
    editedAt: message.editedAt ? asDate(message.editedAt) : null,
    deletedAt: message.deletedAt ? asDate(message.deletedAt) : null,
    forwardedAt: message.forwardedAt ? asDate(message.forwardedAt) : null,
    replyToMessageId: message.replyToMessageId ?? null,
    replyToBody: message.replyToBody ?? null,
    replyToSenderId: message.replyToSenderId ?? null,
    audioUrl: message.audioUrl ?? null,
    reactions: message.reactions ?? {},
    localStatus: message.localStatus
  }
}

function normalizeSummary(summary: ConversationSummary): ConversationSummary {
  return {
    ...summary,
    createdAt: asDate(summary.createdAt),
    updatedAt: asDate(summary.updatedAt),
    lastMessage: summary.lastMessage ? normalizeMessage(summary.lastMessage) : null
  }
}

function normalizeDetail(detail: ConversationDetail): ConversationDetail {
  return {
    ...detail,
    conversation: {
      ...detail.conversation,
      createdAt: asDate(detail.conversation.createdAt),
      updatedAt: asDate(detail.conversation.updatedAt)
    },
    messages: detail.messages.map(normalizeMessage)
  }
}

function sortConversations(items: ConversationSummary[]) {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return asDate(b.updatedAt).getTime() - asDate(a.updatedAt).getTime()
  })
}
function mergeMessage(messages: Message[], message: Message) {
  const normalized = normalizeMessage(message)
  const exists = messages.some((item) => item.id === normalized.id)
  const next = exists
    ? messages.map((item) => (item.id === normalized.id ? { ...item, ...normalized } : item))
    : [...messages, normalized]
  return next.sort((a, b) => asDate(a.createdAt).getTime() - asDate(b.createdAt).getTime())
}

function readOwnMessages(messages: Message[], actorId: string, readAt: string) {
  const timestamp = new Date(readAt)
  return messages.map((message) =>
    message.senderId === actorId && !message.readAt ? { ...message, readAt: timestamp } : message
  )
}

function deliverOwnMessages(messages: Message[], actorId: string, deliveredAt: string) {
  const timestamp = new Date(deliveredAt)
  return messages.map((message) =>
    message.senderId === actorId && !message.deliveredAt
      ? { ...message, deliveredAt: timestamp }
      : message
  )
}

function showRealtimeNotification(payload: ConversationUpdatedPayload) {
  if (
    typeof Notification === 'undefined' ||
    Notification.permission !== 'granted' ||
    document.visibilityState === 'visible' ||
    !payload.title
  )
    return
  const options: NotificationOptions = {
    icon: '/icons/nexusos.svg',
    badge: '/icons/nexusos.svg'
  }
  if (payload.body) options.body = payload.body
  const tag = payload.url ?? payload.conversationId
  if (tag) options.tag = tag
  const notification = new Notification(payload.title, options)
  notification.onclick = () => {
    window.focus()
    if (payload.url) window.location.href = payload.url
    notification.close()
  }
}

export function useMessaging(token: string, actorId: string, serverConfirmed: boolean) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selected, setSelectedState] = useState<ConversationDetail>()
  const [directory, setDirectory] = useState<DirectoryProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState<string>()
  const [queued, setQueued] = useState<QueuedMessage[]>([])
  const [starred, setStarred] = useState<Record<string, true>>({})
  const [counterpartTyping, setCounterpartTyping] = useState(false)
  const socketRef = useRef<Socket | undefined>(undefined)
  const selectedId = useRef<string | undefined>(undefined)
  const searchId = useRef(0)
  const alive = useRef(true)
  const setSelected = useCallback((value: ConversationDetail | undefined) => {
    selectedId.current = value?.conversation.id
    if (!value) setStarred({})
    setSelectedState(value)
  }, [])
  const loadQueue = useCallback(async () => {
    const items = await offlineStore.queued(actorId).catch(() => [])
    if (alive.current) setQueued(items)
  }, [actorId])
  const refresh = useCallback(async () => {
    const cached = await offlineStore
      .read<ConversationSummary[]>(actorId, 'conversations')
      .catch(() => undefined)
    if (alive.current && cached?.length) {
      setConversations(sortConversations(cached.map(normalizeSummary)))
      setLoading(false)
    }
    try {
      if (!navigator.onLine || !serverConfirmed)
        throw new Error('Offline: showing saved conversations.')
      const items = await messagingApi.list(token)
      if (!alive.current) return
      const normalized = items.map(normalizeSummary)
      setConversations(sortConversations(normalized))
      setError(undefined)
      void cacheMediaUrls(conversationMediaUrls(normalized), actorId)
      await offlineStore.save(actorId, 'conversations', items.slice(0, 500)).catch(() => undefined)
    } catch (cause) {
      if (!alive.current) return
      if (cause instanceof ApiError && [401, 403].includes(cause.status)) {
        setConversations([])
        setSelected(undefined)
        await offlineStore.purge(actorId)
        return
      }
      if (!cached?.length)
        setError(cause instanceof Error ? cause.message : 'Unable to load chats.')
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [actorId, serverConfirmed, token, setSelected])
  const open = useCallback(
    async (id: string) => {
      selectedId.current = id
      setOpening(true)
      setCounterpartTyping(false)
      const savedStars = await offlineStore.starred(actorId, id).catch(() => [])
      if (alive.current && selectedId.current === id)
        setStarred(Object.fromEntries(savedStars.map((item) => [item.messageId, true])))
      try {
        const cached = await offlineStore
          .read<ConversationDetail>(actorId, id)
          .catch(() => undefined)
        if (alive.current && selectedId.current === id && cached) {
          setSelectedState(normalizeDetail(cached))
          setOpening(false)
        }
        let detail = cached
        if (navigator.onLine && serverConfirmed) {
          try {
            detail = await messagingApi.detail(token, id)
          } catch (cause) {
            if (cause instanceof ApiError) {
              if ([403, 404].includes(cause.status)) await offlineStore.save(actorId, id, undefined)
              throw cause
            }
          }
        }
        if (!detail)
          throw new Error(
            'This conversation is not saved on this device. Connect to the internet to open it.'
          )
        if (alive.current && selectedId.current === id) {
          const normalized = normalizeDetail(detail)
          setSelectedState(normalized)
          setConversations((items) =>
            items.map((item) =>
              item.id === id && serverConfirmed ? { ...item, unreadCount: 0 } : item
            )
          )
          void cacheMediaUrls(detailMediaUrls(normalized), actorId)
          await offlineStore
            .save(actorId, id, { ...detail, messages: detail.messages.slice(-200) })
            .catch(() => undefined)
        }
        return detail
      } catch (cause) {
        if (alive.current && selectedId.current === id) {
          setSelectedState(undefined)
          setError(cause instanceof Error ? cause.message : 'Unable to open conversation.')
        }
        throw cause
      } finally {
        if (alive.current && selectedId.current === id) setOpening(false)
      }
    },
    [actorId, serverConfirmed, token]
  )
  const synchronize = useCallback(async () => {
    if (navigator.onLine && serverConfirmed) {
      await syncOutbox(actorId, token).catch(() => undefined)
      await syncOfflineActions(actorId, token).catch(() => undefined)
    }
    await loadQueue()
    await refresh()
    if (selectedId.current) await open(selectedId.current).catch(() => undefined)
  }, [actorId, token, serverConfirmed, loadQueue, refresh, open])
  useEffect(() => {
    alive.current = true
    void synchronize()
    const socket = io(socketUrl ?? undefined, {
      path: '/socket.io',
      auth: { token },
      autoConnect: serverConfirmed
    })
    socketRef.current = socket
    socket.on('connect', () => {
      void synchronize()
    })
    socket.io.on('reconnect', () => {
      void synchronize()
    })
    socket.on('conversation:updated', (payload: ConversationUpdatedPayload) => {
      showRealtimeNotification(payload)
      if (!payload.conversationId) return
      if (payload.message) {
        void cacheMediaUrls(messageMediaUrls(payload.message), actorId)
        setConversations((items) =>
          sortConversations(
            items.map((item) =>
              item.id === payload.conversationId
                ? {
                    ...item,
                    updatedAt: asDate(payload.message!.createdAt),
                    lastMessage: normalizeMessage(payload.message!),
                    unreadCount:
                      payload.message!.senderId === actorId || selectedId.current === item.id
                        ? item.unreadCount
                        : item.unreadCount + 1
                  }
                : item
            )
          )
        )
        setSelectedState((current) => {
          if (!current || current.conversation.id !== payload.conversationId) return current
          const next = { ...current, messages: mergeMessage(current.messages, payload.message!) }
          void offlineStore
            .save(actorId, current.conversation.id, {
              ...next,
              messages: next.messages.slice(-200)
            })
            .catch(() => undefined)
          return next
        })
        return
      }
      if (payload.readBy && payload.readBy !== actorId && payload.readAt) {
        setSelectedState((current) => {
          if (!current || current.conversation.id !== payload.conversationId) return current
          const next = {
            ...current,
            messages: readOwnMessages(current.messages, actorId, payload.readAt!)
          }
          void offlineStore
            .save(actorId, current.conversation.id, {
              ...next,
              messages: next.messages.slice(-200)
            })
            .catch(() => undefined)
          return next
        })
        return
      }
      if (payload.deliveredBy && payload.deliveredBy !== actorId && payload.deliveredAt) {
        setSelectedState((current) => {
          if (!current || current.conversation.id !== payload.conversationId) return current
          const next = {
            ...current,
            messages: deliverOwnMessages(current.messages, actorId, payload.deliveredAt!)
          }
          void offlineStore
            .save(actorId, current.conversation.id, {
              ...next,
              messages: next.messages.slice(-200)
            })
            .catch(() => undefined)
          return next
        })
        return
      }
      void refresh()
    })
    socket.on('conversation:typing', (payload: { conversationId: string; active: boolean }) => {
      if (selectedId.current === payload.conversationId) setCounterpartTyping(payload.active)
    })
    const update = () => {
      void synchronize()
    }
    const updateOutbox = () => {
      void loadQueue()
      void offlineStore
        .queued(actorId)
        .then((items) => {
          const statuses = new Map(items.map((item) => [item.id, item.status]))
          setSelectedState((latest) =>
            latest
              ? {
                  ...latest,
                  messages: latest.messages.map((message) =>
                    statuses.has(message.id)
                      ? { ...message, localStatus: statuses.get(message.id) }
                      : message.localStatus
                        ? { ...message, localStatus: undefined }
                        : message
                  )
                }
              : latest
          )
        })
        .catch(() => undefined)
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    window.addEventListener('nexusos-outbox-updated', updateOutbox)
    return () => {
      alive.current = false
      socket.disconnect()
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      window.removeEventListener('nexusos-outbox-updated', updateOutbox)
    }
  }, [actorId, loadQueue, open, refresh, serverConfirmed, synchronize, token])
  const search = async (query: string) => {
    const version = ++searchId.current
    const result = await messagingApi.search(token, query)
    if (version === searchId.current) setDirectory(result)
  }
  const invite = async (counterpartId: string, body: string) => {
    await messagingApi.invite(token, counterpartId, body)
    await refresh()
  }
  const respond = async (decision: 'accepted' | 'rejected') => {
    if (!selectedId.current) return
    await messagingApi.respond(token, selectedId.current, decision)
    await synchronize()
  }
  const send = async (
    body: string,
    files: File[] = [],
    audio?: File | null,
    replyTo?: Message | null
  ) => {
    const id = selectedId.current
    if (!id || selected?.conversation.status !== 'accepted')
      throw new Error('Open an accepted conversation first.')
    const compressedFiles = files.length ? await compressImages(files) : []
    const localImageUrls = compressedFiles.map((file) => URL.createObjectURL(file))
    const localAudioUrl = audio ? URL.createObjectURL(audio) : null
    const item: QueuedMessage = {
      id: crypto.randomUUID(),
      actorId,
      conversationId: id,
      body,
      imageUrls: [],
      images: compressedFiles.map((file) => ({ name: file.name, type: file.type, blob: file })),
      audioUrl: null,
      audio: audio ? { name: audio.name, type: audio.type, blob: audio } : null,
      replyToMessageId: replyTo?.id ?? null,
      replyToBody: replyTo?.body ?? null,
      replyToSenderId: replyTo?.senderId ?? null,
      createdAt: new Date(),
      status: 'queued'
    }
    try {
      await offlineStore.enqueue(item)
    } catch {
      throw new Error(
        'Message was not saved. Device storage is unavailable. Keep your text and try again.'
      )
    }
    const optimistic: Message = {
      id: item.id,
      conversationId: id,
      senderId: actorId,
      body,
      imageUrls: localImageUrls,
      audioUrl: localAudioUrl,
      replyToMessageId: replyTo?.id ?? null,
      replyToBody: replyTo?.body ?? null,
      replyToSenderId: replyTo?.senderId ?? null,
      createdAt: item.createdAt,
      deliveredAt: null,
      readAt: null,
      editedAt: null,
      deletedAt: null,
      title: '',
      reactions: {},
      localStatus: serverConfirmed && navigator.onLine ? 'sending' : 'queued'
    }
    setSelectedState((current) => {
      if (current?.conversation.id !== id) return current
      const next = { ...current, messages: mergeMessage(current.messages, optimistic) }
      if (!localImageUrls.length && !localAudioUrl)
        void offlineStore
          .save(actorId, id, { ...next, messages: next.messages.slice(-200) })
          .catch(() => undefined)
      return next
    })
    setConversations((items) =>
      sortConversations(
        items.map((conversation) =>
          conversation.id === id
            ? { ...conversation, lastMessage: optimistic, updatedAt: optimistic.createdAt }
            : conversation
        )
      )
    )
    if (serverConfirmed && navigator.onLine) void syncOutbox(actorId, token).then(loadQueue)
    const pending = await offlineStore.queued(actorId)
    setQueued(pending)
    return pending.find((message) => message.id === item.id)?.status ?? 'sent'
  }
  const retry = async (item: QueuedMessage) => {
    await offlineStore.enqueue({ ...item, status: 'queued', error: '' })
    await synchronize()
  }
  const discard = async (id: string) => {
    await offlineStore.remove(id)
    await loadQueue()
  }
  const toggleStar = async (messageId: string) => {
    const conversationId = selectedId.current
    if (!conversationId) return
    const enabled = await offlineStore.toggleStar(actorId, conversationId, messageId)
    setStarred((current) => {
      const next = { ...current }
      if (enabled) next[messageId] = true
      else delete next[messageId]
      return next
    })
  }
  const setTyping = (active: boolean) => {
    if (selectedId.current && serverConfirmed)
      socketRef.current?.emit('conversation:typing', { conversationId: selectedId.current, active })
  }
  const react = async (messageId: string, emoji: string | null) => {
    const conversationId = selectedId.current
    if (!conversationId) return
    setSelectedState((current) => {
      if (current?.conversation.id !== conversationId) return current
      const next = {
        ...current,
        messages: current.messages.map((message) => {
          if (message.id !== messageId) return message
          const reactions = { ...(message.reactions ?? {}) }
          for (const [key, users] of Object.entries(reactions)) {
            const nextUsers = users.filter((id) => id !== actorId)
            if (nextUsers.length) reactions[key] = nextUsers
            else delete reactions[key]
          }
          if (emoji) reactions[emoji] = [...new Set([...(reactions[emoji] ?? []), actorId])]
          return { ...message, reactions }
        })
      }
      void offlineStore
        .save(actorId, conversationId, { ...next, messages: next.messages.slice(-200) })
        .catch(() => undefined)
      return next
    })
    const message = await messagingApi.react(token, conversationId, messageId, emoji)
    setSelectedState((current) =>
      current?.conversation.id === conversationId
        ? { ...current, messages: mergeMessage(current.messages, message) }
        : current
    )
  }
  const editMessage = async (messageId: string, body: string) => {
    const conversationId = selectedId.current
    if (!conversationId) return
    const message = await messagingApi.edit(token, conversationId, messageId, body)
    setSelectedState((current) =>
      current?.conversation.id === conversationId
        ? { ...current, messages: mergeMessage(current.messages, message) }
        : current
    )
  }
  const forwardMessages = async (targetConversationId: string, messages: Message[]) => {
    if (!serverConfirmed || !navigator.onLine)
      throw new Error('Connect to the internet to forward messages.')
    for (const message of messages) {
      if (message.deletedAt) continue
      await messagingApi.send(
        token,
        targetConversationId,
        message.body,
        undefined,
        message.imageUrls,
        message.audioUrl ?? null,
        null,
        true
      )
    }
    await refresh()
    if (selectedId.current === targetConversationId)
      await open(targetConversationId).catch(() => undefined)
  }
  const deleteMessage = async (messageId: string) => {
    const conversationId = selectedId.current
    if (!conversationId) return
    const message = await messagingApi.delete(token, conversationId, messageId)
    setSelectedState((current) =>
      current?.conversation.id === conversationId
        ? { ...current, messages: mergeMessage(current.messages, message) }
        : current
    )
  }
  const setConversationStateFor = async (
    conversationId: string,
    state: { archived?: boolean; muted?: boolean; pinned?: boolean }
  ) => {
    if (!serverConfirmed || !navigator.onLine) {
      setConversations((items) =>
        sortConversations(
          items.map((conversation) =>
            conversation.id === conversationId ? { ...conversation, ...state } : conversation
          )
        )
      )
      await queueOfflineAction(actorId, 'conversation.state', { id: conversationId, value: state })
      return
    }
    await messagingApi.state(token, conversationId, state)
    await refresh()
  }
  const setConversationState = async (state: {
    archived?: boolean
    muted?: boolean
    pinned?: boolean
  }) => {
    if (!selectedId.current) return
    await setConversationStateFor(selectedId.current, state)
  }
  const reportBroadcast = async (id: string) => {
    if (!serverConfirmed || !navigator.onLine) {
      await queueOfflineAction(actorId, 'broadcast.report', { id })
      return
    }
    await broadcastApi.state(token, id, { reported: true })
  }
  return {
    conversations,
    selected,
    setSelected,
    directory,
    loading,
    opening,
    error,
    refresh: synchronize,
    open,
    search,
    invite,
    respond,
    send,
    queued,
    starred,
    toggleStar,
    retry,
    discard,
    react,
    editMessage,
    deleteMessage,
    forwardMessages,
    counterpartTyping,
    setTyping,
    setConversationState,
    setConversationStateFor,
    reportBroadcast
  }
}
