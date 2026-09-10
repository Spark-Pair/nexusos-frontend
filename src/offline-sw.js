/* global self, clients, URL */
import { clientsClaim } from 'workbox-core'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api(?:\/|$)/, /^\/uploads\//, /^\/socket.io\//]
  })
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
