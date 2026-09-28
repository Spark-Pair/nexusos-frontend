import { useColorScheme } from 'react-native'

const blue = '#245BFF'
export const palette = {
  light: {
    background: '#F4F5F7', surface: '#FFFFFF', surfaceAlt: '#F0F2F5', border: '#E4E7EC',
    text: '#17191D', muted: '#717783', accent: blue, accentSoft: '#E9EEFF', outgoing: '#E7EDFF',
    danger: '#C43535', success: '#137A58', shadow: '#111827',
  },
  dark: {
    background: '#090B0F', surface: '#13161C', surfaceAlt: '#1B2029', border: '#292F39',
    text: '#F4F6FA', muted: '#9BA3B2', accent: '#7392FF', accentSoft: '#202B4E', outgoing: '#202B4E',
    danger: '#FF7777', success: '#54C89B', shadow: '#000000',
  },
} as const

export function useAppColors() {
  return palette[useColorScheme() === 'dark' ? 'dark' : 'light']
}
