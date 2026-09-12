import {
  ImagePlus,
  Image as ImageIcon,
  RefreshCw,
  SendHorizontal,
  Smile,
  LoaderCircle,
  X
} from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import { IconButton } from './IconButton'

export type AttachmentState = 'local' | 'pending' | 'acknowledged' | 'failed'
const attachmentLabels: Record<AttachmentState, string> = {
  local: 'Saved locally',
  pending: 'Pending upload',
  acknowledged: 'Uploaded',
  failed: 'Upload failed'
}

export function ImageAttachment({
  name,
  onRemove,
  onRetry,
  state = 'local'
}: {
  name: string
  state?: AttachmentState
  onRemove?: () => void
  onRetry?: () => void
}) {
  return (
    <div className="group relative flex min-h-24 items-end overflow-hidden rounded-[var(--radius-surface)] border border-slate-300 bg-slate-100 p-2 dark:border-slate-700 dark:bg-slate-800">
      <ImageIcon
        className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <div className="relative flex w-full items-end justify-between gap-2 rounded-[var(--radius-control)] border border-white/80 bg-white/90 p-2 dark:border-slate-700 dark:bg-slate-950/90">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold">{name}</p>
          <p className={`text-[10px] ${state === 'failed' ? 'text-rose-600' : 'text-slate-500'}`}>
            {attachmentLabels[state]}
          </p>
        </div>
        <div className="flex gap-1">
          {state === 'failed' && onRetry ? (
            <IconButton
              onClick={onRetry}
              label={`Retry ${name}`}
              icon={<RefreshCw className="size-3.5" />}
              variant="danger"
              size="sm"
            />
          ) : null}
          {onRemove ? (
            <IconButton
              onClick={onRemove}
              label={`Remove ${name}`}
              icon={<X className="size-3.5" />}
              size="sm"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function MessageComposer({
  onAddImage,
  onSubmit,
  onTyping,
  quickReplies = []
}: {
  onAddImage?: () => void
  onSubmit: (body: string, files: File[]) => void | Promise<void>
  onTyping?: (active: boolean) => void
  quickReplies?: readonly string[]
}) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const pending = useRef(false)
  const inputId = useId()
  const typingTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(typingTimer.current), [])
  const typing = (active: boolean) => {
    window.clearTimeout(typingTimer.current)
    onTyping?.(active)
    if (active) typingTimer.current = window.setTimeout(() => onTyping?.(false), 1500)
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const body = draft.trim()
    if ((!body && !files.length) || pending.current) return
    pending.current = true
    setSending(true)
    setError('')
    try {
      const result = onSubmit(body, files)
      if (result) await result
      typing(false)
      setDraft('')
      setFiles([])
      setEmojiOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Message was not sent. Please retry.')
    } finally {
      pending.current = false
      setSending(false)
    }
  }

  return (
    <div>
      {quickReplies.length ? (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {quickReplies.map((reply) => (
            <button
              type="button"
              key={reply}
              onClick={() => setDraft(reply)}
              className="shrink-0 rounded-[var(--radius-control)] border border-slate-300 bg-white px-3 py-2 text-xs font-semibold transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
            >
              {reply}
            </button>
          ))}
        </div>
      ) : null}
      {error && (
        <p
          role="alert"
          className="mb-2 rounded-[var(--radius-control)] bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-200"
        >
          {error}
        </p>
      )}
      {emojiOpen && (
        <div
          role="group"
          aria-label="Choose an emoji"
          className="mb-2 flex flex-wrap gap-1 rounded-[var(--radius-control)] border bg-white p-2 dark:bg-slate-900"
        >
          {[
            '\u{1F642}',
            '\u{1F44D}',
            '\u{2764}\u{FE0F}',
            '\u{1F64F}',
            '\u{1F389}',
            '\u{1F60A}',
            '\u{2705}',
            '\u{1F44B}'
          ].map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="size-10 rounded-[var(--radius-control)] text-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={`Insert ${emoji}`}
              onClick={() => {
                setDraft((current) => current + emoji)
                setEmojiOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      {files.length ? (
        <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {files.map((file, index) => (
            <ImageAttachment
              key={`${file.name}-${index}`}
              name={file.name}
              onRemove={() => setFiles((current) => current.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      ) : null}
      <form
        onSubmit={(event) => void submit(event)}
        className="composer-panel flex items-end gap-1 p-2"
      >
        <IconButton
          label="Emoji"
          aria-expanded={emojiOpen}
          icon={<Smile className="size-5" />}
          variant="quiet"
          disabled={sending}
          onClick={() => setEmojiOpen((value) => !value)}
        />
        <label
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-[var(--radius-control)] text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Add images"
        >
          <ImagePlus className="size-5" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            disabled={sending}
            onChange={(event) => {
              const added = Array.from(event.target.files ?? [])
              event.target.value = ''
              if (
                added.some(
                  (file) =>
                    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
                    file.size > 5 * 1024 * 1024
                )
              ) {
                setError('Use JPEG, PNG or WebP images up to 5 MB each.')
                return
              }
              if (files.length + added.length > 10) {
                setError('You can attach up to 10 images.')
                return
              }
              setFiles((current) => [...current, ...added])
              onAddImage?.()
              setError('')
            }}
          />
        </label>
        <label className="sr-only" htmlFor={inputId}>
          Message
        </label>
        <textarea
          id={inputId}
          rows={1}
          disabled={sending}
          maxLength={4000}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              window.matchMedia('(pointer: fine)').matches
            ) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            event.target.style.height = 'auto'
            event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`
            typing(Boolean(event.target.value.trim()))
          }}
          onBlur={() => typing(false)}
          placeholder="Message"
          className="field-control min-h-10 max-h-40 resize-none border-transparent bg-transparent dark:bg-transparent"
        />
        <IconButton
          type="submit"
          label={sending ? 'Sending message' : 'Send message'}
          icon={
            sending ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <SendHorizontal className="size-5" />
            )
          }
          disabled={sending || (!draft.trim() && !files.length)}
          variant="brand"
          size="md"
        />
      </form>
    </div>
  )
}

export type BroadcastKind = 'new-arrival' | 'sale' | 'restock' | 'order-update'
export function BroadcastCard({
  business,
  body,
  kind,
  onOpen,
  onSave,
  saved = false,
  time
}: {
  business: string
  body: string
  kind: BroadcastKind
  time: string
  saved?: boolean
  onOpen?: () => void
  onSave?: () => void
}) {
  const labels: Record<BroadcastKind, string> = {
    'new-arrival': 'New arrival',
    sale: 'Sale',
    restock: 'Restock',
    'order-update': 'Order update'
  }
  return (
    <article className="rounded-[var(--radius-surface)] border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge tone={kind === 'sale' ? 'danger' : 'brand'}>{labels[kind]}</Badge>
          <h3 className="mt-3 text-sm font-bold">{business}</h3>
        </div>
        <time className="text-[11px] text-slate-500">{time}</time>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
      <div className="mt-4 min-h-28 rounded-[var(--radius-surface)] border border-slate-300 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800">
        <ImageIcon className="size-6 text-slate-400" aria-hidden="true" />
        <p className="mt-5 text-xs text-slate-500">Media placeholder</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button size="sm" onClick={onSave}>
          {saved ? 'Saved' : 'Save'}
        </Button>
        <Button size="sm" variant="primary" onClick={onOpen}>
          View update
        </Button>
      </div>
    </article>
  )
}
