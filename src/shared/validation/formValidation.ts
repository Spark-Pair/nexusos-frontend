import { z } from 'zod'

export type TextCasing = 'preserve' | 'title' | 'sentence' | 'upper' | 'lower'

export function normalizeCasing(value: string, casing: TextCasing): string {
  const normalized = value.replace(/\s+/gu, ' ').trim()
  if (casing === 'upper') return normalized.toLocaleUpperCase()
  if (casing === 'lower') return normalized.toLocaleLowerCase()
  if (casing === 'sentence')
    return normalized
      ? normalized[0]!.toLocaleUpperCase() + normalized.slice(1).toLocaleLowerCase()
      : ''
  if (casing === 'title')
    return normalized.replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase())
  return value
}

export const validationRules = Object.freeze({
  fullName: z.string().trim().min(2, 'Enter at least two characters.').max(80),
  email: z.string().trim().email('Enter a valid email address.'),
  pakistanPhone: z
    .string()
    .transform((value) => value.replace(/\D/gu, ''))
    .pipe(z.string().regex(/^(?:92|0)?3\d{9}$/u, 'Enter a valid Pakistani mobile number.')),
  developmentOtp: z.literal('123456', { error: 'Use the development OTP 123456.' }),
  minimumInterests: z.array(z.string()).min(3, 'Choose at least three interests.'),
  requiredText: z.string().trim().min(1, 'This field cannot be empty.')
})

export function normalizePakistanPhone(value: string): string | undefined {
  const national = value.replace(/\D/gu, '').replace(/^(?:92|0)/u, '')
  return /^3\d{9}$/u.test(national) ? `+92${national}` : undefined
}

export function validationMessage<T>(schema: z.ZodType<T>, value: unknown): string | undefined {
  const result = schema.safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message
}
