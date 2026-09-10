import { useTheme } from '@shared/themeContext'
import { Moon, Sun } from 'lucide-react'
import { IconButton } from './IconButton'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <IconButton
      label={dark ? 'Use light mode' : 'Use dark mode'}
      icon={dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      onClick={toggleTheme}
      variant="quiet"
    />
  )
}
