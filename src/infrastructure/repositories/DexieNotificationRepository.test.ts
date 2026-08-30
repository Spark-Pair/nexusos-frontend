import { NexusDatabase } from '@infrastructure/database/NexusDatabase'
import { DexieNotificationRepository } from '@infrastructure/repositories/DexieNotificationRepository'
import { afterEach, describe, expect, it } from 'vitest'

describe('DexieNotificationRepository', () => {
  const databases: NexusDatabase[] = []
  afterEach(async () => Promise.all(databases.splice(0).map((database) => database.delete())))

  it('isolates records and actions by account and workspace', async () => {
    const database = new NexusDatabase(`notifications-${crypto.randomUUID()}`)
    databases.push(database)
    const repository = new DexieNotificationRepository(database)
    const createdAt = '2026-01-01T00:00:00.000Z'
    await repository.putMany([
      {
        id: '00000000-0000-4000-8000-000000000001',
        accountId: 'account',
        workspaceId: 'workspace-one',
        kind: 'message',
        title: 'One',
        description: 'One',
        targetPath: '/',
        read: false,
        provenance: 'development',
        createdAt
      },
      {
        id: '00000000-0000-4000-8000-000000000002',
        accountId: 'account',
        workspaceId: 'workspace-two',
        kind: 'message',
        title: 'Two',
        description: 'Two',
        targetPath: '/',
        read: false,
        provenance: 'development',
        createdAt
      },
      {
        id: '00000000-0000-4000-8000-000000000003',
        accountId: 'other',
        workspaceId: 'workspace-one',
        kind: 'message',
        title: 'Three',
        description: 'Three',
        targetPath: '/',
        read: false,
        provenance: 'development',
        createdAt
      }
    ])
    const scope = { accountId: 'account', workspaceId: 'workspace-one' }
    await expect(repository.list(scope)).resolves.toHaveLength(1)
    await repository.setRead(scope, '00000000-0000-4000-8000-000000000002', true)
    await expect(
      database.notifications.get('00000000-0000-4000-8000-000000000002')
    ).resolves.toMatchObject({ read: false })
    await repository.markAllRead(scope)
    await expect(repository.list(scope)).resolves.toEqual([
      expect.objectContaining({ id: '00000000-0000-4000-8000-000000000001', read: true })
    ])
    await repository.delete(scope, '00000000-0000-4000-8000-000000000002')
    await expect(
      database.notifications.get('00000000-0000-4000-8000-000000000002')
    ).resolves.toBeDefined()
  })

  it('rejects writes and ignores persisted records that fail runtime validation', async () => {
    const database = new NexusDatabase(`notifications-invalid-${crypto.randomUUID()}`)
    databases.push(database)
    const repository = new DexieNotificationRepository(database)
    await expect(
      repository.putMany([
        {
          id: 'not-a-uuid',
          accountId: 'account',
          kind: 'message',
          title: 'Unsafe',
          description: 'Unsafe route',
          targetPath: '//external.example',
          read: false,
          provenance: 'development',
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ])
    ).rejects.toThrow()
    await database.notifications.put({
      id: 'malformed',
      accountId: 'account',
      kind: 'message',
      title: '',
      description: 'Malformed persisted record',
      targetPath: '/',
      read: false,
      provenance: 'development',
      createdAt: 'invalid'
    })
    await expect(repository.list({ accountId: 'account' })).resolves.toEqual([])
  })
})
