import { logger } from '@infrastructure/logging/logger'

let installed = false

export function installGlobalErrorHandlers(): void {
  if (installed) return
  installed = true

  window.addEventListener('error', (event) => {
    logger.error('Unhandled browser error', event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason)
  })
}
