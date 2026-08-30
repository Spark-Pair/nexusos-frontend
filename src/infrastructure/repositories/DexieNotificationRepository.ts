import type { AppNotification, NotificationScope } from '@domain/notifications/notification'
import type { NotificationRepository } from '@domain/notifications/NotificationRepository'
import type { NexusDatabase } from '@infrastructure/database/NexusDatabase'
import { z } from 'zod'

const notificationSchema = z.object({
  id: z.uuid(),
  accountId: z.string().min(1),
  workspaceId: z.string().min(1).optional(),
  kind: z.enum(['message', 'order', 'verification', 'sync', 'application_update']),
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(500),
  targetPath: z
    .string()
    .startsWith('/')
    .refine((value) => !value.startsWith('//') && !value.includes('\\')),
  read: z.boolean(),
  provenance: z.literal('development'),
  createdAt: z.iso.datetime()
})

function validatedNotification(value: unknown): AppNotification | undefined {
  const parsed = notificationSchema.safeParse(value)
  if (!parsed.success) return undefined
  const { workspaceId, ...record } = parsed.data
  return workspaceId ? { ...record, workspaceId } : record
}

export class DexieNotificationRepository implements NotificationRepository {
  public constructor(private readonly database: NexusDatabase) {}

  public async list(scope: NotificationScope): Promise<AppNotification[]> {
    const records = scope.workspaceId
      ? await this.database.notifications
          .where('[accountId+workspaceId]')
          .equals([scope.accountId, scope.workspaceId])
          .toArray()
      : await this.database.notifications
          .where('accountId')
          .equals(scope.accountId)
          .and((item) => item.workspaceId === undefined)
          .toArray()
    return records
      .flatMap((record) => {
        const validated = validatedNotification(record)
        return validated ? [validated] : []
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  }

  public async putMany(records: readonly AppNotification[]): Promise<void> {
    await this.database.notifications.bulkPut(
      records.map((record) => {
        const validated = validatedNotification(record)
        if (!validated) throw new Error('Invalid notification record')
        return validated
      })
    )
  }

  public async setRead(scope: NotificationScope, id: string, read: boolean): Promise<void> {
    const record = await this.scopedRecord(scope, id)
    if (record) await this.database.notifications.update(id, { read })
  }

  public async markAllRead(scope: NotificationScope): Promise<void> {
    const records = await this.list(scope)
    await this.database.notifications.bulkPut(records.map((record) => ({ ...record, read: true })))
  }

  public async delete(scope: NotificationScope, id: string): Promise<void> {
    if (await this.scopedRecord(scope, id)) await this.database.notifications.delete(id)
  }

  private async scopedRecord(
    scope: NotificationScope,
    id: string
  ): Promise<AppNotification | undefined> {
    const persisted = await this.database.notifications.get(id)
    const record = validatedNotification(persisted)
    if (record?.accountId === scope.accountId && record.workspaceId === scope.workspaceId)
      return record
    return undefined
  }
}
