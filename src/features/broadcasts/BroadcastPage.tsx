import { Button } from '@shared/components/Button'
import { Dialog } from '@shared/components/Dialog'
import { IconButton } from '@shared/components/IconButton'
import { SearchField } from '@shared/components/SearchField'
import { EmptyState } from '@shared/components/states/EmptyState'
import { useToast } from '@shared/components/toastContext'
import { WorkspaceShell } from '@shared/components/WorkspaceShell'
import { History, ListChecks, Megaphone, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  broadcastApi,
  type BroadcastList,
  type BroadcastDraft,
  type BroadcastCustomer,
  type Broadcast
} from './broadcastApi'
import { BroadcastComposer } from './BroadcastComposer'
import { BroadcastListEditor } from './BroadcastListEditor'
import { useAuthSession } from '@/features/authentication/authSession'

const views = [
  { id: 'lists', label: 'Lists', icon: ListChecks },
  { id: 'compose', label: 'Compose', icon: Megaphone },
  { id: 'history', label: 'History', icon: History }
]
const message = (cause: unknown) =>
  cause instanceof Error ? cause.message : 'Unable to load data. Please try again.'

export default function BroadcastPage() {
  const { session } = useAuthSession()
  const toast = useToast()
  const token = session!.token
  const [params, setParams] = useSearchParams()
  const view = views.some((item) => item.id === params.get('view')) ? params.get('view')! : 'lists'
  const [lists, setLists] = useState<BroadcastList[]>([])
  const [customers, setCustomers] = useState<BroadcastCustomer[]>([])
  const [items, setItems] = useState<Broadcast[]>([])
  const [drafts, setDrafts] = useState<BroadcastDraft[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<BroadcastList | null | undefined>()
  const [selected, setSelected] = useState('')
  const [draft, setDraft] = useState<BroadcastDraft | null>(null)
  const [composerVersion, setComposerVersion] = useState(0)
  const [notice, setNotice] = useState('')
  const [deleting, setDeleting] = useState<{
    id: string
    name: string
    kind: 'list' | 'draft'
  } | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const deletePending = useRef(false)
  const generation = useRef(0)
  const load = useCallback(async () => {
    const version = ++generation.current
    setLoading(true)
    const results = await Promise.allSettled([
      broadcastApi.lists(token),
      broadcastApi.customers(token),
      broadcastApi.all(token),
      broadcastApi.drafts(token)
    ])
    if (version !== generation.current) return
    const [nextLists, nextCustomers, nextItems, nextDrafts] = results
    const failures: Record<string, string> = {}
    if (nextLists.status === 'fulfilled') setLists(nextLists.value)
    else failures.lists = message(nextLists.reason)
    if (nextCustomers.status === 'fulfilled') setCustomers(nextCustomers.value)
    else failures.customers = message(nextCustomers.reason)
    if (nextItems.status === 'fulfilled') setItems(nextItems.value)
    else failures.history = message(nextItems.reason)
    if (nextDrafts.status === 'fulfilled') setDrafts(nextDrafts.value)
    else failures.drafts = message(nextDrafts.reason)
    setErrors(failures)
    setLoading(false)
  }, [token])
  const invalidateRequests = useCallback(() => {
    generation.current++
  }, [])
  useEffect(() => {
    void load()
    return invalidateRequests
  }, [load, invalidateRequests])
  const closeEditor = useCallback(() => setEditor(undefined), [])
  const closeDelete = useCallback(() => {
    if (!deletePending.current) setDeleting(null)
  }, [])
  const changeView = (next: string) => setParams({ view: next })
  const saveList = async (name: string, ids: string[]) => {
    const saved = editor
      ? await broadcastApi.updateList(token, editor.id, name, ids)
      : await broadcastApi.createList(token, name, ids)
    setLists((current) => [saved, ...current.filter((list) => list.id !== saved.id)])
    setSelected(saved.id)
    setEditor(undefined)
    setNotice(editor ? 'Broadcast list updated.' : 'Broadcast list created.')
    toast({ title: editor ? 'List updated' : 'List created', tone: 'success' })
  }
  const remove = async () => {
    if (!deleting || deletePending.current) return
    deletePending.current = true
    setDeleteBusy(true)
    setDeleteError('')
    try {
      if (deleting.kind === 'list') {
        await broadcastApi.removeList(token, deleting.id)
        setLists((current) => current.filter((list) => list.id !== deleting.id))
        setItems((current) => current.filter((item) => item.listId !== deleting.id))
        setDrafts((current) =>
          current.map((item) => (item.listId === deleting.id ? { ...item, listId: null } : item))
        )
        if (selected === deleting.id) setSelected('')
      } else {
        await broadcastApi.removeDraft(token, deleting.id)
        setDrafts((current) => current.filter((item) => item.id !== deleting.id))
        if (draft?.id === deleting.id) {
          setDraft(null)
          setComposerVersion((current) => current + 1)
        }
      }
      setNotice(deleting.kind === 'list' ? 'Broadcast list deleted.' : 'Draft deleted.')
      toast({ title: deleting.kind === 'list' ? 'List deleted' : 'Draft deleted', tone: 'success' })
      setDeleting(null)
    } catch (cause) {
      setDeleteError(message(cause))
      toast({ title: 'Delete failed', description: message(cause), tone: 'danger' })
    } finally {
      deletePending.current = false
      setDeleteBusy(false)
    }
  }
  const visible = lists.filter((list) =>
    list.name.toLowerCase().includes(query.trim().toLowerCase())
  )
  const showError = (key: string) =>
    errors[key] ? (
      <div
        role="alert"
        className="mb-4 flex flex-wrap items-center gap-3 text-sm text-rose-600 dark:text-rose-300"
      >
        <span>{errors[key]}</span>
        <Button size="sm" onClick={() => void load()} disabled={loading}>
          Retry
        </Button>
      </div>
    ) : null
  return (
    <WorkspaceShell
      accountName={session!.data.name}
      navigation={views.map((item) => (
        <Link
          key={item.id}
          to={`/business/broadcasts?view=${item.id}`}
          aria-current={view === item.id ? 'page' : undefined}
          className={`workspace-nav-link ${view === item.id ? 'workspace-nav-link-active' : ''}`}
        >
          <item.icon className="size-[18px]" aria-hidden="true" />
          {item.id === 'lists'
            ? 'Broadcast lists'
            : item.id === 'compose'
              ? 'New broadcast'
              : 'Broadcast history'}
        </Link>
      ))}
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Broadcasts</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage lists and send broadcasts directly to customer chats.
          </p>
        </div>
        {view !== 'compose' && (
          <Button variant="primary" onClick={() => setEditor(null)}>
            <Plus className="size-4" aria-hidden="true" />
            Create list
          </Button>
        )}
      </header>
      {notice && (
        <div
          role="status"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200"
        >
          <span>{notice}</span>
          <Button size="sm" variant="quiet" onClick={() => setNotice('')}>
            Dismiss
          </Button>
        </div>
      )}
      <div hidden={view !== 'lists'}>
        <section className="broadcast-surface">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4 sm:p-5 dark:border-slate-700">
            <h2 className="text-base font-semibold">
              Broadcast lists{' '}
              <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">
                {lists.length}
              </span>
            </h2>
            <div className="w-full sm:w-72">
              <SearchField
                label="Search lists"
                placeholder="Search lists"
                value={query}
                onChange={setQuery}
              />
            </div>
          </div>
          <div className="p-4 sm:p-5">
            {showError('lists')}
            {loading ? (
              <p
                role="status"
                className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Loading broadcast lists...
              </p>
            ) : visible.length ? (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {visible.map((list) => (
                  <li
                    key={list.id}
                    className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <span className="hidden size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:text-slate-400 sm:grid dark:bg-slate-800">
                      <ListChecks className="size-5" aria-hidden="true" />
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditor(list)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm font-semibold">{list.name}</span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                        {list.customerIds.length} members &middot; Updated{' '}
                        {list.updatedAt.toLocaleDateString()}
                      </span>
                    </button>
                    <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
                      <Button
                        size="sm"
                        disabled={!list.customerIds.length}
                        onClick={() => {
                          setSelected(list.id)
                          changeView('compose')
                        }}
                      >
                        <Send className="size-4" aria-hidden="true" />
                        Use list
                      </Button>
                      <IconButton
                        label={`Edit ${list.name}`}
                        variant="quiet"
                        icon={<Pencil className="size-4" />}
                        onClick={() => setEditor(list)}
                      />
                      <IconButton
                        label={`Delete ${list.name}`}
                        variant="quiet"
                        icon={<Trash2 className="size-4" />}
                        onClick={() => {
                          setDeleteError('')
                          setDeleting({ id: list.id, name: list.name, kind: 'list' })
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              !errors.lists && (
                <EmptyState
                  title={query ? 'No matching lists' : 'Your audience starts here'}
                  description={
                    query
                      ? 'Try a different list name.'
                      : 'Create a list, choose your customers, and reuse it whenever you have an update.'
                  }
                  actionLabel={query ? 'Clear search' : 'Create your first list'}
                  onAction={() => (query ? setQuery('') : setEditor(null))}
                />
              )
            )}
          </div>
        </section>
      </div>
      <div hidden={view !== 'compose'}>
        <section className="broadcast-surface p-4 sm:p-6">
          {showError('lists')}
          <BroadcastComposer
            key={composerVersion}
            token={token}
            lists={lists}
            selected={selected}
            onSelect={setSelected}
            draft={draft}
            onCreateList={() => setEditor(null)}
            onSaved={() => void load()}
            onPublished={() => void load()}
          />
        </section>
      </div>
      <div hidden={view !== 'history'}>
        <section className="broadcast-surface p-4 sm:p-6">
          <h2 className="mb-5 text-base font-semibold">Broadcast history</h2>
          {showError('history')}
          {showError('drafts')}
          {loading ? (
            <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
              Loading history...
            </p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {drafts.map((item) => (
                <article key={item.id} className="flex flex-wrap items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Draft &middot; {item.updatedAt.toLocaleDateString()}
                    </span>
                    <h3 className="mt-1 truncate text-sm font-medium">
                      {item.title || 'Untitled draft'}
                    </h3>
                    <p className="mt-1 line-clamp-2 break-words text-sm text-slate-500 dark:text-slate-400">
                      {item.body}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setDraft(item)
                      setSelected(item.listId ?? '')
                      setComposerVersion((current) => current + 1)
                      changeView('compose')
                    }}
                  >
                    Continue editing
                  </Button>
                  <IconButton
                    label={`Delete draft ${item.title || 'Untitled draft'}`}
                    variant="quiet"
                    icon={<Trash2 className="size-4" />}
                    onClick={() => {
                      setDeleteError('')
                      setDeleting({
                        id: item.id,
                        name: item.title || 'Untitled draft',
                        kind: 'draft'
                      })
                    }}
                  />
                </article>
              ))}
              {items.map((item) => (
                <article key={item.id} className="py-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Published &middot; {item.publishedAt.toLocaleString()}
                  </p>
                  <h3 className="mt-1 break-words text-sm font-medium">{item.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {item.body}
                  </p>
                </article>
              ))}
              {!items.length && !drafts.length && !errors.history && !errors.drafts && (
                <EmptyState
                  title="No broadcasts yet"
                  description="Saved drafts and published updates will appear here."
                  actionLabel="Compose a broadcast"
                  onAction={() => changeView('compose')}
                />
              )}
            </div>
          )}
        </section>
      </div>
      {editor !== undefined && (
        <BroadcastListEditor
          list={editor}
          customers={customers}
          customerError={errors.customers ?? ''}
          loading={loading}
          onRetry={() => void load()}
          onClose={closeEditor}
          onSave={saveList}
        />
      )}
      <Dialog
        open={deleting !== null}
        title={deleting?.kind === 'list' ? 'Delete broadcast list?' : 'Delete draft?'}
        onClose={closeDelete}
      >
        <p className="break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
          {deleting?.kind === 'list'
            ? `Deleting "${deleting.name}" also removes its published broadcasts from history and customer chats. Customers themselves will not be deleted.`
            : `"${deleting?.name ?? ''}" will be permanently removed.`}
        </p>
        {deleteError && (
          <p role="alert" className="mt-3 text-sm text-rose-600">
            {deleteError}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button disabled={deleteBusy} onClick={closeDelete}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleteBusy} onClick={() => void remove()}>
            Delete {deleting?.kind === 'list' ? 'list' : 'draft'}
          </Button>
        </div>
      </Dialog>
    </WorkspaceShell>
  )
}
