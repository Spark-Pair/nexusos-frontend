import type { AppServices } from '@app/providers/AppServicesContext'
import { env } from '@infrastructure/config/env'
import { database } from '@infrastructure/database/NexusDatabase'
import { DexieMutationQueueRepository } from '@infrastructure/repositories/DexieMutationQueueRepository'
import { LocalDemoDataService } from '@infrastructure/services/LocalDemoDataService'

export const mutationQueueRepository = new DexieMutationQueueRepository(database)
export const demoDataService = new LocalDemoDataService(database)

export const appServices: AppServices = {
  demoData: demoDataService,
  showDevelopmentControls: env.enableDevTools
}
