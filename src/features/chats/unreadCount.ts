import { useCallback, useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()
let snapshot: { actorId: string; count: number } | undefined

function storageKey(actorId: string) {
  return `nexusos:${actorId}:unread-count`
}

function readCount(actorId: string) {
  if (typeof localStorage === 'undefined') return 0
  try {
    const value = Number(localStorage.getItem(storageKey(actorId)))
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  } catch {
    return 0
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key?.endsWith(':unread-count')) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function setUnreadCount(actorId: string, count: number) {
  const next = Math.max(0, Math.floor(count))
  snapshot = { actorId, count: next }
  try {
    localStorage.setItem(storageKey(actorId), String(next))
  } catch {
    // Keep the in-memory count available when browser storage is unavailable.
  }
  listeners.forEach((listener) => listener())
}

export function useUnreadCount(actorId: string) {
  const getSnapshot = useCallback(
    () => (snapshot?.actorId === actorId ? snapshot.count : readCount(actorId)),
    [actorId]
  )
  return useSyncExternalStore(subscribe, getSnapshot, () => 0)
}
