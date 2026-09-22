/* global self, clients, URL */
import { clientsClaim } from 'workbox-core'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api(?:\/|$)/, /^\/uploads\//, /^\/socket.io\//]
  })
)
registerRoute(
  ({ request, url }) =>
    request.method === 'GET' &&
    url.pathname.startsWith('/api/') &&
    !url.pathname.startsWith('/api/media/') &&
    !url.pathname.includes('/auth/'),
  new NetworkFirst({ cacheName: 'nexusos-api-v1', networkTimeoutSeconds: 3 })
)
registerRoute(
  ({ request, url }) =>
    url.pathname.startsWith('/api/media/') ||
    ['audio', 'image', 'video'].includes(request.destination),
  new CacheFirst({ cacheName: 'nexusos-media-v1' })
)
registerRoute(
  ({ request }) => ['style', 'script', 'font'].includes(request.destination),
  new StaleWhileRevalidate({ cacheName: 'nexusos-assets-v1' })
)
clientsClaim()
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('push', (event) => {
  const payload = event.data
    ? event.data.json()
    : { title: 'NexusOS', body: 'You have a new notification.', url: '/app/chats' }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/nexusos.svg',
      badge: '/icons/nexusos.svg',
      tag: payload.url,
      data: { url: payload.url }
    })
  )
})
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/app/chats', self.location.origin)
  const url = target.origin === self.location.origin ? target.href : '/app/chats'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows[0]
      if (existing) {
        existing.navigate(url)
        return existing.focus()
      }
      return clients.openWindow(url)
    })
  )
})
