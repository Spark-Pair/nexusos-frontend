import type { AppServices } from '@app/providers/AppServicesContext'
import { AppServicesProvider } from '@app/providers/AppServicesProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router'

interface AppProvidersProps extends PropsWithChildren {
  services: AppServices
}

export function AppProviders({ children, services }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: false }
        }
      })
  )

  return (
    <AppServicesProvider services={services}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </AppServicesProvider>
  )
}
