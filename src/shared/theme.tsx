import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  ThemeContext,
  themePreferenceKey,
  type Theme,
  type ThemeContextValue
} from './themeContext'

const initialTheme = (): Theme => {
  const saved = window.localStorage.getItem(themePreferenceKey)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(themePreferenceKey, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light'))
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
