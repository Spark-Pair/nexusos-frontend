import { Info, ShieldAlert, ShieldX, type LucideIcon } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'
import type { FieldMessage, FieldMessageTone } from './fieldStyles'

export function FieldFrame({
  children,
  inputId,
  label,
  optional
}: PropsWithChildren<{ inputId: string; label: string; optional?: boolean | undefined }>) {
  return (
    <div className="field-frame">
      <label className="field-label" htmlFor={inputId} id={`${inputId}-label`}>
        {label}
        {optional ? <span className="field-optional">(Optional)</span> : null}
      </label>
      {children}
    </div>
  )
}

const messageStyles: Record<
  FieldMessageTone,
  { icon: LucideIcon; trigger: string; panel: string }
> = {
  error: { icon: ShieldX, trigger: 'field-message-error', panel: 'field-tooltip-error' },
  warning: { icon: ShieldAlert, trigger: 'field-message-warning', panel: 'field-tooltip-warning' },
  hint: { icon: Info, trigger: 'field-message-hint', panel: 'field-tooltip-hint' }
}

export function FieldMessageButton({
  id,
  label,
  message
}: {
  id: string
  label: string
  message: FieldMessage
}) {
  const [open, setOpen] = useState(false)
  const styles = messageStyles[message.tone]
  const Icon = styles.icon

  return (
    <span
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={`Show ${label} ${message.tone}`}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={`field-message-trigger ${styles.trigger}`}
      >
        <Icon className="size-4.5" aria-hidden="true" />
      </button>
      <>
        {open ? (
          <span id={id} role="tooltip" className={`field-tooltip ${styles.panel}`}>
            {message.message}
          </span>
        ) : null}
      </>
    </span>
  )
}
