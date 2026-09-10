import { normalizeCasing, type TextCasing } from '@shared/validation/formValidation'
import { Check } from 'lucide-react'
import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { FieldFrame, FieldMessageButton } from './Field'
import { fieldControlState, resolveFieldMessage } from './fieldStyles'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string | undefined
  warning?: string | undefined
  optional?: boolean
  forceCasing?: TextCasing
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className = '',
    error,
    forceCasing = 'preserve',
    hint,
    id,
    label,
    onBlur,
    optional,
    required,
    warning,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const message = resolveFieldMessage({ error, hint, warning })
  return (
    <FieldFrame inputId={inputId} label={label} optional={optional}>
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          className={`field-control pr-11 ${fieldControlState(message)} ${className}`}
          onBlur={(event) => {
            if (forceCasing !== 'preserve')
              event.currentTarget.value = normalizeCasing(event.currentTarget.value, forceCasing)
            onBlur?.(event)
          }}
          {...props}
        />
        {message ? (
          <span className="absolute right-3">
            <FieldMessageButton id={`${inputId}-message`} label={label} message={message} />
          </span>
        ) : null}
      </div>
    </FieldFrame>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string | undefined
  warning?: string | undefined
  optional?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', error, hint, id, label, optional, required, warning, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const message = resolveFieldMessage({ error, hint, warning })
  return (
    <FieldFrame inputId={inputId} label={label} optional={optional}>
      <div className="relative">
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          className={`field-control min-h-28 resize-y pr-11 ${fieldControlState(message)} ${className}`}
          {...props}
        />
        {message ? (
          <span className="absolute right-3 top-3">
            <FieldMessageButton id={`${inputId}-message`} label={label} message={message} />
          </span>
        ) : null}
      </div>
    </FieldFrame>
  )
})

interface ChoiceProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
}
function ChoiceContent({
  description,
  label
}: {
  description?: string | undefined
  label: string
}) {
  return (
    <span>
      <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
        {label}
      </span>
      {description ? (
        <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>
      ) : null}
    </span>
  )
}
const choiceLayout =
  'flex min-h-12 cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-transparent p-2.5 transition-colors'

export const Checkbox = forwardRef<HTMLInputElement, ChoiceProps>(function Checkbox(
  { className = '', description, label, ...props },
  ref
) {
  return (
    <label
      className={`${choiceLayout} hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-900 dark:hover:bg-blue-950/40`}
    >
      <input ref={ref} type="checkbox" className={`peer sr-only ${className}`} {...props} />
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-[var(--radius-control)] border-2 border-slate-300 bg-white text-xs font-bold text-transparent transition duration-200  peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 dark:border-slate-600 dark:bg-slate-900">
        <Check className="size-3.5" aria-hidden="true" strokeWidth={3} />
      </span>
      <ChoiceContent label={label} description={description} />
    </label>
  )
})

export const Radio = forwardRef<HTMLInputElement, ChoiceProps>(function Radio(
  { className = '', description, label, ...props },
  ref
) {
  return (
    <label
      className={`${choiceLayout} hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-900 dark:hover:bg-blue-950/40`}
    >
      <input ref={ref} type="radio" className={`peer sr-only ${className}`} {...props} />
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-slate-300 bg-white transition duration-200 after:size-2.5 after:scale-0 after:rounded-full after:bg-blue-600 after:transition after:duration-200 after:content-[''] peer-checked:border-blue-600 peer-checked:after:scale-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 dark:border-slate-600 dark:bg-slate-900" />
      <ChoiceContent label={label} description={description} />
    </label>
  )
})

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
}
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { description, label, ...props },
  ref
) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <ChoiceContent label={label} description={description} />
      <span className="relative inline-flex">
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span className="h-6 w-11 rounded-full border border-slate-300 bg-slate-200 transition duration-200 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 peer-disabled:opacity-50 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:border after:border-slate-200 after:bg-white after:transition after:duration-200 after:content-[''] peer-checked:after:translate-x-5" />
      </span>
    </label>
  )
})
