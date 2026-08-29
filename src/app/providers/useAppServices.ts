import { AppServicesContext, type AppServices } from '@app/providers/AppServicesContext'
import { useContext } from 'react'

export function useAppServices(): AppServices {
  const services = useContext(AppServicesContext)

  if (!services) {
    throw new Error('App services are unavailable outside AppServicesProvider')
  }

  return services
}
