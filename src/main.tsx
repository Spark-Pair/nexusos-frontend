import { App } from '@app/App'
import { ToastProvider } from '@shared/components/ToastProvider'
import { ThemeProvider } from '@shared/theme'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthSessionProvider } from '@/features/authentication/authSession'
import '@shared/styles/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('NexusOS root element was not found')
}
if (import.meta.env.PROD && 'serviceWorker' in navigator)
  void navigator.serviceWorker.register('/offline-sw.js').catch(() => undefined)

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthSessionProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthSessionProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
)
