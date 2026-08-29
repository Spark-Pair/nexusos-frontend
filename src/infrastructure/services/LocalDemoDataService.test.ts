import { NexusDatabase } from '@infrastructure/database/NexusDatabase'
import { DexieMutationQueueRepository } from '@infrastructure/repositories/DexieMutationQueueRepository'
import { LocalDemoDataService } from '@infrastructure/services/LocalDemoDataService'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('LocalDemoDataService', () => {
  let database: NexusDatabase

  beforeEach(() => {
    database = new NexusDatabase(`nexusos-test-${crypto.randomUUID()}`)
  })

  afterEach(async () => {
    await database.delete()
  })

  it('removes only demo metadata and preserves user data and pending mutations', async () => {
    const queue = new DexieMutationQueueRepository(database)
    const pendingMutation = await queue.enqueue({
      accountId: 'account-1',
      workspaceId: 'workspace-1',
      entityType: 'customer-note',
      entityId: 'note-1',
      operation: 'create',
      payload: { body: 'Keep this unsynced change' },
      dependencyIds: []
    })
    await database.appMetadata.bulkAdd([
      { key: 'demo:seed-version', value: 1, updatedAt: '2026-01-01T00:00:00.000Z' },
      { key: 'preference:theme', value: 'light', updatedAt: '2026-01-01T00:00:00.000Z' }
    ])

    await new LocalDemoDataService(database).reset()

    await expect(database.appMetadata.get('demo:seed-version')).resolves.toBeUndefined()
    await expect(database.appMetadata.get('preference:theme')).resolves.toBeDefined()
    await expect(database.syncMutations.get(pendingMutation.id)).resolves.toEqual(pendingMutation)
  })
})
