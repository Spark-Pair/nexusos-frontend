import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

export function OtpInput({
  disabled = false,
  label = 'Verification code',
  length = 6,
  onChange,
  value
}: {
  value: string
  onChange: (value: string) => void
  length?: number
  label?: string
  disabled?: boolean
}) {
  const id = useId()
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')
  const update = (index: number, raw: string) => {
    const next = [...digits]
    next[index] = raw.replace(/\D/gu, '').slice(-1)
    onChange(next.join(''))
    if (next[index] && index < length - 1) inputs.current[index + 1]?.focus()
  }
  const keyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus()
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < length - 1) inputs.current[index + 1]?.focus()
  }
  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const code = event.clipboardData.getData('text').replace(/\D/gu, '').slice(0, length)
    onChange(code)
    inputs.current[Math.min(code.length, length - 1)]?.focus()
  }
  return (
    <fieldset disabled={disabled} className="field-frame">
      <legend className="field-label" id={`${id}-label`}>
        {label}
      </legend>
      <div className="flex gap-2" aria-labelledby={`${id}-label`}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element
            }}
            value={digit}
            onChange={(event) => update(index, event.target.value)}
            onKeyDown={(event) => keyDown(event, index)}
            onPaste={paste}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1}`}
            className="size-12 rounded-[var(--radius-control)] border border-slate-300 bg-white text-center text-lg font-bold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900"
          />
        ))}
      </div>
    </fieldset>
  )
}
