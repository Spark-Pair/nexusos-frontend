import { describe, expect, it } from 'vitest'
import { conversationMediaUrls, detailMediaUrls, messageMediaUrls } from './mediaCache'
import type { ConversationDetail, ConversationSummary, Message } from './messagingApi'

const message = {
  id: '11111111-1111-4111-8111-111111111111',
  conversationId: '22222222-2222-4222-8222-222222222222',
  senderId: '33333333-3333-4333-8333-333333333333',
  body: '',
  imageUrls: ['/api/media/broadcasts-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg'],
  audioUrl: '/api/media/audio-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.webm',
  createdAt: new Date('2026-09-22T10:00:00.000Z'),
  deliveredAt: null,
  readAt: null,
  title: '',
  reactions: {}
} satisfies Message

describe('chat media cache helpers', () => {
  it('extracts every media attachment from messages, summaries and conversation details', () => {
    expect(messageMediaUrls(message)).toEqual([message.imageUrls[0], message.audioUrl])

    const summary = {
      id: message.conversationId,
      customerId: '44444444-4444-4444-8444-444444444444',
      businessId: '55555555-5555-4555-8555-555555555555',
      invitedBy: '55555555-5555-4555-8555-555555555555',
      status: 'accepted',
      createdAt: new Date('2026-09-22T09:00:00.000Z'),
      updatedAt: new Date('2026-09-22T10:00:00.000Z'),
      counterpart: {
        id: '55555555-5555-4555-8555-555555555555',
        name: 'Studio One',
        username: 'studio-one',
        accountKind: 'business',
        followed: true
      },
      lastMessage: message,
      unreadCount: 1,
      archived: false,
      muted: false,
      pinned: false
    } satisfies ConversationSummary
    expect(conversationMediaUrls([summary])).toEqual([message.imageUrls[0], message.audioUrl])

    const detail = {
      conversation: summary,
      counterpart: summary.counterpart,
      messages: [message]
    } satisfies ConversationDetail
    expect(detailMediaUrls(detail)).toEqual([message.imageUrls[0], message.audioUrl])
  })
})
