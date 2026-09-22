import Dexie, { type Table } from 'dexie'
import type { AuthSession } from '@/features/authentication/authApi'

interface Snapshot {
  key: string
  actorId: string
  value: unknown
  updatedAt: number
}
interface Identity {
  id: string
  value: Omit<AuthSession, 'token'>
  updatedAt: number
}
interface MediaBlobRecord {
  key: string
  actorId: string
  url: string
  blob: Blob
  contentType: string
  updatedAt: number
  size: number
}
export interface QueuedImage {
  name: string
  type: string
  blob: Blob
}
export interface QueuedAudio {
  name: string
  type: string
  blob: Blob
}
export interface StarredMessage {
  key: string
  actorId: string
  conversationId: string
  messageId: string
  createdAt: number
}
export type OfflineActionKind =
  | 'profile.update'
  | 'businessRequest.create'
  | 'broadcastList.save'
  | 'broadcastList.delete'
  | 'broadcastDraft.save'
  | 'broadcastDraft.delete'
  | 'broadcast.publish'
  | 'broadcast.state'
  | 'broadcast.mute'
  | 'conversation.state'
  | 'broadcast.report'

export interface QueuedBroadcastImage {
  name: string
  type: string
  blob: Blob
}

export interface QueuedAction {
  id: string
  actorId: string
  kind: OfflineActionKind
  payload: unknown
  createdAt: Date
  status: 'queued' | 'syncing' | 'failed'
  error?: string
}

export interface QueuedMessage {
  id: string
  actorId: string
  conversationId: string
  body: string
  imageUrls?: string[]
  images?: QueuedImage[]
  audioUrl?: string | null
  audio?: QueuedAudio | null
  replyToMessageId?: string | null
  replyToBody?: string | null
  replyToSenderId?: string | null
  createdAt: Date
  status: 'queued' | 'uploading' | 'sending' | 'failed'
  error?: string
}
class InboxDatabase extends Dexie {
  snapshots!: Table<Snapshot, string>
  identities!: Table<Identity, string>
  outbox!: Table<QueuedMessage, string>
  starred!: Table<StarredMessage, string>
  actions!: Table<QueuedAction, string>
  media!: Table<MediaBlobRecord, string>
  constructor() {
    super('nexusos-inbox-v1')
    this.version(1).stores({
      snapshots: 'key,actorId',
      identities: 'id',
      outbox: 'id,actorId,[actorId+conversationId]'
    })
    this.version(2).stores({
      snapshots: 'key,actorId',
      identities: 'id',
      outbox: 'id,actorId,[actorId+conversationId]',
      starred: 'key,actorId,[actorId+conversationId]'
    })
    this.version(3).stores({
      snapshots: 'key,actorId',
      identities: 'id',
      outbox: 'id,actorId,[actorId+conversationId]',
      starred: 'key,actorId,[actorId+conversationId]',
      actions: 'id,actorId,kind,status,createdAt'
    })
    this.version(4).stores({
      snapshots: 'key,actorId',
      identities: 'id',
      outbox: 'id,actorId,[actorId+conversationId]',
      starred: 'key,actorId,[actorId+conversationId]',
      actions: 'id,actorId,kind,status,createdAt',
      media: 'key,actorId,url,updatedAt'
    })
  }
}
const db = new InboxDatabase()
const retentionMs = 7 * 24 * 60 * 60 * 1000
export const offlineStore = {
  async remember(session: AuthSession) {
    const value = { data: session.data, requires_phone: session.requires_phone }
    await db.identities.put({ id: session.data.id, value, updatedAt: Date.now() })
    await db.snapshots.filter((row) => row.updatedAt < Date.now() - retentionMs).delete()
  },
  async identity(id: string) {
    const item = await db.identities.get(id)
    if (item && Date.now() - item.updatedAt >= retentionMs) {
      await db.identities.delete(id)
      return undefined
    }
    return item?.value
  },
  async save(actorId: string, key: string, value: unknown) {
    await db.transaction('rw', db.snapshots, async () => {
      await db.snapshots.put({ key: `${actorId}:${key}`, actorId, value, updatedAt: Date.now() })
      const rows = await db.snapshots.where('actorId').equals(actorId).sortBy('updatedAt')
      if (rows.length > 51)
        await db.snapshots.bulkDelete(rows.slice(0, rows.length - 51).map((row) => row.key))
    })
  },
  async read<T>(actorId: string, key: string): Promise<T | undefined> {
    const row = await db.snapshots.get(`${actorId}:${key}`)
    if (row && Date.now() - row.updatedAt >= retentionMs) {
      await db.snapshots.delete(row.key)
      return undefined
    }
    // This store is owned by typed callers; network payloads are validated before insertion.
    return row && Date.now() - row.updatedAt < retentionMs ? (row.value as T) : undefined
  },
  async enqueue(value: QueuedMessage) {
    await db.outbox.put(value)
  },
  async queued(actorId: string) {
    return db.outbox.where('actorId').equals(actorId).sortBy('createdAt')
  },
  async update(id: string, value: Partial<QueuedMessage>) {
    await db.outbox.update(id, value)
  },
  async fail(id: string, error: string) {
    await db.outbox.update(id, { status: 'failed', error })
  },
  async remove(id: string) {
    await db.outbox.delete(id)
  },
  async enqueueAction(value: QueuedAction) {
    await db.actions.put(value)
  },
  async queuedActions(actorId: string) {
    return db.actions.where('actorId').equals(actorId).sortBy('createdAt')
  },
  async updateAction(id: string, value: Partial<QueuedAction>) {
    await db.actions.update(id, value)
  },
  async failAction(id: string, error: string) {
    await db.actions.update(id, { status: 'failed', error })
  },
  async removeAction(id: string) {
    await db.actions.delete(id)
  },
  async saveMedia(actorId: string, url: string, blob: Blob, contentType = blob.type) {
    const key = `${actorId}:${url}`
    await db.media.put({
      key,
      actorId,
      url,
      blob,
      contentType: contentType || 'application/octet-stream',
      size: blob.size,
      updatedAt: Date.now()
    })
    const rows = await db.media.where('actorId').equals(actorId).sortBy('updatedAt')
    let total = rows.reduce((sum, row) => sum + row.size, 0)
    const maxBytes = 300 * 1024 * 1024
    const toDelete: string[] = []
    for (const row of rows) {
      if (total <= maxBytes) break
      toDelete.push(row.key)
      total -= row.size
    }
    if (toDelete.length) await db.media.bulkDelete(toDelete)
  },
  async media(actorId: string, url: string) {
    const row = await db.media.get(`${actorId}:${url}`)
    if (!row) return undefined
    if (Date.now() - row.updatedAt >= retentionMs) {
      await db.media.delete(row.key)
      return undefined
    }
    return row
  },
  async starred(actorId: string, conversationId: string) {
    return db.starred.where('[actorId+conversationId]').equals([actorId, conversationId]).toArray()
  },
  async toggleStar(actorId: string, conversationId: string, messageId: string) {
    const key = `${actorId}:${conversationId}:${messageId}`
    const existing = await db.starred.get(key)
    if (existing) {
      await db.starred.delete(key)
      return false
    }
    await db.starred.put({ key, actorId, conversationId, messageId, createdAt: Date.now() })
    return true
  },
  async purge(actorId: string) {
    await db.transaction(
      'rw',
      [db.snapshots, db.identities, db.outbox, db.starred, db.actions, db.media],
      async () => {
        await db.snapshots.where('actorId').equals(actorId).delete()
        await db.identities.delete(actorId)
        await db.outbox.where('actorId').equals(actorId).delete()
        await db.starred.where('actorId').equals(actorId).delete()
        await db.actions.where('actorId').equals(actorId).delete()
        await db.media.where('actorId').equals(actorId).delete()
      }
    )
  }
}
