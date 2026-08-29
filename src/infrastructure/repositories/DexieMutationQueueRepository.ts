import type { NewSyncMutation, SyncMutation } from '@domain/sync/mutation'
import type { MutationQueueRepository } from '@domain/sync/MutationQueueRepository'
import type { NexusDatabase } from '@infrastructure/database/NexusDatabase'

export class DexieMutationQueueRepository implements MutationQueueRepository {
  public constructor(private readonly database: NexusDatabase) {}

  public async enqueue(input: NewSyncMutation): Promise<SyncMutation> {
    const now = new Date().toISOString()
    const idempotencyKey = crypto.randomUUID()
    const mutation: SyncMutation = {
      ...input,
      id: idempotencyKey,
      idempotencyKey,
      attemptCount: 0,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    }

    await this.database.syncMutations.add(mutation)
    return mutation
  }

  public listPending(accountId: string, workspaceId?: string): Promise<SyncMutation[]> {
    if (workspaceId === undefined) {
      return this.database.syncMutations
        .where('[accountId+status]')
        .equals([accountId, 'pending'])
        .and((mutation) => mutation.workspaceId === undefined)
        .sortBy('createdAt')
    }

    return this.database.syncMutations
      .where('[accountId+workspaceId+status]')
      .equals([accountId, workspaceId, 'pending'])
      .sortBy('createdAt')
  }
}
