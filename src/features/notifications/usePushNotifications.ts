import { useEffect, useState } from 'react'
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
  useEffect(() => {
    if (!supported) return
    void navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setEnabled(Boolean(subscription)))
  }, [supported])
  const enable = async () => {
    try {
      if (!supported || !window.isSecureContext)
        throw new Error('Push notifications require HTTPS or localhost.')
      const nextPermission = await Notification.requestPermission()
      setPermission(nextPermission)
      if (nextPermission !== 'granted') throw new Error('Notification permission was not granted.')
      const keyResponse = await fetch(`${apiUrl}/push/public-key`)
      const { public_key: publicKey } = (await keyResponse.json()) as { public_key: string | null }
      if (!publicKey) throw new Error('Web Push is not configured on the server.')
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(publicKey)
      })
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
    }
  }
  return { supported, permission, enabled, error, enable }
}
