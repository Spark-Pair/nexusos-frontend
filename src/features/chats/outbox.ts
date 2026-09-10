import { ApiError } from '@shared/ApiError'
import { messagingApi } from './messagingApi'
import { offlineStore } from './offlineStore'

const syncing = new Map<string, Promise<void>>()
export function syncOutbox(actorId: string, token: string) {
  const current = syncing.get(actorId)
  if (current) return current
  const run = async () => {
    for (const item of await offlineStore.queued(actorId)) {
      if (!navigator.onLine || sessionStorage.getItem('nexusos-session-token') !== token) return
      if (item.status === 'failed') continue
      try {
        await messagingApi.send(token, item.conversationId, item.body, item.id)
        await offlineStore.remove(item.id)
      } catch (cause) {
        if (cause instanceof ApiError) {
          if (cause.status === 401) {
            await offlineStore.purge(actorId)
            throw cause
          }
          if (cause.status < 500 && cause.status !== 429)
            await offlineStore.fail(item.id, cause.message)
        }
        // Preserve ordering and avoid retry storms while disconnected or rate limited.
        return
      }
    }
  }
  const promise = Promise.resolve(
    navigator.locks ? navigator.locks.request(`nexusos-outbox:${actorId}`, run) : run()
  )
    .then(() => undefined)
    .finally(() => syncing.delete(actorId))
  syncing.set(actorId, promise)
  return promise
}
