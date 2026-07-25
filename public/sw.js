import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'

precacheAndRoute(self.__WB_MANIFEST, { directoryIndex: null })
cleanupOutdatedCaches()

const isPublicRoute = ({ url }) =>
  url.pathname === '/' ||
  url.pathname.startsWith('/portfolio/') ||
  url.pathname.startsWith('/review/')

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/public.html'), {
    allowlist: [/^\/$/, /^\/portfolio\//, /^\/review\//],
  })
)

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/$/, /^\/portfolio\//, /^\/review\//],
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
      badge: '/icons/icon192.png',
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