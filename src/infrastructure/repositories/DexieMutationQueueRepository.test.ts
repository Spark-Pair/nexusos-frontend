import type { NewSyncMutation } from '@domain/sync/mutation'
import { NexusDatabase } from '@infrastructure/database/NexusDatabase'
import { DexieMutationQueueRepository } from '@infrastructure/repositories/DexieMutationQueueRepository'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('DexieMutationQueueRepository', () => {
  let database: NexusDatabase
  let repository: DexieMutationQueueRepository

  beforeEach(() => {
    database = new NexusDatabase(`nexusos-test-${crypto.randomUUID()}`)
    repository = new DexieMutationQueueRepository(database)
  })

  afterEach(async () => {
    await database.delete()
  })

  it('persists a UUID-backed pending mutation in its account and workspace scope', async () => {
    const saved = await repository.enqueue({
      accountId: 'account-1',
      workspaceId: 'workspace-1',
      entityType: 'foundation-check',
      entityId: 'entity-1',
      operation: 'create',
      payload: { ready: true },
      dependencyIds: []
    })

    await expect(repository.listPending('account-1', 'workspace-1')).resolves.toEqual([saved])
    await expect(repository.listPending('another-account', 'workspace-1')).resolves.toEqual([])
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/u)
    expect(saved.idempotencyKey).toBe(saved.id)
    expect(saved.attemptCount).toBe(0)
    expect(saved.status).toBe('pending')
  })

  it('never returns workspace mutations from another scope', async () => {
    const baseMutation: NewSyncMutation = {
      accountId: 'account-1',
      entityType: 'foundation-check',
      entityId: 'entity-1',
      operation: 'create',
      payload: { ready: true },
      dependencyIds: []
    }

    const accountScoped = await repository.enqueue(baseMutation)
    const firstWorkspace = await repository.enqueue({
      ...baseMutation,
      workspaceId: 'workspace-1'
    })
    await repository.enqueue({ ...baseMutation, workspaceId: 'workspace-2' })
    await repository.enqueue({ ...baseMutation, accountId: 'account-2' })

    await expect(repository.listPending('account-1')).resolves.toEqual([accountScoped])
    await expect(repository.listPending('account-1', 'workspace-1')).resolves.toEqual([
      firstWorkspace
    ])
  })
})
