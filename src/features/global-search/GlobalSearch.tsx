import { useAuth } from '@app/auth/useAuth'
import { useAppServices } from '@app/providers/useAppServices'
import { appRoutes, buildPath, type RouteArea } from '@app/routing/routes'
import { Dialog } from '@shared/components/Dialog'
import { EmptyState } from '@shared/components/states/EmptyState'
import { useUiStore } from '@shared/store/uiStore'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

const areaForIdentity: Record<string, readonly RouteArea[]> = {
  customer: ['customer'],
  business_owner: ['business'],
  business_employee: ['business'],
  platform_admin: ['admin'],
  guest: ['public', 'authentication']
}
export function GlobalSearch() {
  const open = useUiStore((state) => state.searchOpen)
  const setOpen = useUiStore((state) => state.setSearchOpen)
  const { session } = useAuth()
  const { searchHistory } = useAppServices()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [revision, setRevision] = useState(0)
  const scope = useMemo(
    () => ({
      accountId: session.account?.id ?? 'guest',
      ...(session.workspace ? { workspaceId: session.workspace.id } : {}),
      area: session.identityKey
    }),
    [session]
  )
  const records = useMemo(
    () =>
      appRoutes.filter(
        (route) =>
          areaForIdentity[session.identityKey]?.includes(route.area) &&
          (!route.permission || session.permissions.includes(route.permission))
      ),
    [session]
  )
  const results = records
    .filter((route) => route.title.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 8)
  const recent = searchHistory.list(scope)
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setOpen])
  const choose = (path: string, title: string) => {
    searchHistory.record(scope, title)
    setRevision((value) => value + 1)
    setOpen(false)
    setQuery('')
    void navigate(
      buildPath(
        { id: 'result', path, title, area: 'public' },
        {
          businessId: session.workspace?.id ?? 'demo-studio-one',
          productId: 'demo-product',
          updateId: 'demo-update',
          orderId: 'demo-order',
          conversationId: 'demo-conversation',
          customerId: 'demo-customer',
          segmentId: 'demo-segment',
          campaignId: 'demo-campaign',
          providerKey: 'demo-provider',
          membershipId: 'demo-membership',
          userId: 'demo-user',
          planId: 'demo-plan',
          reportId: 'demo-report'
        }
      )
    )
  }
  return (
    <Dialog
      open={open}
      title="Search NexusOS routes"
      initialFocusSelector='[aria-label="Search routes"]'
      description="Phase 2 searches navigation only. Product data search comes later."
      onClose={() => {
        setOpen(false)
        setQuery('')
        setActive(0)
      }}
    >
      <input
        aria-label="Search routes"
        className="min-h-11 w-full rounded-xl border border-slate-300 px-3"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((value) => Math.min(value + 1, results.length - 1))
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((value) => Math.max(value - 1, 0))
          }
          if (event.key === 'Enter' && results[active])
            choose(results[active].path, results[active].title)
        }}
      />
      <div className="mt-4" aria-live="polite">
        {results.length ? (
          <ul className="space-y-1" aria-label="Search results">
            {results.map((route, index) => (
              <li key={route.id}>
                <button
                  className={`min-h-11 w-full rounded-xl px-3 text-left text-sm ${index === active ? 'bg-cyan-50 text-cyan-900' : 'hover:bg-slate-100'}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(route.path, route.title)}
                >
                  {route.title}
                  <span className="block text-xs text-slate-500">{route.group ?? route.area}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No routes found" description="Try another navigation term." />
        )}
      </div>
      {recent.length > 0 && (
        <section className="mt-5 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent searches</h3>
            <button
              className="min-h-11 text-sm text-cyan-800"
              onClick={() => {
                searchHistory.clear(scope)
                setRevision((value) => value + 1)
              }}
            >
              Clear recent searches
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {recent.map((item) => (
              <li key={`${revision}-${item}`}>
                <button
                  className="rounded-full bg-slate-100 px-3 py-2 text-sm"
                  onClick={() => setQuery(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Dialog>
  )
}
