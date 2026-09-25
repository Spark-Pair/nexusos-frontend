import { useEffect, useRef, useState } from 'react'
const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/u, '')
const decodeKey = (value: string) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const raw = atob((value + padding).replace(/-/gu, '+').replace(/_/gu, '/'))
  return Uint8Array.from(raw, (character) => character.charCodeAt(0))
}
export function usePushNotifications(token: string) {
  const supported =
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    supported ? Notification.permission : 'unsupported'
  )
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState<string>()
  const enabling = useRef(false)
  const enableRef = useRef<() => Promise<void>>(async () => undefined)
  useEffect(() => {
    if (!supported) return
    void navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setEnabled(Boolean(subscription)))
  }, [supported])
  const enable = async () => {
    if (enabling.current) return
    enabling.current = true
    try {
      if (!supported || !window.isSecureContext)
        throw new Error('Push notifications require HTTPS or localhost.')
      const nextPermission =
        Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
      setPermission(nextPermission)
      if (nextPermission !== 'granted') throw new Error('Notification permission was not granted.')
      const keyResponse = await fetch(`${apiUrl}/push/public-key`)
      const { public_key: publicKey } = (await keyResponse.json()) as { public_key: string | null }
      if (!publicKey) throw new Error('Web Push is not configured on the server.')
      const registration = await navigator.serviceWorker.ready
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeKey(publicKey)
        }))
      const response = await fetch(`${apiUrl}/push/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(subscription)
      })
      if (!response.ok) throw new Error('Unable to save push subscription.')
      setEnabled(true)
      setError(undefined)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to enable push notifications.')
    } finally {
      enabling.current = false
    }
  }
  enableRef.current = enable
  useEffect(() => {
    if (!token || !supported || permission === 'denied' || enabled) return
    const storageKey = 'nexusos:notification-permission-requested'
    try {
      if (permission === 'default' && localStorage.getItem(storageKey)) return
    } catch {
      // Use the in-memory guard when storage is unavailable.
    }
    let attempted = false
    const request = () => {
      if (attempted) return
      attempted = true
      try {
        if (permission === 'default') {
          if (localStorage.getItem(storageKey)) return
          localStorage.setItem(storageKey, '1')
        }
      } catch {
        // Do not block the permission prompt on storage availability.
      }
      void enableRef.current()
      window.removeEventListener('pointerdown', request, true)
      window.removeEventListener('keydown', request, true)
    }
    window.addEventListener('pointerdown', request, true)
    window.addEventListener('keydown', request, true)
    return () => {
      window.removeEventListener('pointerdown', request, true)
      window.removeEventListener('keydown', request, true)
    }
  }, [enabled, permission, supported, token])
  return { supported, permission, enabled, error, enable }
}
