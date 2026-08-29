import type { DemoDataService } from '@domain/services/DemoDataService'
import type { NexusDatabase } from '@infrastructure/database/NexusDatabase'

export class LocalDemoDataService implements DemoDataService {
  public constructor(private readonly database: NexusDatabase) {}

  public async reset(): Promise<void> {
    await this.database.appMetadata.where('key').startsWith('demo:').delete()
  }
}
