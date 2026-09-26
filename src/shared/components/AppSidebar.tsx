import type { PropsWithChildren, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { haptic } from '@/shared/motion/haptics'

export function AppSidebar({
  brandHref,
  brandLabel = 'NexusOS',
  children,
  footer,
  navigationLabel = 'Workspace',
  roleLabel
}: PropsWithChildren<{
  brandHref: string
  brandLabel?: string
  footer?: ReactNode
  navigationLabel?: string
  roleLabel: string
}>) {
  return (
    <aside className="workspace-sidebar">
      <Link
        to={brandHref}
        onClick={() => haptic('light')}
        className="flex items-center gap-3 px-2 py-3"
      >
        <span className="brand-mark">N</span>
        <span className="text-sm font-semibold">
          {brandLabel}
          <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
            {roleLabel}
          </span>
        </span>
      </Link>
      <nav aria-label={navigationLabel} className="mt-7 grid gap-1">
        {children}
      </nav>
      {footer ? (
        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">{footer}</div>
      ) : null}
    </aside>
  )
}
