import { App } from '@app/App'
import { AppProviders } from '@app/providers/AppProviders'
import type { AppServices } from '@app/providers/AppServicesContext'
import type { IdentityKind } from '@domain/auth/session'
import type { AppNotification } from '@domain/notifications/notification'
import { DevelopmentAuthGateway } from '@infrastructure/auth/DevelopmentAuthGateway'
import { render } from '@testing-library/react'

export function createTestServices(
  identity: IdentityKind = 'guest',
  showDevelopmentControls = true
): AppServices {
  const auth = new DevelopmentAuthGateway(identity)
  const notifications: AppNotification[] = []
  return {
    auth,
    demoData: { reset: () => Promise.resolve() },
    notifications: {
      list: (scope) =>
        Promise.resolve(
          notifications.filter(
            (item) => item.accountId === scope.accountId && item.workspaceId === scope.workspaceId
          )
        ),
      setRead: (_scope, id, read) => {
        const item = notifications.find((record) => record.id === id)
        if (item) item.read = read
        return Promise.resolve()
      },
      markAllRead: () => {
        notifications.forEach((item) => {
          item.read = true
        })
        return Promise.resolve()
      },
      delete: (_scope, id) => {
        const index = notifications.findIndex((item) => item.id === id)
        if (index >= 0) notifications.splice(index, 1)
        return Promise.resolve()
      }
    },
    searchHistory: { list: () => [], record: () => undefined, clear: () => undefined },
    showDevelopmentControls,
    syncStatus: { countPending: () => Promise.resolve(2) }
  }
}

export function renderApp(
  path: string,
  identity: IdentityKind = 'guest',
  showDevelopmentControls = true
) {
  window.history.replaceState({}, '', path)
  const services = createTestServices(identity, showDevelopmentControls)
  return {
    services,
    ...render(
      <AppProviders services={services}>
        <App />
      </AppProviders>
    )
  }
}
