import { CalendarClock, Send } from 'lucide-react'
import { useId, useState } from 'react'
import { Combobox, type ComboboxOption } from './Combobox'
import { Input } from './FormControls'

export type ScheduleMode = 'now' | 'scheduled'

export interface ScheduleValue {
  mode: ScheduleMode
  localDateTime?: string
  timezone: string
}

interface SchedulePickerProps {
  value?: ScheduleValue
  onChange?: (value: ScheduleValue) => void
  timezones?: readonly ComboboxOption[]
}

const defaultTimezones: readonly ComboboxOption[] = [
  { value: 'Asia/Karachi', label: 'Pakistan Standard Time (UTC+5)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' }
]

export function SchedulePicker({
  onChange,
  timezones = defaultTimezones,
  value
}: SchedulePickerProps) {
  const name = useId()
  const [internal, setInternal] = useState<ScheduleValue>(
    value ?? { mode: 'now', timezone: 'Asia/Karachi' }
  )
  const current = value ?? internal
  const update = (next: ScheduleValue) => {
    if (!value) setInternal(next)
    onChange?.(next)
  }

  return (
    <fieldset className="schedule-picker">
      <legend className="field-label">Delivery timing</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {(
          [
            { id: 'now', label: 'Request now', icon: Send },
            { id: 'scheduled', label: 'Schedule request', icon: CalendarClock }
          ] as const
        ).map((option) => {
          const Icon = option.icon
          return (
            <label
              key={option.id}
              className={`schedule-option ${current.mode === option.id ? 'schedule-option-active' : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={current.mode === option.id}
                onChange={() => update({ ...current, mode: option.id })}
                className="sr-only"
              />
              <Icon className="size-4" aria-hidden="true" />
              {option.label}
            </label>
          )
        })}
      </div>
      {current.mode === 'scheduled' ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            type="datetime-local"
            label="Local date and time"
            value={current.localDateTime ?? ''}
            onChange={(event) => update({ ...current, localDateTime: event.target.value })}
          />
          <Combobox
            label="Timezone"
            value={current.timezone}
            options={timezones}
            onChange={(timezone) => update({ ...current, timezone })}
          />
        </div>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        This creates a delivery request only. Sending and final scheduling require backend
        acknowledgement.
      </p>
    </fieldset>
  )
}
