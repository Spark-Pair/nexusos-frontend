import { beforeEach, describe, expect, it, vi } from 'vitest'
import { messagingApi } from './messagingApi'

const conversationId = '9536f056-b2ad-4af8-8d7f-b005314e82eb'
const customerId = '20f74a81-804c-4b31-98d2-c095326cf1f4'
const businessId = 'b1343fd1-fb1e-4e9a-9f7a-984431cb1c5f'

describe('messaging API contract', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('parses a server-backed pending invitation and sends authenticated decisions', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: conversationId,
                customerId,
                businessId,
                invitedBy: businessId,
                status: 'pending',
                createdAt: '2026-09-02T10:00:00.000Z',
                updatedAt: '2026-09-02T10:00:00.000Z',
                counterpart: {
                  id: businessId,
                  name: 'Studio One',
                  username: 'studio-one',
                  accountKind: 'business',
                  followed: false
                },
                lastMessage: null,
                unreadCount: 1,
                archived: false,
                muted: false
              }
            ]
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: conversationId } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    const conversations = await messagingApi.list('session-token')
    expect(conversations[0]?.status).toBe('pending')
    await messagingApi.respond('session-token', conversationId, 'accepted')
    const [, decisionRequest] = fetchMock.mock.calls[1] ?? []
    expect(decisionRequest?.headers).toMatchObject({ Authorization: 'Bearer session-token' })
    expect(decisionRequest?.body).toBe(JSON.stringify({ decision: 'accepted' }))
  })
})
