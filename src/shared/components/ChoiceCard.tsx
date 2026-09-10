import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

interface ChoiceCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  title: string
  description: string
  icon: LucideIcon
  selected?: boolean
  meta?: string
}

export function ChoiceCard({
  className = '',
  description,
  icon: Icon,
  meta,
  selected = false,
  title,
  ...props
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`choice-card ${selected ? 'choice-card-selected' : ''} ${className}`}
      {...props}
    >
      <span className="choice-card-icon" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-bold">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>
      {meta ? <span className="text-[10px] font-semibold text-slate-400">{meta}</span> : null}
    </button>
  )
}
