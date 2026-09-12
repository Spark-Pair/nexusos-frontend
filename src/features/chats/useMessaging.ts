import { ApiError } from '@shared/ApiError'
import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import {
  messagingApi,
  type ConversationDetail,
  type ConversationSummary,
  type DirectoryProfile,
  type Message
} from './messagingApi'
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
}

function mergeMessage(messages: Message[], message: Message) {
  const exists = messages.some((item) => item.id === message.id)
  const next = exists
    ? messages.map((item) => (item.id === message.id ? { ...item, ...message } : item))
    : [...messages, message]
  return next.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

function readOwnMessages(messages: Message[], actorId: string, readAt: string) {
  const timestamp = new Date(readAt)
  return messages.map((message) =>
    message.senderId === actorId && !message.readAt ? { ...message, readAt: timestamp } : message
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
  const [counterpartTyping, setCounterpartTyping] = useState(false)
  const socketRef = useRef<Socket | undefined>(undefined)
  const selectedId = useRef<string | undefined>(undefined)
  const searchId = useRef(0)
  const alive = useRef(true)
  const setSelected = useCallback((value: ConversationDetail | undefined) => {
    selectedId.current = value?.conversation.id
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
      setConversations(cached)
      setLoading(false)
    }
    try {
      if (!navigator.onLine || !serverConfirmed)
        throw new Error('Offline: showing saved conversations.')
      const items = await messagingApi.list(token)
      if (!alive.current) return
      setConversations(items)
      setError(undefined)
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
      try {
        const cached = await offlineStore
          .read<ConversationDetail>(actorId, id)
          .catch(() => undefined)
        if (alive.current && selectedId.current === id && cached) {
          setSelectedState(cached)
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
          setSelectedState(detail)
          setConversations((items) =>
            items.map((item) =>
              item.id === id && serverConfirmed ? { ...item, unreadCount: 0 } : item
            )
          )
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
    if (navigator.onLine && serverConfirmed) await syncOutbox(actorId, token).catch(() => undefined)
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
        setConversations((items) =>
          items
            .map((item) =>
              item.id === payload.conversationId
                ? {
                    ...item,
                    updatedAt: payload.message!.createdAt,
                    lastMessage: payload.message!,
                    unreadCount:
                      payload.message!.senderId === actorId || selectedId.current === item.id
                        ? item.unreadCount
                        : item.unreadCount + 1
                  }
                : item
            )
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
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
      void refresh()
    })
    socket.on('conversation:typing', (payload: { conversationId: string; active: boolean }) => {
      if (selectedId.current === payload.conversationId) setCounterpartTyping(payload.active)
    })
    const update = () => {
      void synchronize()
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      alive.current = false
      socket.disconnect()
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [actorId, open, refresh, serverConfirmed, synchronize, token])
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
  const send = async (body: string, files: File[] = []) => {
    const id = selectedId.current
    if (!id || selected?.conversation.status !== 'accepted')
      throw new Error('Open an accepted conversation first.')
    if (files.length && (!serverConfirmed || !navigator.onLine))
      throw new Error('Connect to the internet to send images.')
    const imageUrls = files.length ? await messagingApi.upload(token, files) : []
    const item: QueuedMessage = {
      id: crypto.randomUUID(),
      actorId,
      conversationId: id,
      body,
      imageUrls,
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
      imageUrls,
      createdAt: item.createdAt,
      readAt: null,
      title: ''
    }
    setSelectedState((current) => {
      if (current?.conversation.id !== id) return current
      const next = { ...current, messages: mergeMessage(current.messages, optimistic) }
      void offlineStore
        .save(actorId, id, { ...next, messages: next.messages.slice(-200) })
        .catch(() => undefined)
      return next
    })
    setConversations((items) =>
      items
        .map((conversation) =>
          conversation.id === id
            ? { ...conversation, lastMessage: optimistic, updatedAt: optimistic.createdAt }
            : conversation
        )
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
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
  const setTyping = (active: boolean) => {
    if (selectedId.current && serverConfirmed)
      socketRef.current?.emit('conversation:typing', { conversationId: selectedId.current, active })
  }
  const setConversationState = async (state: { archived?: boolean; muted?: boolean }) => {
    if (!selectedId.current) return
    if (!serverConfirmed || !navigator.onLine)
      throw new Error('Connect to the internet to change conversation settings.')
    await messagingApi.state(token, selectedId.current, state)
    await refresh()
  }
  const reportBroadcast = async (id: string) => {
    if (!serverConfirmed || !navigator.onLine)
      throw new Error('Connect to the internet to report a broadcast.')
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
    retry,
    discard,
    counterpartTyping,
    setTyping,
    setConversationState,
    reportBroadcast
  }
}
