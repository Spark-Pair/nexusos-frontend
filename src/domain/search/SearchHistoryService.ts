export interface SearchHistoryScope {
  accountId: string
  workspaceId?: string
  area: string
}

export interface SearchHistoryService {
  list: (scope: SearchHistoryScope) => readonly string[]
  record: (scope: SearchHistoryScope, query: string) => void
  clear: (scope: SearchHistoryScope) => void
}
