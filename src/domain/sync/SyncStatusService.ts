export interface SyncScope {
  accountId: string
  workspaceId?: string
}

export interface SyncStatusService {
  countPending: (scope: SyncScope) => Promise<number>
}
