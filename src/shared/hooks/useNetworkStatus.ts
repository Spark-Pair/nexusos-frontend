import { useSyncExternalStore } from 'react'

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('online', onStoreChange)
  window.addEventListener('offline', onStoreChange)
  return () => {
    window.removeEventListener('online', onStoreChange)
    window.removeEventListener('offline', onStoreChange)
  }
}

const getSnapshot = () => navigator.onLine
const getServerSnapshot = () => true

export function useNetworkStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
