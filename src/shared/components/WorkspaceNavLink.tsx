import type { LucideIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { haptic } from '@/shared/motion/haptics'

export function WorkspaceNavLink({
  to,
  icon: Icon,
  active = false,
  children,
  className = '',
  onClick
}: PropsWithChildren<{
  to: string
  icon: LucideIcon
  active?: boolean
  className?: string
  onClick?: () => void
}>) {
  return (
    <Link
      to={to}
      onClick={() => {
        haptic('light')
        onClick?.()
      }}
      aria-current={active ? 'page' : undefined}
      className={`workspace-nav-link ${active ? 'workspace-nav-link-active' : ''} ${className}`.trim()}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      {children}
    </Link>
  )
}
