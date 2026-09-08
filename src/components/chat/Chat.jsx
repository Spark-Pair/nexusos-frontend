import ActualChatSection from './ActualChatSection.jsx'
import ConversationList from './ConversationList.jsx'

export default function Chat({ conversations, messages, selectedId, onSelect }) {
  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) || conversations[0]

  return (
    <div className="chats-layout">
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversation.id}
        onSelect={onSelect}
      />
      <ActualChatSection conversation={selectedConversation} messages={messages} />
    </div>
  )
}
