import type { JsonValue } from '@domain/common/json'

export interface HttpRequest {
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  path: string
  body?: JsonValue
  idempotencyKey?: string
}

export interface HttpResponse<T> {
  data: T
  status: number
}

export interface HttpClient {
  request<T>(request: HttpRequest): Promise<HttpResponse<T>>
}

// The Laravel adapter will implement this interface in Phase 17. Feature code must not call fetch directly.
