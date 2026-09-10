import { Button } from '@shared/components/Button'
import { SearchField } from '@shared/components/SearchField'
import { Avatar } from '@shared/components/Surface'
import { useToast } from '@shared/components/toastContext'
import { useRef, useState } from 'react'
import type { DirectoryProfile } from './messagingApi'

export function ConnectionsPanel({
  profiles,
  actorKind,
  onSearch,
  onInvite
}: {
  profiles: DirectoryProfile[]
  actorKind: 'customer' | 'business'
  onSearch: (query: string) => Promise<void>
  onInvite: (id: string, message: string) => Promise<void>
}) {
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('Hello! I would like to connect with you on NexusOS.')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const pending = useRef(false)
  const toast = useToast()
  const run = async (id: string, action: () => Promise<void>) => {
    if (pending.current) return
    pending.current = true
    setBusy(id)
    setError('')
    try {
      await action()
    } catch (cause) {
      const text = cause instanceof Error ? cause.message : 'Please try again.'
      setError(text)
      toast({
        title: id === 'search' ? 'Search failed' : 'Invitation not sent',
        description: text,
        tone: 'danger'
      })
    } finally {
      pending.current = false
      setBusy('')
    }
  }
  return (
    <section aria-label="Find connections" className="space-y-4">
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void run('search', async () => {
            await onSearch(query.trim())
            setSearched(true)
          })
        }}
      >
        <div className="min-w-0 flex-1">
          <SearchField
            label="Search accounts"
            placeholder="Exact customer ID or username"
            value={query}
            onChange={setQuery}
          />
        </div>
        <Button type="submit" loading={busy === 'search'} disabled={!!busy || !query.trim()}>
          Find
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-300">
          {error}
        </p>
      )}
      <label className="block text-sm font-medium">
        Invitation message
        <textarea
          className="field-control mt-2 min-h-24 resize-y"
          maxLength={4000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>
      {profiles.map((profile) => (
        <article
          key={profile.id}
          className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900"
        >
          <Avatar label={profile.name} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{profile.name}</h3>
            <p className="text-xs text-slate-500">@{profile.username}</p>
          </div>
          {actorKind === 'business' && (
            <Button
              loading={busy === profile.id}
              disabled={!!busy || !message.trim()}
              onClick={() => void run(profile.id, () => onInvite(profile.id, message.trim()))}
            >
              Invite
            </Button>
          )}
        </article>
      ))}
      {!profiles.length && (
        <p className="py-5 text-center text-sm text-slate-500">
          {searched
            ? 'No customer found. Check the exact username or ID.'
            : 'Find a customer using their complete NexusOS ID or username.'}
        </p>
      )}
    </section>
  )
}
