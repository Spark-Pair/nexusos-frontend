import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react'

interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  title?: string
  description?: string
  action?: ReactNode
  interactive?: boolean
}

export function Card({
  action,
  children,
  className = '',
  description,
  interactive = false,
  title,
  ...props
}: CardProps) {
  return (
    <section
      className={`rounded-[var(--radius-surface)] border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 ${interactive ? 'spring-interaction cursor-pointer transition duration-200  hover:border-blue-300   dark:hover:border-blue-800' : ''} ${className}`}
      {...props}
    >
      {(Boolean(title) || Boolean(description) || Boolean(action)) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>}
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

type AlertTone = 'info' | 'success' | 'warning' | 'danger'
const alertStyles: Record<AlertTone, string> = {
  info: 'border-blue-300 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
  warning:
    'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
  danger:
    'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100'
}

export function Alert({
  children,
  title,
  tone = 'info'
}: PropsWithChildren<{ title: string; tone?: AlertTone }>) {
  return (
    <div
      className={`rounded-[var(--radius-surface)] border p-4 ${alertStyles[tone]}`}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-1 text-sm opacity-80">{children}</div>
    </div>
  )
}

export function Avatar({
  label,
  size = 'md',
  src
}: {
  label: string
  size?: 'sm' | 'md' | 'lg'
  src?: string
}) {
  const sizeClass =
    size === 'sm' ? 'size-8 text-xs' : size === 'lg' ? 'size-16 text-lg' : 'size-11 text-sm'
  const initials = label
    .split(/\s+/u)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
  return src ? (
    <img className={`${sizeClass} rounded-full object-cover`} src={src} alt={label} />
  ) : (
    <span
      aria-label={label}
      className={`${sizeClass} inline-grid place-items-center rounded-full border border-slate-200 bg-slate-100 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200`}
    >
      {initials}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  )
}
