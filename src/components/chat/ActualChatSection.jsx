import { Paperclip, SendHorizontal, SmilePlus } from 'lucide-react'
import Avatar from '../shared/Avatar.jsx'
import ChatBubble from './ChatBubble.jsx'

export default function ActualChatSection({ conversation, messages }) {
  return (
    <section className="chat-panel">
      <header className="chat-header">
        <Avatar initials={conversation.initials} />
        <div>
          <strong>{conversation.name}</strong>
          <small>{conversation.phone} | Active now</small>
        </div>
      </header>
      <div className="messages">
        <span className="day-label">Today</span>
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </div>
      <form className="composer" onSubmit={(event) => event.preventDefault()}>
        <button type="button" aria-label="Attach file">
          <Paperclip size={20} />
        </button>
        <input placeholder="Type a message..." />
        <button type="button" aria-label="Add reaction">
          <SmilePlus size={20} />
        </button>
        <button className="send" aria-label="Send message">
          <SendHorizontal size={20} />
        </button>
      </form>
    </section>
  )
}
