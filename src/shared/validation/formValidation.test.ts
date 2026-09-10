import {
  normalizeCasing,
  normalizePakistanPhone,
  validationMessage,
  validationRules
} from '@shared/validation/formValidation'
import { describe, expect, it } from 'vitest'

describe('central form validation', () => {
  it('normalizes configured casing consistently', () => {
    expect(normalizeCasing('  hasan   raza ', 'title')).toBe('Hasan Raza')
    expect(normalizeCasing('HELLO WORLD', 'sentence')).toBe('Hello world')
  })

  it('returns one consistent message from shared Zod rules', () => {
    expect(validationMessage(validationRules.pakistanPhone, '123')).toBe(
      'Enter a valid Pakistani mobile number.'
    )
    expect(validationMessage(validationRules.pakistanPhone, '03001234567')).toBeUndefined()
  })

  it.each(['03165825495', '+923165825495', '923165825495'])('normalizes %s to E.164', (phone) =>
    expect(normalizePakistanPhone(phone)).toBe('+923165825495')
  )

  it('rejects a malformed phone during normalization', () => {
    expect(normalizePakistanPhone('12345')).toBeUndefined()
  })
})
