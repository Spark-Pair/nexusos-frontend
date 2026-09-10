import { AppIcon } from './AppIcon'

interface SearchFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchField({ label, onChange, placeholder = 'Search', value }: SearchFieldProps) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <AppIcon
        name="search"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-[var(--radius-control)] border border-slate-300 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:focus:bg-slate-950"
      />
    </label>
  )
}
