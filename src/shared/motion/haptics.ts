export type HapticIntent = 'light' | 'medium' | 'success' | 'warning'

const patterns: Record<HapticIntent, number | number[]> = {
  light: 8,
  medium: 14,
  success: [8, 36, 12],
  warning: [18, 40, 18]
}

export function haptic(intent: HapticIntent = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(patterns[intent])
  }
}
