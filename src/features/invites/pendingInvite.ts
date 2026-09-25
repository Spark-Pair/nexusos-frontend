const key = 'nexusos-pending-business-invite'

export interface PendingBusinessInvite {
  token: string
  createdAt: number
}

export function savePendingInvite(token: string) {
  sessionStorage.setItem(key, JSON.stringify({ token, createdAt: Date.now() }))
}

export function readPendingInvite(): PendingBusinessInvite | null {
  const raw = sessionStorage.getItem(key)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<PendingBusinessInvite>
    return typeof parsed.token === 'string'
      ? { token: parsed.token, createdAt: Number(parsed.createdAt) || 0 }
      : null
  } catch {
    return null
  }
}

export function clearPendingInvite() {
  sessionStorage.removeItem(key)
}
