import { LocalSearchHistoryService } from '@infrastructure/services/LocalSearchHistoryService'
import { beforeEach, describe, expect, it } from 'vitest'

describe('LocalSearchHistoryService', () => {
  beforeEach(() => localStorage.clear())
  it('bounds and isolates non-sensitive recent route searches and can clear one scope', () => {
    const service = new LocalSearchHistoryService()
    const first = { accountId: 'account-one', area: 'customer' }
    const second = { accountId: 'account-two', area: 'customer' }
    for (const query of ['One', 'Two', 'Three', 'Four', 'Five', 'Six']) service.record(first, query)
    service.record(second, 'Private scope')
    expect(service.list(first)).toEqual(['Six', 'Five', 'Four', 'Three', 'Two'])
    expect(service.list(second)).toEqual(['Private scope'])
    service.clear(first)
    expect(service.list(first)).toEqual([])
    expect(service.list(second)).toEqual(['Private scope'])
  })
})
