import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'

precacheAndRoute(self.__WB_MANIFEST, { directoryIndex: null })
cleanupOutdatedCaches()

const PUBLIC_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/portfolio\//,
  /^\/review\//,
  /^\/faq$/,
  /^\/contact$/,
  /^\/privacy$/,
  /^\/terms$/,
  /^\/refund$/,
  /^\/founder$/,
]

const STATIC_FILE_PATTERNS = [
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
]

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    allowlist: PUBLIC_ROUTE_PATTERNS,
  })
)

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/app.html'), {
    denylist: [...PUBLIC_ROUTE_PATTERNS, ...STATIC_FILE_PATTERNS],
  })
)

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('push', e => {
  let data = { title: 'TailorPady', body: 'You have a new notification.' }
  try { data = e.data?.json() || data } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon192.png',
      badge: '/icons/notification-icon.png',
      vibrate: [200, 100, 200],
      tag: data.title,
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus()
      return clients.openWindow('/')
    })
  )
})
