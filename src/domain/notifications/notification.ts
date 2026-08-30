export type NotificationKind = 'message' | 'order' | 'verification' | 'sync' | 'application_update'

export interface AppNotification {
  id: string
  accountId: string
  workspaceId?: string
  kind: NotificationKind
  title: string
  description: string
  targetPath: string
  read: boolean
  provenance: 'development'
  createdAt: string
}

export interface NotificationScope {
  accountId: string
  workspaceId?: string
}
