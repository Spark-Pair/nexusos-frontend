import type { PropsWithChildren, ReactNode } from 'react'

export function ApplicationFrame({
  sidebar,
  children,
  className = ''
}: PropsWithChildren<{ sidebar: ReactNode; className?: string }>) {
  return (
    <div data-mobile-swipe className={`app-canvas application-frame ${className}`.trim()}>
      {sidebar}
      {children}
    </div>
  )
}
