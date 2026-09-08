import { Check, CheckCheck } from 'lucide-react'

export default function MessageStatus({ state = 'sent', time }) {
  const Icon = state === 'sent' ? Check : CheckCheck

  return (
    <span className={`message-meta ${state}`}>
      <time>{time}</time>
      <Icon className="status-icon" size={14} strokeWidth={2.4} aria-label={state} />
    </span>
  )
}
