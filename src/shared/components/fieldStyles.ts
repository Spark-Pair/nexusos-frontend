export type FieldMessageTone = 'error' | 'warning' | 'hint'
export interface FieldMessage {
  message: string
  tone: FieldMessageTone
}
export function resolveFieldMessage({
  error,
  hint,
  warning
}: {
  error?: string | undefined
  hint?: string | undefined
  warning?: string | undefined
}): FieldMessage | null {
  if (error) return { message: error, tone: 'error' }
  if (warning) return { message: warning, tone: 'warning' }
  if (hint) return { message: hint, tone: 'hint' }
  return null
}
export function fieldControlState(message: FieldMessage | null) {
  if (message?.tone === 'error') return 'field-control-error'
  if (message?.tone === 'warning') return 'field-control-warning'
  return ''
}
