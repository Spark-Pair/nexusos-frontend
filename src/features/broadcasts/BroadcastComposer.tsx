import { Button } from '@shared/components/Button'
import { Combobox } from '@shared/components/Combobox'
import { Input, Textarea } from '@shared/components/FormControls'
import { useToast } from '@shared/components/toastContext'
import { ImagePlus, Send, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  broadcastApi,
  broadcastMediaUrl,
  type BroadcastDraft,
  type BroadcastList
} from './broadcastApi'

function LocalImage({ file }: { file: File }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const next = URL.createObjectURL(file)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [file])
  return (
    <img
      src={url || undefined}
      alt={file.name}
      className="aspect-square w-full rounded-xl object-cover"
    />
  )
}

export function BroadcastComposer({
  token,
  lists,
  selected,
  onSelect,
  draft,
  onCreateList,
  onSaved,
  onPublished
}: {
  token: string
  lists: BroadcastList[]
  selected: string
  onSelect: (id: string) => void
  draft: BroadcastDraft | null
  onCreateList: () => void
  onSaved: () => void
  onPublished: () => void
}) {
  const toast = useToast()
  const [title, setTitle] = useState(draft?.title ?? '')
  const [body, setBody] = useState(draft?.body ?? '')
  const [files, setFiles] = useState<File[]>([])
  const [urls, setUrls] = useState(draft?.imageUrls ?? [])
  const [draftId, setDraftId] = useState(draft?.id ?? '')
  const [busy, setBusy] = useState<'publish' | 'draft' | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const pending = useRef(false)
  const audience = lists.find((list) => list.id === selected)
  const save = async (mode: 'publish' | 'draft') => {
    if (pending.current) return
    pending.current = true
    setBusy(mode)
    setError('')
    setNotice('')
    try {
      const imageUrls = [...urls, ...(files.length ? await broadcastApi.upload(token, files) : [])]
      setUrls(imageUrls)
      setFiles([])
      if (mode === 'draft') {
        const id = draftId || crypto.randomUUID()
        setDraftId(id)
        await broadcastApi.saveDraft(token, id, {
          list_id: selected || null,
          title: title.trim(),
          body: body.trim(),
          image_urls: imageUrls
        })
        setDraftId(id)
        setNotice('Draft saved.')
        toast({ title: 'Draft saved', tone: 'success' })
        onSaved()
      } else {
        await broadcastApi.publish(token, {
          list_id: selected,
          title: title.trim(),
          body: body.trim(),
          image_urls: imageUrls
        })
        // Publishing has succeeded. A draft cleanup failure must never encourage a duplicate send.
        setTitle('')
        setBody('')
        setUrls([])
        setDraftId('')
        setNotice('Broadcast published.')
        toast({
          title: 'Broadcast published',
          description: 'Added to eligible customer chats.',
          tone: 'success'
        })
        if (draftId)
          await broadcastApi
            .removeDraft(token, draftId)
            .catch(() =>
              setNotice(
                'Broadcast published. The old draft could not be removed; delete it from History.'
              )
            )
        onPublished()
      }
    } catch (cause) {
      toast({
        title: 'Broadcast could not be saved',
        description: cause instanceof Error ? cause.message : 'Please retry.',
        tone: 'danger'
      })
      setError(
        cause instanceof Error ? cause.message : 'Unable to save your broadcast. Please try again.'
      )
    } finally {
      pending.current = false
      setBusy(null)
    }
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (audience?.customerIds.length && title.trim() && body.trim()) void save('publish')
  }
  return (
    <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <fieldset disabled={busy !== null} className="order-2 min-w-0 space-y-5 lg:order-1">
        <div>
          <h2 className="text-lg font-semibold">Compose broadcast</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Send an update into each eligible customer's existing chat.
          </p>
        </div>
        <Input
          label="Title"
          placeholder="What is your update about?"
          maxLength={100}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Textarea
          label="Message"
          placeholder="Write your update…"
          rows={8}
          maxLength={4000}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <label className="button button-secondary button-sm relative cursor-pointer">
            <ImagePlus className="size-4" aria-hidden="true" />
            Add images
            <input
              aria-label="Attach images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="absolute inset-0 w-full cursor-pointer opacity-0"
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
                if (added.length + files.length + urls.length > 10) {
                  setError('You can attach up to 10 images.')
                  return
                }
                setFiles((current) => [...current, ...added])
                setError('')
              }}
            />
          </label>
          <span>{body.length.toLocaleString()} / 4,000</span>
        </div>
        {(files.length > 0 || urls.length > 0) && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {urls.map((url, index) => (
              <div key={url} className="relative">
                <img
                  src={broadcastMediaUrl(url)}
                  alt={`Attachment ${index + 1}`}
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove attachment ${index + 1}`}
                  onClick={() => setUrls((current) => current.filter((_, i) => i !== index))}
                  className="broadcast-image-remove"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative">
                <LocalImage file={file} />
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  className="broadcast-image-remove"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          JPEG, PNG or WebP · 5 MB each · Up to 10 images
        </p>
      </fieldset>
      <aside className="contents lg:order-2 lg:block lg:min-w-0 lg:space-y-5 lg:border-l lg:border-slate-200 lg:pl-6 dark:lg:border-slate-700">
        <fieldset disabled={busy !== null} className="order-1 grid min-w-0 gap-3">
          <h2 className="text-sm font-semibold">Audience</h2>
          <Combobox
            label="Broadcast list"
            value={selected}
            onChange={onSelect}
            options={lists.map((list) => ({
              value: list.id,
              label: list.name,
              description: `${list.customerIds.length} members`
            }))}
            placeholder="Choose a list"
            disabled={busy !== null}
          />
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {audience ? `${audience.customerIds.length} list members` : 'Select your audience'}
            </span>
            <Button size="sm" variant="quiet" onClick={onCreateList}>
              New list
            </Button>
          </div>
          {audience && !audience.customerIds.length && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Add members to this list before publishing.
            </p>
          )}
        </fieldset>
        <details className="order-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950" open>
          <summary className="cursor-pointer text-sm font-medium">Message preview</summary>
          <div className="mt-3 break-words rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-semibold">{title.trim() || 'Your update title'}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
              {body.trim() || 'Your message will appear here as you write.'}
            </p>
            {files.length + urls.length > 0 && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {files.length + urls.length} image attachment(s)
              </p>
            )}
          </div>
        </details>
        <p className="order-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Broadcasts appear in each eligible customer chat. Their broadcast preferences apply.
        </p>
      </aside>
      <footer className="broadcast-composer-actions order-5 lg:order-3 lg:col-span-2">
        <div className="min-w-0 flex-1 text-sm">
          {error ? (
            <p role="alert" className="text-rose-600 dark:text-rose-300">
              {error}
            </p>
          ) : notice ? (
            <p role="status" className="text-blue-700 dark:text-blue-200">
              {notice}
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              {audience
                ? `${audience.customerIds.length} members in ${audience.name}`
                : 'Choose a list before publishing.'}
            </p>
          )}
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            className="flex-1 sm:flex-none"
            loading={busy === 'draft'}
            disabled={
              busy !== null || (!title.trim() && !body.trim() && !files.length && !urls.length)
            }
            onClick={() => void save('draft')}
          >
            Save draft
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            type="submit"
            variant="primary"
            loading={busy === 'publish'}
            disabled={
              busy !== null || !audience?.customerIds.length || !title.trim() || !body.trim()
            }
          >
            <Send className="size-4" aria-hidden="true" />
            Publish broadcast
          </Button>
        </div>
      </footer>
    </form>
  )
}
