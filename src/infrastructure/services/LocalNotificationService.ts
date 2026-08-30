import type { AppNotification, NotificationScope } from '@domain/notifications/notification'
import type { NotificationRepository } from '@domain/notifications/NotificationRepository'
import type { NotificationService } from '@domain/notifications/NotificationService'

export class LocalNotificationService implements NotificationService {
  private readonly seededScopes = new Set<string>()
  public constructor(
    private readonly repository: NotificationRepository,
    private readonly developmentRecords: boolean
  ) {}

  public async list(scope: NotificationScope): Promise<AppNotification[]> {
    if (this.developmentRecords) await this.seed(scope)
    return this.repository.list(scope)
  }
  public setRead(scope: NotificationScope, id: string, read: boolean): Promise<void> {
    return this.repository.setRead(scope, id, read)
  }
  public markAllRead(scope: NotificationScope): Promise<void> {
    return this.repository.markAllRead(scope)
  }
  public delete(scope: NotificationScope, id: string): Promise<void> {
    return this.repository.delete(scope, id)
  }

  private async seed(scope: NotificationScope): Promise<void> {
    const key = `${scope.accountId}:${scope.workspaceId ?? 'account'}`
    if (this.seededScopes.has(key) || (await this.repository.list(scope)).length > 0) {
      this.seededScopes.add(key)
      return
    }
    const base = {
      accountId: scope.accountId,
      ...(scope.workspaceId ? { workspaceId: scope.workspaceId } : {}),
      provenance: 'development' as const
    }
    await this.repository.putMany([
      {
        ...base,
        id: crypto.randomUUID(),
        kind: 'application_update',
        title: 'Demo notification center',
        description: 'These local records demonstrate the Phase 2 notification boundary.',
        targetPath: scope.workspaceId ? `/business/${scope.workspaceId}/overview` : '/app/discover',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        ...base,
        id: crypto.randomUUID(),
        kind: 'sync',
        title: 'Synchronization status',
        description: 'Local actions remain pending until a future server acknowledges them.',
        targetPath: scope.workspaceId ? `/business/${scope.workspaceId}/overview` : '/app/profile',
        read: true,
        createdAt: new Date(Date.now() - 60_000).toISOString()
      }
    ])
    this.seededScopes.add(key)
  }
}
