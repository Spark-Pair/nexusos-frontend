import type { NewSyncMutation, SyncMutation } from '@domain/sync/mutation'

export interface MutationQueueRepository {
  enqueue(input: NewSyncMutation): Promise<SyncMutation>
  listPending(accountId: string, workspaceId?: string): Promise<SyncMutation[]>
}
