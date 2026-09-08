import { useState } from 'react'
import Chat from '../components/chat/Chat.jsx'
import { conversations, messages } from '../data/demoData.js'

export default function ChatsPage() {
  const [selectedId, setSelectedId] = useState(conversations[0].id)

  return (
    <Chat
      conversations={conversations}
      messages={messages}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  )
}
