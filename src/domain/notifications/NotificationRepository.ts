import type { AppNotification, NotificationScope } from '@domain/notifications/notification'

export interface NotificationRepository {
  list(scope: NotificationScope): Promise<AppNotification[]>
  putMany(records: readonly AppNotification[]): Promise<void>
  setRead(scope: NotificationScope, id: string, read: boolean): Promise<void>
  markAllRead(scope: NotificationScope): Promise<void>
  delete(scope: NotificationScope, id: string): Promise<void>
}
