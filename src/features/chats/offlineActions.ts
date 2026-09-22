import { ApiError } from '@shared/ApiError'
import { messagingApi } from './messagingApi'
import { offlineStore, type QueuedAction, type QueuedBroadcastImage } from './offlineStore'
import { broadcastApi, broadcastMediaUrl } from '@/features/broadcasts/broadcastApi'
import { profileApi } from '@/features/profile/profileApi'

const syncing = new Map<string, Promise<void>>()

export function notifyOfflineActions() {
  window.dispatchEvent(new Event('nexusos-actions-updated'))
}

export async function queueOfflineAction(
  actorId: string,
  kind: QueuedAction['kind'],
  payload: unknown
) {
  const action: QueuedAction = {
    id: crypto.randomUUID(),
    actorId,
    kind,
    payload,
    createdAt: new Date(),
    status: 'queued'
  }
  await offlineStore.enqueueAction(action)
  notifyOfflineActions()
  return action
}

async function uploadBroadcastImages(
  token: string,
  actorId: string,
  payload: { image_urls?: string[]; pending_images?: QueuedBroadcastImage[] }
) {
  const pending = payload.pending_images ?? []
  if (!pending.length) return payload.image_urls ?? []
  const uploaded = await broadcastApi.upload(
    token,
    pending.map((image) => new File([image.blob], image.name, { type: image.type }))
  )
  await Promise.allSettled(
    uploaded.map((url, index) => {
      const image = pending[index]
      return image
        ? offlineStore.saveMedia(actorId, broadcastMediaUrl(url), image.blob, image.type)
        : Promise.resolve()
    })
  )
  return [...(payload.image_urls ?? []), ...uploaded]
}

async function runAction(token: string, action: QueuedAction) {
  switch (action.kind) {
    case 'profile.update':
      await profileApi.update(token, action.payload as Parameters<typeof profileApi.update>[1])
      return
    case 'businessRequest.create':
      await profileApi.requestBusiness(
        token,
        action.payload as Parameters<typeof profileApi.requestBusiness>[1]
      )
      return
    case 'broadcastList.save': {
      const payload = action.payload as { id?: string; name: string; customer_ids: string[] }
      if (payload.id)
        await broadcastApi.updateList(token, payload.id, payload.name, payload.customer_ids)
      else await broadcastApi.createList(token, payload.name, payload.customer_ids)
      return
    }
    case 'broadcastList.delete':
      await broadcastApi.removeList(token, (action.payload as { id: string }).id)
      return
    case 'broadcastDraft.save': {
      const payload = action.payload as Parameters<typeof broadcastApi.saveDraft>[2] & {
        id: string
        pending_images?: QueuedBroadcastImage[]
      }
      const imageUrls = await uploadBroadcastImages(token, action.actorId, payload)
      await broadcastApi.saveDraft(token, payload.id, {
        list_id: payload.list_id,
        title: payload.title,
        body: payload.body,
        image_urls: imageUrls
      })
      return
    }
    case 'broadcastDraft.delete':
      await broadcastApi.removeDraft(token, (action.payload as { id: string }).id)
      return
    case 'broadcast.publish': {
      const payload = action.payload as Parameters<typeof broadcastApi.publish>[1] & {
        pending_images?: QueuedBroadcastImage[]
      }
      const imageUrls = await uploadBroadcastImages(token, action.actorId, payload)
      await broadcastApi.publish(token, {
        ...(payload.list_id ? { list_id: payload.list_id } : {}),
        ...(payload.list_ids ? { list_ids: payload.list_ids } : {}),
        title: payload.title,
        body: payload.body,
        image_urls: imageUrls,
        ...(payload.scheduled_for ? { scheduled_for: payload.scheduled_for } : {})
      })
      return
    }
    case 'broadcast.state': {
      const payload = action.payload as {
        id: string
        value: Parameters<typeof broadcastApi.state>[2]
      }
      await broadcastApi.state(token, payload.id, payload.value)
      return
    }
    case 'broadcast.mute': {
      const payload = action.payload as { id: string; muted: boolean }
      await broadcastApi.mute(token, payload.id, payload.muted)
      return
    }
    case 'conversation.state': {
      const payload = action.payload as {
        id: string
        value: Parameters<typeof messagingApi.state>[2]
      }
      await messagingApi.state(token, payload.id, payload.value)
      return
    }
    case 'broadcast.report': {
      const payload = action.payload as { id: string }
      await broadcastApi.state(token, payload.id, { reported: true })
      return
    }
  }
}

export function syncOfflineActions(actorId: string, token: string) {
  const current = syncing.get(actorId)
  if (current) return current
  const run = async () => {
    for (const action of await offlineStore.queuedActions(actorId)) {
      if (!navigator.onLine || localStorage.getItem('nexusos-session-token') !== token) return
      if (action.status === 'failed') continue
      try {
        await offlineStore.updateAction(action.id, { status: 'syncing', error: '' })
        notifyOfflineActions()
        await runAction(token, action)
        await offlineStore.removeAction(action.id)
        notifyOfflineActions()
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
          await offlineStore.purge(actorId)
          notifyOfflineActions()
          throw cause
        }
        if (cause instanceof ApiError && cause.status < 500 && cause.status !== 429) {
          await offlineStore.failAction(action.id, cause.message)
        } else {
          await offlineStore.updateAction(action.id, { status: 'queued' })
        }
        notifyOfflineActions()
        return
      }
    }
  }
  const promise = Promise.resolve(
    navigator.locks ? navigator.locks.request(`nexusos-actions:${actorId}`, run) : run()
  )
    .then(() => undefined)
    .finally(() => syncing.delete(actorId))
  syncing.set(actorId, promise)
  return promise
}
