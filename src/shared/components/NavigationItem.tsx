import { NavLink } from 'react-router'
interface NavigationItemProps {
  to: string
  label: string
  compact?: boolean
  end?: boolean
  onNavigate?: () => void
}
export function NavigationItem({
  compact = false,
  end = false,
  label,
  onNavigate,
  to
}: NavigationItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-11 items-center rounded-xl px-3 text-sm font-medium ${compact ? 'justify-center' : 'gap-3'} ${isActive ? 'bg-cyan-50 text-cyan-900 ring-1 ring-cyan-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`
      }
      aria-label={label}
      onClick={onNavigate}
    >
      {label}
    </NavLink>
  )
}
