import type { AuthGateway } from '@domain/auth/session'
import type { NotificationService } from '@domain/notifications/NotificationService'
import type { SearchHistoryService } from '@domain/search/SearchHistoryService'
import type { DemoDataService } from '@domain/services/DemoDataService'
import type { SyncStatusService } from '@domain/sync/SyncStatusService'
import { createContext } from 'react'

export interface AppServices {
  demoData: DemoDataService
  auth: AuthGateway
  notifications: NotificationService
  searchHistory: SearchHistoryService
  syncStatus: SyncStatusService
  showDevelopmentControls: boolean
}

export const AppServicesContext = createContext<AppServices | undefined>(undefined)
