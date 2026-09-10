import type { ChatPreview } from '@shared/components/ChatListScreen'

export interface MockMessage {
  id: string
  body: string
  direction: 'incoming' | 'outgoing'
  time: string
  state?: 'acknowledged' | 'local'
}

export interface MockConversation extends ChatPreview {
  messages: MockMessage[]
}

export const chatExamples: MockConversation[] = [
  {
    id: 'studio-one',
    name: 'Studio One',
    message: 'The new collection preview is ready.',
    time: '10:42',
    unreadCount: 3,
    verified: true,
    category: 'unread',
    messages: [
      {
        id: 's1',
        body: 'Hi! Is the linen collection available in medium?',
        direction: 'outgoing',
        time: '10:31',
        state: 'acknowledged'
      },
      {
        id: 's2',
        body: 'Yes, medium is available in sand and olive.',
        direction: 'incoming',
        time: '10:38'
      },
      {
        id: 's3',
        body: 'The new collection preview is ready.',
        direction: 'incoming',
        time: '10:42'
      }
    ]
  },
  {
    id: 'north-market',
    name: 'North Market',
    message: 'Your saved inquiry is waiting locally.',
    time: '9:18',
    unreadCount: 1,
    category: 'unread',
    messages: [
      {
        id: 'n1',
        body: 'Your inquiry draft is saved on this device.',
        direction: 'outgoing',
        time: '9:18',
        state: 'local'
      }
    ]
  },
  {
    id: 'sana',
    name: 'Sana Malik',
    message: 'Thank you — I will check the details.',
    time: 'Yesterday',
    unreadCount: 0,
    category: 'all',
    messages: [
      {
        id: 'a1',
        body: 'Thank you — I will check the details.',
        direction: 'incoming',
        time: 'Yesterday'
      }
    ]
  },
  {
    id: 'craft-house',
    name: 'Craft House',
    message: 'Archived conversation preview',
    time: 'Sun',
    unreadCount: 0,
    verified: true,
    category: 'archived',
    messages: [
      {
        id: 'c1',
        body: 'This is an archived mock conversation.',
        direction: 'incoming',
        time: 'Sun'
      }
    ]
  },
  {
    id: 'urban-supply',
    name: 'Urban Supply Co.',
    message: 'Draft saved on this device.',
    time: 'Fri',
    unreadCount: 0,
    category: 'all',
    messages: [
      {
        id: 'u1',
        body: 'Draft saved on this device.',
        direction: 'outgoing',
        time: 'Fri',
        state: 'local'
      }
    ]
  }
]
