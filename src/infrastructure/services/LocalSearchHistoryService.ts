import type { SearchHistoryScope, SearchHistoryService } from '@domain/search/SearchHistoryService'

const prefix = 'nexusos:search-history:'
export class LocalSearchHistoryService implements SearchHistoryService {
  public list(scope: SearchHistoryScope): readonly string[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(this.key(scope)) ?? '[]')
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 5)
        : []
    } catch {
      return []
    }
  }
  public record(scope: SearchHistoryScope, query: string): void {
    const normalized = query.trim()
    if (!normalized) return
    localStorage.setItem(
      this.key(scope),
      JSON.stringify(
        [normalized, ...this.list(scope).filter((item) => item !== normalized)].slice(0, 5)
      )
    )
  }
  public clear(scope: SearchHistoryScope): void {
    localStorage.removeItem(this.key(scope))
  }
  private key(scope: SearchHistoryScope): string {
    return `${prefix}${scope.accountId}:${scope.workspaceId ?? 'account'}:${scope.area}`
  }
}
