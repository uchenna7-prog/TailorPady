import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

self.skipWaiting()

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

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

const messaging = getMessaging(firebaseApp)

onBackgroundMessage(messaging, payload => {
  const title = payload.notification?.title || 'TailorPady'
  const body = payload.notification?.body || 'You have a new notification.'

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon192.png',
    badge: '/icons/notification-icon.png',
    vibrate: [200, 100, 200],
    tag: title,
  })
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