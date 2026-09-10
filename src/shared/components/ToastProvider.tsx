import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react'
import { Toast } from './Toast'
import { ToastContext, type ToastMessage } from './toastContext'

export function ToastProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<(ToastMessage & { id: string })[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const dismiss = useCallback(
    (id: string) => setMessages((items) => items.filter((item) => item.id !== id)),
    []
  )
  const notify = useCallback(
    (message: ToastMessage) => {
      const id = crypto.randomUUID()
      setMessages((items) => [...items.slice(-2), { ...message, id }])
      // Errors stay until dismissed; successful feedback is unobtrusive.
      if (message.tone !== 'danger') timers.current.push(setTimeout(() => dismiss(id), 5000))
    },
    [dismiss]
  )
  useEffect(() => {
    const active = timers.current
    return () => active.forEach(clearTimeout)
  }, [])
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-stack" aria-label="Notifications">
        {messages.map((message) => (
          <Toast
            key={message.id}
            title={message.title}
            tone={message.tone ?? 'info'}
            onClose={() => dismiss(message.id)}
          >
            {message.description}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
