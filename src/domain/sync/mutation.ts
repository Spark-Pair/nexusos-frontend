import type { JsonValue } from '@domain/common/json'

export type MutationStatus =
  | 'pending'
  | 'leased'
  | 'sending'
  | 'retry_wait'
  | 'blocked_dependency'
  | 'blocked_auth'
  | 'conflict'
  | 'acknowledged'
  | 'failed_permanent'
  | 'superseded'

export interface SyncMutation {
  id: string
  idempotencyKey: string
  accountId: string
  workspaceId?: string
  entityType: string
  entityId: string
  operation: string
  payload: JsonValue
  baseVersion?: string
  dependencyIds: string[]
  attemptCount: number
  status: MutationStatus
  nextAttemptAt?: string
  createdAt: string
  updatedAt: string
  lastErrorCode?: string
}

export type NewSyncMutation = Omit<
  SyncMutation,
  'id' | 'idempotencyKey' | 'attemptCount' | 'status' | 'createdAt' | 'updatedAt'
>
