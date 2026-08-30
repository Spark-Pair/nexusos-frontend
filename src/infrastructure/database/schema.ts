import type { JsonValue } from '@domain/common/json'
import type { AppNotification } from '@domain/notifications/notification'
import type { SyncMutation } from '@domain/sync/mutation'

export interface AppMetadataRecord {
  key: string
  value: JsonValue
  updatedAt: string
}

export interface DatabaseTables {
  appMetadata: AppMetadataRecord
  syncMutations: SyncMutation
  notifications: AppNotification
}
