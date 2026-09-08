import { Image as ImageIcon } from 'lucide-react'
import MessageStatus from './MessageStatus.jsx'

function ReplyPreview({ replyTo, outgoing }) {
  if (!replyTo) return null

  return (
    <div className={`reply-quote ${outgoing ? 'outgoing' : ''}`}>
      <strong>{replyTo.author}</strong>
      <span>{replyTo.image ? 'Image' : replyTo.text}</span>
    </div>
  )
}

function BubbleImage({ image }) {
  if (!image) return null

  return (
    <div className={`bubble-image ${image.tone || 'blue'}`}>
      <ImageIcon size={24} />
      <span>{image.label || 'Image'}</span>
    </div>
  )
}

export default function ChatBubble({ message }) {
  const outgoing = message.direction === 'sent'

  return (
    <div className={`message ${message.direction}`}>
      <ReplyPreview replyTo={message.replyTo} outgoing={outgoing} />
      <BubbleImage image={message.image} />
      {message.text ? <span>{message.text}</span> : null}
      {outgoing ? (
        <MessageStatus state={message.status} time={message.time} />
      ) : (
        <time className="incoming-time">{message.time}</time>
      )}
    </div>
  )
}
