import { App } from '@app/App'
import { AppProviders } from '@app/providers/AppProviders'
import { appServices } from '@infrastructure/composition/services'
import { installGlobalErrorHandlers } from '@infrastructure/logging/globalErrorHandlers'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@shared/styles/index.css'

installGlobalErrorHandlers()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('NexusOS root element was not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders services={appServices}>
      <App />
    </AppProviders>
  </StrictMode>
)
