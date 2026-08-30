import type { AppNotification } from '@domain/notifications/notification'
import type { SyncMutation } from '@domain/sync/mutation'
import type { AppMetadataRecord } from '@infrastructure/database/schema'
import Dexie, { type EntityTable } from 'dexie'

type LegacySyncMutation = Omit<SyncMutation, 'idempotencyKey'> & { idempotencyKey?: string }

const stores = {
  appMetadata: '&key, updatedAt',
  syncMutations:
    '&id, &idempotencyKey, [accountId+workspaceId+status], [accountId+status], entityId, status, nextAttemptAt, createdAt'
}

export class NexusDatabase extends Dexie {
  public appMetadata!: EntityTable<AppMetadataRecord, 'key'>
  public syncMutations!: EntityTable<SyncMutation, 'id'>
  public notifications!: EntityTable<AppNotification, 'id'>

  public constructor(name = 'nexusos') {
    super(name)

    this.version(1).stores({
      appMetadata: '&key, updatedAt',
      syncMutations:
        '&id, [accountId+workspaceId+status], [accountId+status], entityId, status, nextAttemptAt, createdAt'
    })

    this.version(2)
      .stores(stores)
      .upgrade(async (transaction) => {
        await transaction
          .table<LegacySyncMutation, string>('syncMutations')
          .toCollection()
          .modify((mutation) => {
            mutation.idempotencyKey ??= mutation.id
          })
      })

    this.version(3).stores({
      ...stores,
      notifications: '&id, [accountId+workspaceId], accountId, createdAt, read'
    })
  }
}

export const database = new NexusDatabase()
