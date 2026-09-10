import { Button } from '@shared/components/Button'
import { EmptyState } from '@shared/components/states/EmptyState'
import { ArrowLeft, Bookmark, Flag, Megaphone, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { broadcastApi, broadcastMediaUrl } from './broadcastApi'
import { useAuthSession } from '@/features/authentication/authSession'

export default function UpdatesPage() {
  const { session } = useAuthSession()
  const navigate = useNavigate()
  const [items, setItems] = useState<Awaited<ReturnType<typeof broadcastApi.all>>>([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'saved'>('all')
  const reload = () => broadcastApi.all(session!.token).then(setItems)
  useEffect(() => {
    void broadcastApi
      .all(session!.token)
      .then(setItems)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load updates.')
      )
  }, [session])
  return (
    <main className="app-canvas min-h-dvh p-3 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <header className="app-panel flex items-center gap-3 p-5">
          <Button variant="quiet" onClick={() => void navigate('/app/chats')}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Megaphone />
          <div>
            <p className="text-xs font-bold uppercase text-blue-600">Customer inbox</p>
            <h1 className="text-2xl font-bold">Updates</h1>
          </div>
        </header>
        {error ? (
          <p role="alert" className="mt-3 rounded-2xl border border-red-300 p-4 text-red-700">
            {error}
          </p>
        ) : null}
        <section className="mt-3 grid gap-3">
          <div className="flex gap-2">
            {(['all', 'unread', 'saved'] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={filter === value ? 'primary' : 'quiet'}
                onClick={() => setFilter(value)}
              >
                {value[0]!.toUpperCase() + value.slice(1)}
              </Button>
            ))}
          </div>
          {items.filter(
            (item) =>
              filter === 'all' ||
              (filter === 'unread' && !item.readAt) ||
              (filter === 'saved' && item.saved)
          ).length ? (
            items
              .filter(
                (item) =>
                  filter === 'all' ||
                  (filter === 'unread' && !item.readAt) ||
                  (filter === 'saved' && item.saved)
              )
              .map((item) => (
                <article key={item.id} className="app-panel overflow-hidden p-5">
                  <p className="text-xs font-bold uppercase text-blue-600">
                    {item.businessName ?? 'Business update'}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{item.title}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.body}
                  </p>
                  {item.imageUrls.length ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {item.imageUrls.map((url) => (
                        <img
                          key={url}
                          src={broadcastMediaUrl(url)}
                          alt=""
                          className="aspect-square rounded-2xl border border-slate-300 object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() =>
                        void broadcastApi
                          .state(session!.token, item.id, { saved: !item.saved })
                          .then(reload)
                      }
                    >
                      <Bookmark className="size-4" />
                      {item.saved ? 'Unsave' : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() =>
                        void broadcastApi
                          .mute(session!.token, item.businessId, !item.muted)
                          .then(reload)
                      }
                    >
                      <VolumeX className="size-4" />
                      {item.muted ? 'Unmute' : 'Mute business'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={item.reported}
                      onClick={() =>
                        void broadcastApi
                          .state(session!.token, item.id, { reported: true })
                          .then(reload)
                      }
                    >
                      <Flag className="size-4" />
                      {item.reported ? 'Reported' : 'Report'}
                    </Button>
                    {!item.readAt ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          void broadcastApi
                            .state(session!.token, item.id, { read: true })
                            .then(reload)
                        }
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                  <time className="mt-4 block text-xs text-slate-500">
                    {item.publishedAt.toLocaleString()}
                  </time>
                </article>
              ))
          ) : (
            <EmptyState
              title="No updates yet"
              description="Broadcasts from connected businesses will appear here."
            />
          )}
        </section>
      </div>
    </main>
  )
}
