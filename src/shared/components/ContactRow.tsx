import type { ReactNode } from 'react'
import { Avatar } from './Surface'

export function ContactRow({
  name,
  username,
  description,
  selected,
  onSelectedChange,
  trailing,
  descriptionClassName = '',
  className = ''
}: {
  name: string
  username: string
  description?: ReactNode
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  trailing?: ReactNode
  descriptionClassName?: string
  className?: string
}) {
  const content = (
    <>
      {onSelectedChange ? (
        <input
          type="checkbox"
          className="size-4 shrink-0"
          aria-label={name}
          checked={!!selected}
          onChange={(event) => onSelectedChange(event.target.checked)}
        />
      ) : null}
      <Avatar label={name} size={onSelectedChange ? 'sm' : 'md'} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{name}</span>
        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
          @{username}
        </span>
        {description ? (
          <span
            className={`mt-1 block truncate text-[11px] text-slate-500 dark:text-slate-400 ${descriptionClassName}`.trim()}
          >
            {description}
          </span>
        ) : null}
      </span>
      {trailing}
    </>
  )
  const classes =
    `flex min-h-16 items-center gap-3 rounded-[var(--radius-control)] px-2 py-2 ${className}`.trim()
  return onSelectedChange ? (
    <label className={`${classes} cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900`}>
      {content}
    </label>
  ) : (
    <article className={classes}>{content}</article>
  )
}
