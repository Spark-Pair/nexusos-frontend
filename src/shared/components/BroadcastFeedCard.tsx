import type { ReactNode } from 'react'

export function BroadcastFeedCard({
  business,
  title,
  body,
  media,
  actions,
  publishedAt
}: {
  business: string
  title: string
  body: string
  media?: ReactNode
  actions?: ReactNode
  publishedAt: string
}) {
  return (
    <article className="app-panel overflow-hidden p-5">
      <p className="text-xs font-bold uppercase text-blue-600">{business}</p>
      <h2 className="mt-1 text-xl font-bold">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
        {body}
      </p>
      {media ? <div className="mt-4 grid grid-cols-2 gap-2">{media}</div> : null}
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
      <time className="mt-4 block text-xs text-slate-500">{publishedAt}</time>
    </article>
  )
}
