import type { AppServices } from '@app/providers/AppServicesContext'
import { DevelopmentAuthGateway } from '@infrastructure/auth/DevelopmentAuthGateway'
import { env } from '@infrastructure/config/env'
import { database } from '@infrastructure/database/NexusDatabase'
import { DexieMutationQueueRepository } from '@infrastructure/repositories/DexieMutationQueueRepository'
import { DexieNotificationRepository } from '@infrastructure/repositories/DexieNotificationRepository'
import { DexieSyncStatusService } from '@infrastructure/services/DexieSyncStatusService'
import { LocalDemoDataService } from '@infrastructure/services/LocalDemoDataService'
import { LocalNotificationService } from '@infrastructure/services/LocalNotificationService'
import { LocalSearchHistoryService } from '@infrastructure/services/LocalSearchHistoryService'

export const mutationQueueRepository = new DexieMutationQueueRepository(database)
export const demoDataService = new LocalDemoDataService(database)
export const notificationRepository = new DexieNotificationRepository(database)
export const authGateway = new DevelopmentAuthGateway(
  'guest',
  env.enableDemoIdentity ? sessionStorage : undefined
)

export const appServices: AppServices = {
  demoData: demoDataService,
  auth: authGateway,
  notifications: new LocalNotificationService(notificationRepository, env.enableDevTools),
  searchHistory: new LocalSearchHistoryService(),
  syncStatus: new DexieSyncStatusService(mutationQueueRepository),
  showDevelopmentControls: env.enableDemoIdentity
}
