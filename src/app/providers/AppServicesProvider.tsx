import { AppServicesContext, type AppServices } from '@app/providers/AppServicesContext'
import type { PropsWithChildren } from 'react'

interface AppServicesProviderProps extends PropsWithChildren {
  services: AppServices
}

export function AppServicesProvider({ children, services }: AppServicesProviderProps) {
  return <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>
}
