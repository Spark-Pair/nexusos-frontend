import type { ConversationDetail, ConversationSummary, Message } from './messagingApi'
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

export async function cacheMediaUrls(paths: string[]) {
  if (!paths.length || typeof caches === 'undefined') return
  const uniqueUrls = [...new Set(paths)].map(broadcastMediaUrl)
  const cache = await caches.open(mediaCacheName)
  await Promise.allSettled(
    uniqueUrls.map(async (url) => {
      const request = new Request(url, { mode: 'cors' })
      if (await cache.match(request)) return
      const response = await fetch(request)
      if (response.ok) await cache.put(request, response)
    })
  )
}
