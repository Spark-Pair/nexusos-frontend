import { ApiError } from '@shared/ApiError'
import { messagingApi } from './messagingApi'
import { offlineStore, type QueuedMessage } from './offlineStore'
import { broadcastMediaUrl } from '@/features/broadcasts/broadcastApi'

const syncing = new Map<string, Promise<void>>()

function notifyOutbox() {
  window.dispatchEvent(new Event('nexusos-outbox-updated'))
}

async function updateItem(id: string, value: Partial<QueuedMessage>) {
  await offlineStore.update(id, value)
  notifyOutbox()
}

export function syncOutbox(actorId: string, token: string) {
  const current = syncing.get(actorId)
  if (current) return current
  const run = async () => {
    for (const item of await offlineStore.queued(actorId)) {
      if (!navigator.onLine || localStorage.getItem('nexusos-session-token') !== token) return
      if (item.status === 'failed') continue
      try {
        let imageUrls = item.imageUrls ?? []
        let audioUrl = item.audioUrl ?? null
        if (!imageUrls.length && item.images?.length) {
          await updateItem(item.id, { status: 'uploading', error: '' })
          imageUrls = await messagingApi.upload(
            token,
            item.images.map((image) => new File([image.blob], image.name, { type: image.type }))
          )
          await Promise.allSettled(
            imageUrls.map((url, index) => {
              const image = item.images?.[index]
              return image
                ? offlineStore.saveMedia(
                    item.actorId,
                    broadcastMediaUrl(url),
                    image.blob,
                    image.type
                  )
                : Promise.resolve()
            })
          )
          await updateItem(item.id, { imageUrls, status: 'sending' })
        } else if (!audioUrl && item.audio) {
          await updateItem(item.id, { status: 'uploading', error: '' })
          audioUrl = await messagingApi.uploadAudio(
            token,
            new File([item.audio.blob], item.audio.name, { type: item.audio.type })
          )
          if (item.audio)
            await offlineStore
              .saveMedia(
                item.actorId,
                broadcastMediaUrl(audioUrl),
                item.audio.blob,
                item.audio.type
              )
              .catch(() => undefined)
          await updateItem(item.id, { audioUrl, status: 'sending' })
        } else {
          await updateItem(item.id, { status: 'sending', error: '' })
        }
        await messagingApi.send(
          token,
          item.conversationId,
          item.body,
          item.id,
          imageUrls,
          audioUrl,
          item.replyToMessageId
        )
        await offlineStore.remove(item.id)
        notifyOutbox()
      } catch (cause) {
        if (cause instanceof ApiError) {
          if (cause.status === 401) {
            await offlineStore.purge(actorId)
            notifyOutbox()
            throw cause
          }
          if (cause.status < 500 && cause.status !== 429) {
            await offlineStore.fail(item.id, cause.message)
            notifyOutbox()
          } else {
            await updateItem(item.id, { status: 'queued' })
          }
        } else {
          await updateItem(item.id, { status: 'queued' })
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
