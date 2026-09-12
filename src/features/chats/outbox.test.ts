import { ApiError } from '@shared/ApiError'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { messagingApi } from './messagingApi'
import { offlineStore, type QueuedMessage } from './offlineStore'
import { syncOutbox } from './outbox'

const actor = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
const conversation = '33333333-3333-4333-8333-333333333333'
const queued = (): QueuedMessage => ({
  id: crypto.randomUUID(),
  actorId: actor,
  conversationId: conversation,
  body: 'Offline message',
  createdAt: new Date(),
  status: 'queued'
})
describe('durable inbox outbox', () => {
  beforeEach(async () => {
    await offlineStore.purge(actor)
    await offlineStore.purge(other)
    sessionStorage.setItem('nexusos-session-token', 'token')
  })
  afterEach(() => vi.restoreAllMocks())
  it('keeps network failures queued and reuses the UUID for a single acknowledged message', async () => {
    const item = queued()
    await offlineStore.enqueue(item)
    const send = vi
      .spyOn(messagingApi, 'send')
      .mockRejectedValueOnce(new TypeError('Network disconnected'))
      .mockResolvedValue({ ...item, senderId: actor, title: '', imageUrls: [], readAt: null })
    await syncOutbox(actor, 'token')
    expect(await offlineStore.queued(actor)).toHaveLength(1)
    await Promise.all([syncOutbox(actor, 'token'), syncOutbox(actor, 'token')])
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenLastCalledWith('token', conversation, item.body, item.id, [])
    expect(await offlineStore.queued(actor)).toHaveLength(0)
  })
  it('exposes denied messages as failed and does not auto-retry them', async () => {
    const item = queued()
    await offlineStore.enqueue(item)
    const send = vi
      .spyOn(messagingApi, 'send')
      .mockRejectedValue(new ApiError('Connection no longer accepted.', 403))
    await syncOutbox(actor, 'token')
    await syncOutbox(actor, 'token')
    expect(send).toHaveBeenCalledTimes(1)
    expect((await offlineStore.queued(actor))[0]).toMatchObject({
      status: 'failed',
      error: 'Connection no longer accepted.'
    })
  })
  it('never replays after logout or with another session token', async () => {
    await offlineStore.enqueue(queued())
    const send = vi.spyOn(messagingApi, 'send')
    sessionStorage.removeItem('nexusos-session-token')
    await syncOutbox(actor, 'token')
    expect(send).not.toHaveBeenCalled()
  })
  it('isolates snapshots and removes only the signed-out account data', async () => {
    await offlineStore.save(actor, conversation, { body: 'Private' })
    await offlineStore.save(other, conversation, { body: 'Other account' })
    await offlineStore.enqueue(queued())
    await offlineStore.purge(actor)
    expect(await offlineStore.read(actor, conversation)).toBeUndefined()
    expect(await offlineStore.queued(actor)).toEqual([])
    expect(await offlineStore.read(other, conversation)).toEqual({ body: 'Other account' })
  })
  it('purges rejected credentials and never reports them as a sent message', async () => {
    await offlineStore.enqueue(queued())
    vi.spyOn(messagingApi, 'send').mockRejectedValue(new ApiError('Session expired', 401))
    await expect(syncOutbox(actor, 'token')).rejects.toThrow('Session expired')
    expect(await offlineStore.queued(actor)).toEqual([])
  })
})
