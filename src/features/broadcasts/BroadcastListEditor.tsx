import { Button } from '@shared/components/Button'
import { Dialog } from '@shared/components/Dialog'
import { Input } from '@shared/components/FormControls'
import { SearchField } from '@shared/components/SearchField'
import { Avatar } from '@shared/components/Surface'
import { useToast } from '@shared/components/toastContext'
import { useCallback, useRef, useState, type FormEvent } from 'react'
import type { BroadcastCustomer, BroadcastList } from './broadcastApi'

export function BroadcastListEditor({
  list,
  customers,
  customerError,
  lists = [],
  loading = false,
  onRetry,
  onClose,
  onSave
}: {
  list: BroadcastList | null
  customers: BroadcastCustomer[]
  customerError: string
  lists?: BroadcastList[]
  loading?: boolean
  onRetry: () => void
  onClose: () => void
  onSave: (name: string, ids: string[]) => Promise<void>
}) {
  const [name, setName] = useState(list?.name ?? '')
  const toast = useToast()
  const [ids, setIds] = useState(list?.customerIds ?? [])
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  const close = useCallback(() => {
    if (!pending.current) onClose()
  }, [onClose])
  const visible = customers.filter((customer) =>
    `${customer.name} ${customer.username}`.toLowerCase().includes(query.trim().toLowerCase())
  )
  const memberships = (customerId: string) =>
    lists.filter((item) => item.id !== list?.id && item.customerIds.includes(customerId))
  const allSelected = visible.length > 0 && visible.every((customer) => ids.includes(customer.id))
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending.current) return
    if (!name.trim()) {
      setError('Give your list a name.')
      return
    }
    pending.current = true
    setSaving(true)
    setError('')
    try {
      await onSave(name.trim(), ids)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save list. Please try again.')
      toast({
        title: 'List could not be saved',
        description: cause instanceof Error ? cause.message : 'Please try again.',
        tone: 'danger'
      })
    } finally {
      pending.current = false
      setSaving(false)
    }
  }
  return (
    <Dialog
      open
      title={list ? 'Edit broadcast list' : 'Create broadcast list'}
      description="Keep a reusable audience for your business updates."
      onClose={close}
      initialFocusSelector='input[name="list-name"]'
    >
      <form onSubmit={(event) => void submit(event)} className="grid gap-5">
        <fieldset disabled={saving} className="grid min-w-0 gap-5">
          <Input
            name="list-name"
            label="List name"
            placeholder="e.g. Regular customers"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Members</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {ids.length} selected
              </span>
            </div>
            {loading ? (
              <p role="status" className="py-4 text-sm text-slate-500 dark:text-slate-400">
                Loading members...
              </p>
            ) : customerError ? (
              <div role="alert" className="text-sm text-rose-600 dark:text-rose-300">
                {customerError}{' '}
                <Button size="sm" onClick={onRetry}>
                  Retry members
                </Button>
              </div>
            ) : (
              <>
                <SearchField
                  label="Search members"
                  placeholder="Search name or username"
                  value={query}
                  onChange={setQuery}
                />
                {visible.length > 0 && (
                  <label className="flex min-h-11 items-center gap-3 border-b border-slate-200 text-sm dark:border-slate-700">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={allSelected}
                      onChange={() =>
                        setIds((current) =>
                          allSelected
                            ? current.filter(
                                (id) => !visible.some((customer) => customer.id === id)
                              )
                            : [...new Set([...current, ...visible.map((customer) => customer.id)])]
                        )
                      }
                    />
                    Select all shown
                  </label>
                )}
                <div
                  className="max-h-[32dvh] overflow-y-auto overscroll-contain"
                  aria-label="Available members"
                >
                  {visible.map((customer) => (
                    <label
                      key={customer.id}
                      className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <input
                        type="checkbox"
                        className="size-4 shrink-0"
                        aria-label={customer.name}
                        checked={ids.includes(customer.id)}
                        onChange={(event) =>
                          setIds((current) =>
                            event.target.checked
                              ? [...current, customer.id]
                              : current.filter((id) => id !== customer.id)
                          )
                        }
                      />
                      <Avatar label={customer.name} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{customer.name}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          @{customer.username}
                        </span>
                        {memberships(customer.id).length ? (
                          <span className="mt-1 block truncate text-[11px] text-blue-600 dark:text-blue-300">
                            Already in:{' '}
                            {memberships(customer.id)
                              .map((item) => item.name)
                              .join(', ')}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                  {!visible.length && (
                    <p className="py-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {customers.length
                        ? 'No members match your search.'
                        : 'No connected customers yet. You can create an empty list and add members after they accept your chat invitation.'}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-rose-600 dark:text-rose-300">
            {error}
          </p>
        )}
        <footer className="sticky -bottom-5 -mx-5 flex justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-950">
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} disabled={loading}>
            {list ? 'Save changes' : 'Create list'}
          </Button>
        </footer>
      </form>
    </Dialog>
  )
}
