import { createContext, useContext, useEffect, useRef, useMemo, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { db } from '../firebase'
import app from '../firebase'
import { useAuth } from './AuthContext'
import { useOrders } from './OrdersContext'
import { useInvoices } from './InvoiceContext'
import { useTasks } from './TaskContext'
import { useAppointments } from './AppointmentContext'
import { useCustomers } from './CustomerContext'
import { useReviews } from './ReviewContext'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

const STORAGE_KEY = 'TailorPady_read_notifs'
const PUSHED_KEY = 'TailorPady_pushed_notifs'
const TOKEN_CACHE_KEY = 'TailorPady_fcm_token'
const FCM_VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY
const PERMISSION_TIMEOUT_MS = 15000

const ICONS = {
  order: { name: 'content_cut', outlined: false },
  invoice: { name: 'receipt_long', outlined: true },
  task: { name: 'check_circle', outlined: true },
  appointment: { name: 'calendar_month', outlined: true },
  birthday: { name: 'cake', outlined: true },
  review: { name: 'star', outlined: true },
}

function loadReadIds() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) }
  catch { return new Set() }
}

function saveReadIds(set) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])) }
  catch {}
}

function loadPushedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(PUSHED_KEY) || '[]')) }
  catch { return new Set() }
}

function savePushedIds(set) {
  try { localStorage.setItem(PUSHED_KEY, JSON.stringify([...set])) }
  catch {}
}

function loadCachedToken() {
  try { return localStorage.getItem(TOKEN_CACHE_KEY) }
  catch { return null }
}

function saveCachedToken(token) {
  try { localStorage.setItem(TOKEN_CACHE_KEY, token) }
  catch {}
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

function isInvoiceOverdue(inv) {
  if (inv.status === 'paid') return false
  if (!inv.due) return false
  return new Date(inv.due + 'T23:59:59') < new Date()
}

function birthdayDaysUntil(birthdayStr) {
  if (!birthdayStr) return null
  const [month, day] = birthdayStr.split('-').map(Number)
  if (!month || !day) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thisYear = new Date(today.getFullYear(), month - 1, day)
  if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1)
  return Math.round((thisYear - today) / (1000 * 60 * 60 * 24))
}

function withTimeout(promise, ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch(() => {
        clearTimeout(timer)
        resolve(null)
      })
  })
}

function tokenDocId(token) {
  return `fcm_${token.slice(0, 40)}`
}

async function saveSubscription(uid, token) {
  if (!uid || !token) return
  try {
    await setDoc(doc(db, 'users', uid, 'pushSubscriptions', tokenDocId(token)), {
      token,
      userAgent: navigator.userAgent,
      updatedAt: new Date().toISOString(),
    })
    saveCachedToken(token)
  } catch (err) {
    alert('Failed to save push subscription: ' + err.message)
  }
}

async function subscribeToPush() {
  const debugLines = []
  try {
    const supported = await isSupported()
    debugLines.push(`isSupported: ${supported}`)
    if (!supported) { alert(debugLines.join('\n')); return null }

    const permission = await withTimeout(Notification.requestPermission(), PERMISSION_TIMEOUT_MS)
    debugLines.push(`permission: ${permission}`)
    if (permission !== 'granted') { alert(debugLines.join('\n')); return null }

    if (!('serviceWorker' in navigator)) {
      debugLines.push('no serviceWorker in navigator')
      alert(debugLines.join('\n'))
      return null
    }

    debugLines.push('waiting for serviceWorker.ready...')
    const registration = await navigator.serviceWorker.ready
    debugLines.push('serviceWorker ready: ' + !!registration)

    if (!FCM_VAPID_KEY) {
      debugLines.push('FCM_VAPID_KEY missing')
      alert(debugLines.join('\n'))
      return null
    }
    debugLines.push('FCM_VAPID_KEY present, length: ' + FCM_VAPID_KEY.length)

    const messaging = getMessaging(app)
    debugLines.push('messaging instance created')

    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    debugLines.push('token: ' + token)
    alert(debugLines.join('\n'))

    return token || null
  } catch (err) {
    debugLines.push('THREW: ' + err.message)
    alert(debugLines.join('\n'))
    return null
  }
}

async function getExistingToken() {
  try {
    const supported = await isSupported()
    if (!supported) return null
    if (!('serviceWorker' in navigator)) return null
    if (!FCM_VAPID_KEY) return null

    const registration = await navigator.serviceWorker.ready
    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
    return token || null
  } catch {
    return null
  }
}

async function syncTokenIfChanged(uid) {
  const token = await getExistingToken()
  if (!token) return
  const cached = loadCachedToken()
  if (token === cached) return
  await saveSubscription(uid, token)
}

async function sendLocalPush(title, body, icon = '/icons/icon192.png') {
  try {
    if (!('serviceWorker' in navigator)) return
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(title, {
      body,
      icon,
      badge: '/icons/icon192.png',
      vibrate: [200, 100, 200],
      tag: title,
    })
  } catch (err) {
    console.warn('showNotification failed:', err)
  }
}

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  pushEnabled: false,
  markRead: () => {},
  markAllRead: () => {},
  requestPushPermission: async () => {},
})

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const { allOrders } = useOrders()
  const { allInvoices } = useInvoices()
  const { tasks } = useTasks()
  const { upcoming: upcomingAppts } = useAppointments()
  const { customers } = useCustomers()
  const { reviews } = useReviews()
  const isOnline = useNetworkStatus()

  const [readIds, setReadIds] = useState(() => loadReadIds())
  const [pushedIds, setPushedIds] = useState(() => loadPushedIds())
  const [pushEnabled, setPushEnabled] = useState(false)

  useEffect(() => { saveReadIds(readIds) }, [readIds])
  useEffect(() => { savePushedIds(pushedIds) }, [pushedIds])

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    setPushEnabled(true)

    if (!user?.uid) return
    syncTokenIfChanged(user.uid)
  }, [user])

  const wasOnlineRef = useRef(isOnline)
  useEffect(() => {
    const justCameOnline = isOnline && !wasOnlineRef.current
    wasOnlineRef.current = isOnline

    if (!justCameOnline) return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    if (!user?.uid) return

    syncTokenIfChanged(user.uid)
  }, [isOnline, user])

  useEffect(() => {
    if (!pushEnabled) return
    let unsubscribe

    isSupported().then(supported => {
      if (!supported) return
      const messaging = getMessaging(app)
      unsubscribe = onMessage(messaging, payload => {
        const title = payload.notification?.title || 'TailorPady'
        const body = payload.notification?.body || ''
        sendLocalPush(title, body)
      })
    })

    return () => { if (unsubscribe) unsubscribe() }
  }, [pushEnabled])

  const notifications = useMemo(() => {
    const list = []

    allOrders
      .filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status))
      .forEach(o => {
        const diff = daysUntil(o.dueDate)
        if (diff === null) return

        if (diff < 0) {
          list.push({
            id: `order-overdue-${o.id}`,
            type: 'order',
            icon: ICONS.order,
            title: `Overdue: ${o.desc || 'Order'}`,
            body: `${o.customerName ? `${o.customerName} · ` : ''}${Math.abs(diff)}d past due date.`,
            time: o.dueDate,
            sortKey: 0,
          })
        } else if (diff <= 3) {
          list.push({
            id: `order-due-${o.id}`,
            type: 'order',
            icon: ICONS.order,
            title: `Order due ${diff === 0 ? 'today' : `in ${diff}d`}: ${o.desc || 'Order'}`,
            body: `${o.customerName ? `${o.customerName} · ` : ''}Due ${o.dueDate}.`,
            time: o.dueDate,
            sortKey: 1,
          })
        }
      })

    allInvoices.filter(isInvoiceOverdue).forEach(inv => {
      list.push({
        id: `invoice-overdue-${inv.id}`,
        type: 'invoice',
        icon: ICONS.invoice,
        title: `Overdue invoice: ${inv.number || 'Invoice'}`,
        body: `${inv.customerName ? `${inv.customerName} · ` : ''}${inv.orderDesc ? `${inv.orderDesc}, ` : ''}payment is past due.`,
        time: inv.due,
        sortKey: 0,
      })
    })

    allInvoices
      .filter(i => i.status !== 'paid' && !isInvoiceOverdue(i))
      .slice(0, 5)
      .forEach(inv => {
        list.push({
          id: `invoice-unpaid-${inv.id}`,
          type: 'invoice',
          icon: ICONS.invoice,
          title: `Unpaid: ${inv.number || 'Invoice'}`,
          body: `${inv.orderDesc || 'Order'}, awaiting payment.`,
          time: inv.date,
          sortKey: 2,
        })
      })

    tasks
      .filter(t => !t.done && t.dueDate && new Date(t.dueDate + 'T23:59:59') < new Date())
      .forEach(t => {
        list.push({
          id: `task-overdue-${t.id}`,
          type: 'task',
          icon: ICONS.task,
          title: `Overdue task: ${t.desc}`,
          body: `${t.customerName ? `${t.customerName} · ` : ''}This task is past its due date.`,
          time: t.dueDate,
          sortKey: 0,
        })
      })

    tasks
      .filter(t => !t.done && t.dueDate)
      .forEach(t => {
        const diff = daysUntil(t.dueDate)
        if (diff !== null && diff >= 0 && diff <= 2) {
          list.push({
            id: `task-due-${t.id}`,
            type: 'task',
            icon: ICONS.task,
            title: `Task due ${diff === 0 ? 'today' : `in ${diff}d`}: ${t.desc}`,
            body: t.customerName ? `For ${t.customerName}` : 'Tap to view details.',
            time: t.dueDate,
            sortKey: 1,
          })
        }
      })

    upcomingAppts.forEach(appt => {
      const diff = daysUntil(appt.date)
      if (diff !== null && diff >= 0 && diff <= 2) {
        list.push({
          id: `appt-${appt.id}`,
          type: 'appointment',
          icon: ICONS.appointment,
          title: `Appointment ${diff === 0 ? 'today' : `in ${diff}d`}: ${appt.title || appt.type || 'Appointment'}`,
          body: `${appt.customerName ? `${appt.customerName} · ` : ''}${appt.time ? `at ${appt.time}` : appt.date}`,
          time: appt.date,
          sortKey: 1,
        })
      }
    })

    customers.forEach(c => {
      if (!c.birthday) return
      const diff = birthdayDaysUntil(c.birthday)
      if (diff !== null && diff >= 0 && diff <= 7) {
        list.push({
          id: `birthday-${c.id}`,
          type: 'birthday',
          icon: ICONS.birthday,
          title: diff === 0 ? `Today is ${c.name}'s birthday!` : `Upcoming birthday: ${c.name}`,
          body: diff === 0 ? `Don't forget to wish them well!` : `Birthday in ${diff} day${diff !== 1 ? 's' : ''}.`,
          time: c.birthday,
          sortKey: diff === 0 ? 0 : 2,
        })
      }
    })

    reviews
      .filter(r => r.status === 'pending')
      .forEach(r => {
        list.push({
          id: `review-pending-${r.id}`,
          type: 'review',
          icon: ICONS.review,
          title: `New review from ${r.customerName || 'a customer'}`,
          body: `${r.rating ? `${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} · ` : ''}Tap to approve or reject.`,
          time: r.createdAt?.toDate?.().toISOString?.() ?? null,
          sortKey: 0,
          reviewId: r.id,
        })
      })

    list.sort((a, b) => {
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey
      if (a.time && b.time) return a.time.localeCompare(b.time)
      return 0
    })

    return list.map(n => ({ ...n, unread: !readIds.has(n.id) }))
  }, [allOrders, allInvoices, tasks, upcomingAppts, customers, reviews, readIds])

  const isFirstRun = useRef(true)
  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return }
    if (!pushEnabled) return

    notifications.forEach(n => {
      if (pushedIds.has(n.id)) return
      sendLocalPush(n.title, n.body)
      setPushedIds(prev => {
        const next = new Set(prev)
        next.add(n.id)
        return next
      })
    })
  }, [notifications, pushEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  const unreadCount = notifications.filter(n => n.unread).length

  const markRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)))
  }

  const requestPushPermission = async () => {
    if (!user?.uid) return
    const token = await subscribeToPush()
    if (!token) return
    setPushEnabled(true)
    await saveSubscription(user.uid, token)
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      pushEnabled,
      markRead,
      markAllRead,
      requestPushPermission,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}