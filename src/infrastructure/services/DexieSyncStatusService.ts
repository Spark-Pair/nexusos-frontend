import type { MutationQueueRepository } from '@domain/sync/MutationQueueRepository'
import type { SyncScope, SyncStatusService } from '@domain/sync/SyncStatusService'

export class DexieSyncStatusService implements SyncStatusService {
  public constructor(private readonly repository: MutationQueueRepository) {}
  public async countPending(scope: SyncScope): Promise<number> {
    return (await this.repository.listPending(scope.accountId, scope.workspaceId)).length
  }
}
