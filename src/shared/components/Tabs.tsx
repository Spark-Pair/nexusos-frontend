import { useRef, type KeyboardEvent, type ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  count?: number
  disabled?: boolean
}

const tabPrefix = (label: string) => label.toLowerCase().replaceAll(/[^a-z0-9]+/gu, '-')

export function Tabs({
  activeId,
  label,
  items,
  onChange
}: {
  activeId: string
  label: string
  items: readonly TabItem[]
  onChange: (id: string) => void
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const move = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const enabled = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.disabled)
    if (!enabled.length) return
    const enabledPosition = enabled.findIndex(({ index }) => index === currentIndex)
    const nextPosition =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : event.key === 'ArrowRight'
            ? (enabledPosition + 1) % enabled.length
            : (enabledPosition - 1 + enabled.length) % enabled.length
    const next = enabled[nextPosition]
    if (next) {
      onChange(next.item.id)
      refs.current[next.index]?.focus()
    }
  }
  const prefix = tabPrefix(label)
  return (
    <div className="tabs-list" role="tablist" aria-label={label}>
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(element) => {
            refs.current[index] = element
          }}
          type="button"
          role="tab"
          aria-label={item.label}
          id={`${prefix}-${item.id}-tab`}
          aria-controls={`${prefix}-${item.id}-panel`}
          aria-selected={activeId === item.id}
          tabIndex={activeId === item.id ? 0 : -1}
          disabled={item.disabled}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => move(event, index)}
          className={`tabs-trigger ${activeId === item.id ? 'tabs-trigger-active' : ''}`}
        >
          {item.label}
          {item.count !== undefined ? (
            <span
              aria-hidden="true"
              className="rounded-full border border-current/20 px-1.5 text-[10px]"
            >
              {item.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}

export function TabPanel({
  children,
  id,
  label
}: {
  children: ReactNode
  id: string
  label: string
}) {
  const prefix = tabPrefix(label)
  return (
    <div role="tabpanel" id={`${prefix}-${id}-panel`} aria-labelledby={`${prefix}-${id}-tab`}>
      {children}
    </div>
  )
}
