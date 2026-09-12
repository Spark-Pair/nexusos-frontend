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
export interface QueuedMessage {
  id: string
  actorId: string
  conversationId: string
  body: string
  imageUrls?: string[]
  createdAt: Date
  status: 'queued' | 'failed'
  error?: string
}
class InboxDatabase extends Dexie {
  snapshots!: Table<Snapshot, string>
  identities!: Table<Identity, string>
  outbox!: Table<QueuedMessage, string>
  constructor() {
    super('nexusos-inbox-v1')
    this.version(1).stores({
      snapshots: 'key,actorId',
      identities: 'id',
      outbox: 'id,actorId,[actorId+conversationId]'
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
  async fail(id: string, error: string) {
    await db.outbox.update(id, { status: 'failed', error })
  },
  async remove(id: string) {
    await db.outbox.delete(id)
  },
  async purge(actorId: string) {
    await db.transaction('rw', db.snapshots, db.identities, db.outbox, async () => {
      await db.snapshots.where('actorId').equals(actorId).delete()
      await db.identities.delete(actorId)
      await db.outbox.where('actorId').equals(actorId).delete()
    })
  }
}
