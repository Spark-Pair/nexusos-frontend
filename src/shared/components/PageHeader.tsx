import type { PropsWithChildren, ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className = '',
  children
}: PropsWithChildren<{
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  className?: string
}>) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="min-w-0">
        {eyebrow ? <p className="page-header-eyebrow">{eyebrow}</p> : null}
        <h1 className="page-header-title">{title}</h1>
        {description ? <p className="page-header-description">{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
      {children}
    </header>
  )
}
