import type { AppNotification, NotificationScope } from '@domain/notifications/notification'

export interface NotificationService {
  list: (scope: NotificationScope) => Promise<AppNotification[]>
  setRead: (scope: NotificationScope, id: string, read: boolean) => Promise<void>
  markAllRead: (scope: NotificationScope) => Promise<void>
  delete: (scope: NotificationScope, id: string) => Promise<void>
}
