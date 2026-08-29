import type { JsonValue } from '@domain/common/json'
import type { SyncMutation } from '@domain/sync/mutation'

export interface AppMetadataRecord {
  key: string
  value: JsonValue
  updatedAt: string
}

export interface DatabaseTables {
  appMetadata: AppMetadataRecord
  syncMutations: SyncMutation
}
