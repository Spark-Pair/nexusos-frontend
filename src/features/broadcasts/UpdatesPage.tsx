import { BroadcastFeedCard } from '@shared/components/BroadcastFeedCard'
import { Button } from '@shared/components/Button'
import { PageHeader } from '@shared/components/PageHeader'
import { EmptyState } from '@shared/components/states/EmptyState'
import { ErrorState } from '@shared/components/states/ErrorState'
import { ArrowLeft, Bookmark, Flag, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { broadcastApi } from './broadcastApi'
import { useAuthSession } from '@/features/authentication/authSession'
import { cacheMediaUrls, useMediaUrl } from '@/features/chats/mediaCache'

function CachedBroadcastImage({ path, actorId }: { path: string; actorId: string }) {
  const src = useMediaUrl(path, actorId)
  return (
    <img
      src={src}
      alt=""
      className="aspect-square rounded-2xl border border-slate-300 object-cover"
    />
  )
}

export default function UpdatesPage() {
  const { session } = useAuthSession()
  const navigate = useNavigate()
  const [items, setItems] = useState<Awaited<ReturnType<typeof broadcastApi.all>>>([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'saved'>('all')
  const reload = () =>
    broadcastApi.all(session!.token).then((next) => {
      setItems(next)
      void cacheMediaUrls(
        next.flatMap((item) => item.imageUrls),
        session!.data.id
      )
    })
  useEffect(() => {
    void broadcastApi
      .all(session!.token)
      .then((next) => {
        setItems(next)
        void cacheMediaUrls(
          next.flatMap((item) => item.imageUrls),
          session!.data.id
        )
      })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load updates.')
      )
  }, [session])
  return (
    <main className="app-canvas min-h-dvh p-3 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          className="app-panel p-5"
          title="Updates"
          eyebrow="Customer inbox"
          actions={
            <Button variant="quiet" onClick={() => void navigate('/app/chats')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          }
        />
        {error ? (
          <ErrorState
            compact
            title="Updates could not load"
            description={error}
            actionLabel="Retry"
            onAction={() =>
              void reload().catch((cause: unknown) =>
                setError(cause instanceof Error ? cause.message : 'Unable to load updates.')
              )
            }
          />
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
                <BroadcastFeedCard
                  key={item.id}
                  business={item.businessName ?? 'Business update'}
                  title={item.title}
                  body={item.body}
                  publishedAt={item.publishedAt.toLocaleString()}
                  media={item.imageUrls.map((url) => (
                    <CachedBroadcastImage key={url} path={url} actorId={session!.data.id} />
                  ))}
                  actions={
                    <>
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
                    </>
                  }
                />
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
