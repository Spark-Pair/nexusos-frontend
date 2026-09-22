import { useEffect, useState } from 'react'
import type { ConversationDetail, ConversationSummary, Message } from './messagingApi'
import { offlineStore } from './offlineStore'
import { broadcastMediaUrl } from '@/features/broadcasts/broadcastApi'

const mediaCacheName = 'nexusos-media-v1'

export function messageMediaUrls(message: Pick<Message, 'imageUrls' | 'audioUrl'> | null) {
  if (!message) return []
  return [...message.imageUrls, ...(message.audioUrl ? [message.audioUrl] : [])]
}

export function conversationMediaUrls(items: ConversationSummary[]) {
  return items.flatMap((item) => messageMediaUrls(item.lastMessage))
}

export function detailMediaUrls(detail: ConversationDetail) {
  return detail.messages.flatMap(messageMediaUrls)
}

export async function cacheMediaUrls(paths: string[], actorId?: string) {
  if (!paths.length) return
  const uniqueUrls = [...new Set(paths)].map(broadcastMediaUrl)
  const cache = typeof caches === 'undefined' ? undefined : await caches.open(mediaCacheName)
  await Promise.allSettled(
    uniqueUrls.map(async (url) => {
      const request = new Request(url, { mode: 'cors', credentials: 'omit' })
      const cached = cache ? await cache.match(request) : undefined
      if (cached) {
        if (actorId) {
          const blob = await cached
            .clone()
            .blob()
            .catch(() => undefined)
          if (blob?.size)
            await offlineStore.saveMedia(actorId, url, blob, blob.type).catch(() => undefined)
        }
        return
      }
      const response = await fetch(request)
      if (!response.ok) return
      if (cache) await cache.put(request, response.clone())
      if (actorId) {
        const blob = await response
          .clone()
          .blob()
          .catch(() => undefined)
        if (blob?.size)
          await offlineStore.saveMedia(actorId, url, blob, blob.type).catch(() => undefined)
      }
    })
  )
}

const objectUrls = new Map<string, string>()

export async function resolveCachedMediaUrl(actorId: string | undefined, path: string) {
  const url = broadcastMediaUrl(path)
  if (!actorId) return url
  if (navigator.onLine) return url
  const existing = objectUrls.get(`${actorId}:${url}`)
  if (existing) return existing
  const stored = await offlineStore.media(actorId, url).catch(() => undefined)
  if (!stored) return url
  const objectUrl = URL.createObjectURL(stored.blob)
  objectUrls.set(`${actorId}:${url}`, objectUrl)
  return objectUrl
}

export function useMediaUrl(path: string | null | undefined, actorId?: string) {
  const [url, setUrl] = useState(() => (path ? broadcastMediaUrl(path) : ''))
  useEffect(() => {
    let active = true
    if (!path) {
      setUrl('')
      return () => {
        active = false
      }
    }
    setUrl(broadcastMediaUrl(path))
    void resolveCachedMediaUrl(actorId, path).then((next) => {
      if (active) setUrl(next)
    })
    return () => {
      active = false
    }
  }, [actorId, path])
  return url
}
