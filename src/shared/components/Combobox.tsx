import { Check } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FieldFrame, FieldMessageButton } from './Field'
import { fieldControlState, resolveFieldMessage } from './fieldStyles'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}
interface ComboboxProps {
  label: string
  options: readonly ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  error?: string | undefined
  warning?: string | undefined
  disabled?: boolean
  optional?: boolean
  className?: string
  dropdownPlacement?: 'top' | 'bottom'
}

export function Combobox({
  className = '',
  disabled = false,
  dropdownPlacement = 'bottom',
  error,
  hint,
  label,
  onChange,
  optional = false,
  options,
  placeholder = 'Choose an option',
  value,
  warning
}: ComboboxProps) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const selected = options.find((option) => option.value === value)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const activeMessage = resolveFieldMessage({ error, hint, warning })

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    if (!term) return options
    return options.filter((option) =>
      `${option.label} ${option.description ?? ''}`.toLocaleLowerCase().includes(term)
    )
  }, [options, query])

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const frame = window.requestAnimationFrame(() => search.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  const choose = (option: ComboboxOption) => {
    onChange(option.value)
    setOpen(false)
  }

  return (
    <div ref={root} className={`relative ${className}`}>
      <FieldFrame inputId={id} label={label} optional={optional}>
        <div className="relative flex items-center">
          <button
            type="button"
            role="combobox"
            aria-labelledby={`${id}-label`}
            aria-controls={`${id}-listbox`}
            aria-expanded={open}
            disabled={disabled}
            className={`field-control flex items-center justify-between pr-11 text-left ${fieldControlState(activeMessage)}`}
            onClick={() => setOpen((current) => !current)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setOpen(true)
              }
            }}
          >
            <span className={selected ? 'text-slate-950 dark:text-white' : 'text-slate-400'}>
              {selected?.label ?? placeholder}
            </span>
          </button>

          {activeMessage && (
            <div className="absolute right-3">
              <FieldMessageButton id={`${id}-message`} label={label} message={activeMessage} />
            </div>
          )}
        </div>
      </FieldFrame>

      <>
        {open && !disabled && (
          <div
            className={`floating-panel absolute left-0 right-0 z-50 p-2 ${
              dropdownPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            <div className="relative mb-1.5">
              <input
                ref={search}
                aria-label={`Search ${label}`}
                className="min-h-11 w-full rounded-[var(--radius-control)] border border-slate-300 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder={`Search ${label.toLocaleLowerCase()}…`}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setActiveIndex((index) => Math.min(index + 1, filtered.length - 1))
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    setActiveIndex((index) => Math.max(index - 1, 0))
                  } else if (event.key === 'Enter' && filtered[activeIndex]) {
                    event.preventDefault()
                    choose(filtered[activeIndex])
                  } else if (event.key === 'Escape') {
                    setOpen(false)
                  }
                }}
              />
            </div>

            <div id={`${id}-listbox`} role="listbox" className="max-h-56 overflow-auto">
              {filtered.length ? (
                filtered.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    className={`flex min-h-11 w-full items-center justify-between rounded-[var(--radius-control)] border px-3 py-2 text-left transition-colors ${
                      index === activeIndex
                        ? 'border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-50'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-900'
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(option)}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{option.label}</span>
                      {option.description && (
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {option.value === value && (
                      <Check
                        className="size-4 text-blue-600"
                        aria-hidden="true"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                ))
              ) : (
                <p className="px-3 py-6 text-center text-sm text-slate-500">No matching option</p>
              )}
            </div>
          </div>
        )}
      </>
    </div>
  )
}
