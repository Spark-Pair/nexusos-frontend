import { Search } from 'lucide-react'
import Avatar from '../shared/Avatar.jsx'

export default function ConversationList({ conversations, selectedId, onSelect }) {
  return (
    <section className="conversation-panel">
      <div className="conversation-column">
        <header className="conversation-heading">
          <h1>Chats</h1>
          <p>{conversations.length + 7} conversations</p>
        </header>
        <label className="search-box">
          <Search size={16} />
          <input placeholder="Search conversations" />
        </label>
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`conversation ${selectedId === conversation.id ? 'selected' : ''}`}
              onClick={() => onSelect(conversation.id)}
            >
              <Avatar initials={conversation.initials} />
              <span className="conversation-copy">
                <strong>{conversation.name}</strong>
                <small>{conversation.message}</small>
              </span>
              <time>{conversation.time}</time>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
