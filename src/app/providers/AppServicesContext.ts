import type { DemoDataService } from '@domain/services/DemoDataService'
import { createContext } from 'react'

export interface AppServices {
  demoData: DemoDataService
  showDevelopmentControls: boolean
}

export const AppServicesContext = createContext<AppServices | undefined>(undefined)
