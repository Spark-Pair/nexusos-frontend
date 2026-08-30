import type { JsonValue } from '@domain/common/json'
import { NexusDatabase } from '@infrastructure/database/NexusDatabase'
import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'

interface LegacyMutation {
  id: string
  accountId: string
  workspaceId: string
  entityType: string
  entityId: string
  operation: string
  payload: JsonValue
  dependencyIds: string[]
  attemptCount: number
  status: 'pending'
  createdAt: string
  updatedAt: string
}

describe('NexusDatabase migrations', () => {
  const databaseNames: string[] = []

  afterEach(async () => {
    await Promise.all(databaseNames.splice(0).map((name) => Dexie.delete(name)))
  })

  it('adds a stable idempotency key when upgrading a version 1 queue', async () => {
    const name = `nexusos-migration-${crypto.randomUUID()}`
    databaseNames.push(name)
    const legacyDatabase = new Dexie(name)
    legacyDatabase.version(1).stores({
      appMetadata: '&key, updatedAt',
      syncMutations:
        '&id, [accountId+workspaceId+status], [accountId+status], entityId, status, nextAttemptAt, createdAt'
    })
    const timestamp = '2026-01-01T00:00:00.000Z'
    const legacyMutation: LegacyMutation = {
      id: crypto.randomUUID(),
      accountId: 'account-1',
      workspaceId: 'workspace-1',
      entityType: 'foundation-check',
      entityId: 'entity-1',
      operation: 'create',
      payload: { ready: true },
      dependencyIds: [],
      attemptCount: 0,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    }
    await legacyDatabase.table<LegacyMutation>('syncMutations').add(legacyMutation)
    legacyDatabase.close()

    const upgradedDatabase = new NexusDatabase(name)
    const upgraded = await upgradedDatabase.syncMutations.get(legacyMutation.id)

    expect(upgraded?.idempotencyKey).toBe(legacyMutation.id)
    expect(upgraded?.status).toBe('pending')
    upgradedDatabase.close()
  })

  it('preserves version 2 pending mutations when adding the notification store', async () => {
    const name = `nexusos-v2-migration-${crypto.randomUUID()}`
    databaseNames.push(name)
    const legacyDatabase = new Dexie(name)
    legacyDatabase.version(2).stores({
      appMetadata: '&key, updatedAt',
      syncMutations:
        '&id, &idempotencyKey, [accountId+workspaceId+status], [accountId+status], entityId, status, nextAttemptAt, createdAt'
    })
    const id = crypto.randomUUID()
    await legacyDatabase.table('syncMutations').add({
      id,
      idempotencyKey: id,
      accountId: 'account-v2',
      workspaceId: 'workspace-v2',
      entityType: 'foundation-check',
      entityId: 'entity-v2',
      operation: 'create',
      payload: { ready: true },
      dependencyIds: [],
      attemptCount: 0,
      status: 'pending',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    })
    legacyDatabase.close()

    const upgradedDatabase = new NexusDatabase(name)
    await expect(upgradedDatabase.syncMutations.get(id)).resolves.toMatchObject({
      id,
      idempotencyKey: id,
      status: 'pending'
    })
    expect(upgradedDatabase.notifications).toBeDefined()
    upgradedDatabase.close()
  })
})
