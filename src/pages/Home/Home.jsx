import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SkeletonTheme } from 'react-loading-skeleton'
import { useAuth } from '../../contexts/AuthContext'
import { useCustomers } from '../../contexts/CustomerContext'
import { useOrders } from '../../contexts/OrdersContext'
import { useTasks } from '../../contexts/TaskContext'
import { useInvoices } from '../../contexts/InvoiceContext'
import { useAppointments } from '../../contexts/AppointmentContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { usePayments } from '../../contexts/PaymentContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { useRevenueGoal } from '../../contexts/RevenueGoalContext'
import { APPOINTMENT_TYPE_ICONS } from '../../datas/appointmentDatas'
import {
  getGreeting, getGreetingEmoji, getRandomSubtext, formatUpdatedTime,
  isTaskOverdue, formatDateShort, dueThisWeek,
  isDateInLastMonth, formatNairaCompact, getWindowStart, getPrevWindowStart,
  periodLabel, getDisplayName, loadNotificationDismissed,
} from './utils'
import { NOTIFICATION_DISMISSED_KEY } from './datas'
import { NotificationBanner } from './components/NotificationBanner/NotificationBanner'
import { InstallBanner } from './components/InstallBanner/InstallBanner'
import { ProfileSetupCard } from './components/ProfileSetupCard/ProfileSetupCard'
import { CustomerInsightsCard } from './components/CustomerInsightsCard/CustomerInsightsCard'
import { RevenueGoalModal } from './components/RevenueGoalModal/RevenueGoalModal'
import { StatCard } from './components/StatCard/StatCard'
import { UrgentStrip } from './components/UrgentStrip/UrgentStrip'
import { RevenueGoalCard } from './components/RevenueGoalCard/RevenueGoalCard'
import { EmptyRevenueCard } from './components/EmptyRevenueCard/EmptyRevenueCard'
import { RecentTasksSection } from './components/RecentTasksSection/RecentTasksSection'
import { PastAppointmentsSection } from './components/PastAppointmentsSection/PastAppointmentsSection'
import { UpcomingAppointmentsSection } from './components/UpcomingAppointmentsSection/UpcomingAppointmentsSection'
import { QuickActionsSection } from './components/QuickActionsSection/QuickActionsSection'
import { RecentOrdersSection } from './components/RecentOrdersSection/RecentOrdersSection'
import { StatCardSkeleton } from './components/StatCardSkeleton/StatCardSkeleton'
import { SectionSkeleton } from './components/SectionSkeleton/SectionSkeleton'
import { AppointmentDetail } from '../../components/AppointmentDetail/AppointmentDetail'
import TaskDetail from '../../components/TaskDetail/TaskDetail'
import Header from '../../components/Header/Header'
import BottomNav from '../../components/BottomNav/BottomNav'
import OrderDetailModal from '../../components/OrderDetailModal/OrderDetailModal'
import ConfirmSheet from '../../components/ConfirmSheet/ConfirmSheet'
import Toast from '../../components/Toast/Toast'
import styles from './Home.module.css'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function CardSkeleton({ height = 88 }) {
  return <Skeleton height={height} borderRadius={10} style={{ marginBottom: 12, display: 'block' }} />
}

function useInvoiceDueDate(generalSettings) {
  return function getInvoiceDueDate(invoice) {
    const explicitDue = invoice.due || invoice.dueDate || invoice.due_date || invoice.dueOn
    if (explicitDue) return explicitDue
    const createdAt = invoice.createdAt
    if (!createdAt) return null
    let timestampMs = null
    if (typeof createdAt.toMillis === 'function')    timestampMs = createdAt.toMillis()
    else if (typeof createdAt.toDate === 'function') timestampMs = createdAt.toDate().getTime()
    else if (typeof createdAt.seconds === 'number')  timestampMs = createdAt.seconds * 1000
    else if (typeof createdAt === 'number')          timestampMs = createdAt
    else if (typeof createdAt === 'string')          timestampMs = new Date(createdAt).getTime()
    else if (createdAt instanceof Date)              timestampMs = createdAt.getTime()
    if (!timestampMs || isNaN(timestampMs)) return null
    const dueDays = generalSettings.invoiceDueDays ?? 7
    return new Date(timestampMs + dueDays * 86_400_000).toISOString().slice(0, 10)
  }
}

const PROFILE_STEP_LABELS = {
  brandName:    'Add your business name',
  brandLogo:    'Upload your logo',
  brandColour:  'Pick a brand colour',
  contactInfo:  'Add a phone or email',
  brandAddress: 'Add your address',
  bankDetails:  'Add bank details',
}

function buildProfileSteps(profileSettings) {
  return [
    { key: 'brandName',    done: !!profileSettings.brandName?.trim() },
    { key: 'brandLogo',    done: !!profileSettings.brandLogo },
    { key: 'brandColour',  done: !!(profileSettings.brandColour?.trim() && profileSettings.brandColour !== '#1C1814') },
    { key: 'contactInfo',  done: !!(profileSettings.brandPhone?.trim() || profileSettings.brandEmail?.trim()) },
    { key: 'brandAddress', done: !!profileSettings.brandAddress?.trim() },
    { key: 'bankDetails',  done: !!(profileSettings.accountBank?.trim() && profileSettings.accountNumber?.trim() && profileSettings.accountName?.trim()) },
  ]
}

const STATUS_LABELS = {
  upcoming:  'Upcoming',
  done:      'Done',
  missed:    'Missed',
  cancelled: 'Cancelled',
}

function Home({ onMenuClick, onGoToCustomer }) {
  const navigate = useNavigate()

  const { user }                                                          = useAuth()
  const { customers, loading: loadingCustomers }                          = useCustomers()
  const { allOrders }                                                     = useOrders()
  const { tasks, loading: loadingTasks, toggleTask, deleteTask }          = useTasks()
  const { allInvoices }                                                   = useInvoices()
  const { upcoming, todayAppointments, recent: recentAppts, missedCount, upcomingThisWeek, allAppointments, updateAppointment, deleteAppointment } = useAppointments()
  const { pushEnabled, requestPushPermission }                            = useNotifications()
  const { generalSettings }                                               = useGeneralSettings()
  const { allPayments }                                                   = usePayments()
  const { profileSettings, isLoading: profileLoading }                   = useProfileSettings()
  const { goal, derived, loading: goalLoading, saveGoal, removeGoal }    = useRevenueGoal()

  const [isBannerDismissed, setIsBannerDismissed] = useState(loadNotificationDismissed)
  const [isGoalModalOpen,   setIsGoalModalOpen]   = useState(false)
  const [selectedOrder,     setSelectedOrder]     = useState(null)
  const [detailAppt,        setDetailAppt]        = useState(null)
  const [detailTask,        setDetailTask]        = useState(null)
  const [confirmDelAppt,    setConfirmDelAppt]     = useState(null)
  const [confirmDelTask,    setConfirmDelTask]     = useState(null)
  const [toastMsg,          setToastMsg]          = useState('')
  const toastTimer = useRef(null)

  const greetingTextRef  = useRef(getGreeting())
  const greetingEmojiRef = useRef(getGreetingEmoji())
  const subtitleTextRef  = useRef(getRandomSubtext())
  const lastUpdatedRef   = useRef(new Date())

  const getInvoiceDueDate = useInvoiceDueDate(generalSettings)

  const customersReady    = !loadingCustomers
  const ordersReady       = customersReady
  const tasksReady        = !loadingTasks
  const invoicesReady     = customersReady
  const paymentsReady     = allPayments.length > 0 || customersReady
  const appointmentsReady = customersReady

  const displayName = getDisplayName(user)

  const showNotificationBanner = (
    !pushEnabled &&
    !isBannerDismissed &&
    'Notification' in window &&
    Notification.permission !== 'denied'
  )

  const showInstallBanner = !showNotificationBanner

  const profileSteps          = profileLoading ? [] : buildProfileSteps(profileSettings)
  const profileCompletedCount = profileSteps.filter(s => s.done).length
  const showProfileSetupCard  = !profileLoading && profileCompletedCount < profileSteps.length
  const nextProfileStep       = profileSteps.find(s => !s.done)
  const nextProfileItem       = nextProfileStep ? PROFILE_STEP_LABELS[nextProfileStep.key] : null

  const now      = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  function showToast(msg) {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }

  function handleApptStatusChange(id, newStatus) {
    if (newStatus === 'missed') return
    updateAppointment(id, { status: newStatus })
      .then(() => showToast(`Marked as ${STATUS_LABELS[newStatus] ?? newStatus}`))
      .catch(() => showToast('Failed to update status.'))
  }

  function handleApptDeleteRequest(appt) {
    setDetailAppt(null)
    setConfirmDelAppt(appt)
  }

  async function handleApptDeleteConfirm() {
    if (!confirmDelAppt) return
    try {
      await deleteAppointment(confirmDelAppt.id)
      showToast('Appointment deleted')
    } catch {
      showToast('Failed to delete appointment.')
    }
    setConfirmDelAppt(null)
  }

  async function handleTaskToggle(id, currentDone) {
    try {
      await toggleTask(id, currentDone)
      setDetailTask(prev =>
        prev && String(prev.id) === String(id) ? { ...prev, done: !currentDone } : prev
      )
    } catch {
      showToast('Failed to update task.')
    }
  }

  function handleTaskDeleteRequest(task) {
    setDetailTask(null)
    setConfirmDelTask(task)
  }

  async function handleTaskDeleteConfirm() {
    if (!confirmDelTask) return
    try {
      await deleteTask(confirmDelTask.id)
      showToast('Task deleted')
    } catch {
      showToast('Failed to delete task.')
    }
    setConfirmDelTask(null)
  }

  function isInvoiceOverdue(invoice) {
    if (invoice.status === 'paid') return false
    const dueDate = getInvoiceDueDate(invoice)
    if (!dueDate) return false
    return new Date(`${dueDate}T23:59:59`) < new Date()
  }

  const totalCustomers        = customers.length
  const newCustomersThisMonth = customers.filter(c => {
    if (!c.date) return false
    const date = new Date(c.date)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  const topCustomer = (() => {
    if (!customers.length) return { name: '—', orderCount: 0, totalSpend: 0 }
    const orderCountById = {}
    const totalSpendById = {}
    allOrders.forEach(order => {
      if (!order.customerId) return
      orderCountById[order.customerId] = (orderCountById[order.customerId] || 0) + 1
      totalSpendById[order.customerId] = (totalSpendById[order.customerId] || 0) + (Number(order.price) || 0)
    })
    let topId = null, topCount = 0
    Object.entries(orderCountById).forEach(([id, count]) => {
      if (count > topCount) { topCount = count; topId = id }
    })
    const topData = topId ? customers.find(c => c.id === topId) : customers[0]
    if (!topData) return { name: '—', orderCount: 0, totalSpend: 0 }
    return {
      name:       topData.name || `${topData.firstName ?? ''} ${topData.lastName ?? ''}`.trim() || '—',
      orderCount: orderCountById[topData.id] || 0,
      totalSpend: totalSpendById[topData.id] || 0,
    }
  })()

  const topCustomerMeta = (() => {
    const { orderCount, totalSpend } = topCustomer
    if (!orderCount) return null
    const parts = []
    const spendLabel = formatNairaCompact(totalSpend)
    if (spendLabel) parts.push(spendLabel)
    parts.push(`${orderCount} order${orderCount !== 1 ? 's' : ''}`)
    return parts.join(' • ')
  })()

  const activeOrders            = allOrders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status))
  const activeOrdersDueToday    = activeOrders.filter(o => (o.dueDate || o.dueRaw) === todayStr).length
  const activeOrdersDueThisWeek = activeOrders.filter(o => dueThisWeek(o.dueDate || o.dueRaw)).length
  const ordersCreatedThisWeek   = allOrders.filter(o => {
    const oneWeekAgo = new Date(now); oneWeekAgo.setDate(now.getDate() - 7)
    return o.createdAt && new Date(o.createdAt) >= oneWeekAgo
  }).length

  const overdueInvoices        = allInvoices.filter(isInvoiceOverdue)
  const zeroPaymentInvoices    = allInvoices.filter(i => i.status === 'unpaid')
  const overdueCount           = overdueInvoices.length
  const zeroPaymentDueToday    = zeroPaymentInvoices.filter(i => getInvoiceDueDate(i) === todayStr).length
  const zeroPaymentDueThisWeek = zeroPaymentInvoices.filter(i => dueThisWeek(getInvoiceDueDate(i))).length

  const pendingTasks         = tasks.filter(t => !t.done && !isTaskOverdue(t))
  const overdueTasks         = tasks.filter(t => isTaskOverdue(t))
  const tasksDueToday        = pendingTasks.filter(t => t.dueDate === todayStr).length
  const tasksDueThisWeek     = pendingTasks.filter(t => dueThisWeek(t.dueDate)).length
  const tasksCreatedThisWeek = tasks.filter(t => {
    const oneWeekAgo = new Date(now); oneWeekAgo.setDate(now.getDate() - 7)
    return t.createdAt && new Date(t.createdAt) >= oneWeekAgo
  }).length

  const todayAppointmentCount = todayAppointments.length

  const urgentItems = []

  const soonAppointment = upcoming.find(appt => {
    if (!appt.date || !appt.time || appt.date !== todayStr) return false
    const [h, m]   = appt.time.split(':').map(Number)
    const apptTime = new Date(); apptTime.setHours(h, m, 0, 0)
    const msUntil  = apptTime - Date.now()
    return msUntil > 0 && msUntil < 2 * 60 * 60 * 1000
  })

  if (soonAppointment) {
    const [h, m]   = soonAppointment.time.split(':').map(Number)
    const apptTime = new Date(); apptTime.setHours(h, m, 0, 0)
    const minsLeft = Math.round((apptTime - Date.now()) / 60_000)
    const suffix   = soonAppointment.customerName ? ` · ${soonAppointment.customerName}` : ''
    urgentItems.push({ icon: APPOINTMENT_TYPE_ICONS[soonAppointment.type] || 'event', text: `Appointment in ${minsLeft} min${minsLeft !== 1 ? 's' : ''}${suffix}`, route: '/appointments' })
  }
  if (overdueTasks.length > 0)     urgentItems.push({ icon: 'assignment_late', text: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,         route: '/tasks'        })
  if (activeOrdersDueToday > 0)    urgentItems.push({ icon: 'local_shipping',  text: `${activeOrdersDueToday} order${activeOrdersDueToday > 1 ? 's' : ''} due today`,    route: '/orders'       })
  if (overdueCount > 0)            urgentItems.push({ icon: 'receipt_long',    text: `${overdueCount} overdue invoice${overdueCount > 1 ? 's' : ''}`,                    route: '/invoices'     })

  const orderStatSub = (() => {
    if (activeOrders.length === 0)   return { text: 'All orders sent',                        color: '#22c55e' }
    if (activeOrdersDueToday > 0)    return { text: `${activeOrdersDueToday} due today`,      color: '#ef4444' }
    if (activeOrdersDueThisWeek > 0) return { text: `${activeOrdersDueThisWeek} due this wk`, color: '#fb923c' }
    if (ordersCreatedThisWeek > 0)   return { text: `${ordersCreatedThisWeek} new this wk`,   color: '#818cf8' }
    return null
  })()

  const invoiceStatSub = (() => {
    if (zeroPaymentInvoices.length === 0) return { text: 'Fully paid up',                         color: '#22c55e' }
    if (zeroPaymentDueToday > 0)          return { text: `${zeroPaymentDueToday} due today`,      color: '#ef4444' }
    if (zeroPaymentDueThisWeek > 0)       return { text: `${zeroPaymentDueThisWeek} due this wk`, color: '#fb923c' }
    if (overdueCount > 0)                 return { text: `${overdueCount} overdue`,               color: '#ef4444' }
    return { text: `${zeroPaymentInvoices.length} pending`, color: '#fb923c' }
  })()

  const appointmentStatSub = (() => {
    if (todayAppointmentCount > 0) return { text: `${todayAppointmentCount} today`, color: '#06b6d4' }
    if (missedCount > 0)           return { text: `${missedCount} missed`,          color: '#ef4444' }
    if (upcomingThisWeek > 0)      return { text: `${upcomingThisWeek} this wk`,    color: '#818cf8' }
    return { text: 'Clear schedule', color: '#22c55e' }
  })()

  const taskStatSub = (() => {
    if (pendingTasks.length === 0 && overdueTasks.length === 0) return { text: '+ New task',              color: '#22c55e' }
    if (overdueTasks.length > 0)  return { text: `${overdueTasks.length} overdue`,      color: '#ef4444' }
    if (tasksDueToday > 0)        return { text: `${tasksDueToday} due today`,          color: '#ef4444' }
    if (tasksDueThisWeek > 0)     return { text: `${tasksDueThisWeek} due this wk`,     color: '#fb923c' }
    if (tasksCreatedThisWeek > 0) return { text: `${tasksCreatedThisWeek} new this wk`, color: '#818cf8' }
    return null
  })()

  const STAT_CARDS = [
    { desktopIcon: 'shopping_bag',  value: activeOrders.length,        label: 'Active Orders',   sub: orderStatSub?.text       ?? null, subColor: orderStatSub?.color       ?? 'var(--text3)', route: '/orders'       },
    { desktopIcon: 'receipt_long',  value: zeroPaymentInvoices.length, label: 'Unpaid Invoices', sub: invoiceStatSub?.text     ?? null, subColor: invoiceStatSub?.color     ?? 'var(--text3)', route: '/invoices',    tooltip: 'Only invoices with no payment recorded yet.' },
    { desktopIcon: 'event',         value: todayAppointmentCount,      label: "Today's Appts",   sub: appointmentStatSub?.text ?? null, subColor: appointmentStatSub?.color ?? 'var(--text3)', route: '/appointments' },
    { desktopIcon: 'task_alt',      value: pendingTasks.length,        label: 'Pending Tasks',   sub: taskStatSub?.text        ?? null, subColor: taskStatSub?.color        ?? 'var(--text3)', route: '/tasks'        },
  ]

  const recentActiveOrders   = activeOrders.slice(0, 3)
  const recentTasks          = [...tasks].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)).slice(0, 3)
  const upcomingAppointments = upcoming.slice(0, 3)
  const pastAppointments     = recentAppts.slice(0, 3)

  async function handleEnableNotifications() {
    await requestPushPermission()
    dismissNotificationBanner()
  }

  function dismissNotificationBanner() {
    setIsBannerDismissed(true)
    localStorage.setItem(NOTIFICATION_DISMISSED_KEY, 'true')
  }

  return (
    <div className={styles.pageWrapper}>
      <Header onMenuClick={onMenuClick} />

      <main className={styles.main}>
        <SkeletonTheme baseColor="var(--surface2)" highlightColor="var(--surface)">

          <section className={styles.hero}>
            <p className={styles.welcomeLabel}>
              {greetingTextRef.current}
              <span className={styles.greetingEmoji}>{greetingEmojiRef.current}</span>
            </p>
            <h1 className={styles.title}>{displayName}</h1>
            <p className={styles.subtitle}>{subtitleTextRef.current}</p>
            <p className={styles.updatedAt}>
              <span className="mi" style={{ fontSize: '0.7rem', verticalAlign: 'middle', marginRight: '3px' }}>update</span>
              Updated at {formatUpdatedTime(lastUpdatedRef.current)}
            </p>
          </section>

          {showNotificationBanner && (
            <NotificationBanner onEnable={handleEnableNotifications} onDismiss={dismissNotificationBanner} />
          )}

          {showInstallBanner && <InstallBanner />}

          {showProfileSetupCard && (
            <ProfileSetupCard
              completedCount={profileCompletedCount}
              totalCount={profileSteps.length}
              nextItem={nextProfileItem}
            />
          )}

          {(ordersReady && tasksReady) && (
            <UrgentStrip items={urgentItems} navigate={navigate} />
          )}

          <section className={styles.statsGrid}>
            {ordersReady && invoicesReady && appointmentsReady && tasksReady ? (
              STAT_CARDS.map((card, i) => <StatCard key={i} card={card} navigate={navigate} />)
            ) : (
              [0, 1, 2, 3].map(i => <StatCardSkeleton key={i} />)
            )}
          </section>

          {goalLoading ? (
            <CardSkeleton height={110} />
          ) : goal && derived ? (
            <RevenueGoalCard
              goal={goal}
              derived={derived}
              onEdit={() => setIsGoalModalOpen(true)}
              onDelete={removeGoal}
            />
          ) : (
            <EmptyRevenueCard onOpen={() => setIsGoalModalOpen(true)} />
          )}

          {customersReady ? (
            <CustomerInsightsCard
              totalCustomers={totalCustomers}
              newThisMonth={newCustomersThisMonth}
              topCustomer={topCustomer}
              topCustomerMeta={topCustomerMeta}
              onNavigate={() => navigate('/customers')}
            />
          ) : (
            <CardSkeleton height={100} />
          )}

          {isGoalModalOpen && (
            <RevenueGoalModal
              onSave={async (data) => { await saveGoal(data); setIsGoalModalOpen(false) }}
              onClose={() => setIsGoalModalOpen(false)}
              existingGoal={goal}
            />
          )}

          {appointmentsReady ? (
            upcomingAppointments.length > 0 && (
              <UpcomingAppointmentsSection
                appointments={upcomingAppointments}
                todayAppointments={todayAppointments}
                allOrders={allOrders}
                onSeeAll={() => navigate('/appointments')}
                onSelectAppointment={setDetailAppt}
              />
            )
          ) : (
            <SectionSkeleton />
          )}

          {appointmentsReady && pastAppointments.length > 0 && (
            <PastAppointmentsSection
              appointments={pastAppointments}
              allOrders={allOrders}
              onSeeAll={() => navigate('/appointments')}
              onSelectAppointment={setDetailAppt}
            />
          )}

          <QuickActionsSection onNavigate={navigate} />

          {ordersReady ? (
            recentActiveOrders.length > 0 && (
              <RecentOrdersSection
                orders={recentActiveOrders}
                onSeeAll={() => navigate('/orders')}
                onSelectOrder={setSelectedOrder}
              />
            )
          ) : (
            <SectionSkeleton />
          )}

          {tasksReady ? (
            recentTasks.length > 0 && (
              <RecentTasksSection
                tasks={recentTasks}
                allOrders={allOrders}
                onSeeAll={() => navigate('/tasks')}
                onSelectTask={setDetailTask}
              />
            )
          ) : (
            <SectionSkeleton />
          )}

          {selectedOrder && (
            <OrderDetailModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onGoToCustomer={onGoToCustomer}
              noBlur
            />
          )}

          {detailAppt && (
            <AppointmentDetail
              appt={detailAppt}
              onClose={() => setDetailAppt(null)}
              onStatusChange={handleApptStatusChange}
              onDelete={handleApptDeleteRequest}
            />
          )}

          {detailTask && (
            <TaskDetail
              task={detailTask}
              onClose={() => setDetailTask(null)}
              onToggle={handleTaskToggle}
              onDelete={handleTaskDeleteRequest}
            />
          )}

          <ConfirmSheet
            open={!!confirmDelAppt}
            title="Delete Appointment?"
            message="This can't be undone."
            onConfirm={handleApptDeleteConfirm}
            onCancel={() => setConfirmDelAppt(null)}
          />

          <ConfirmSheet
            open={!!confirmDelTask}
            title="Delete Task?"
            message="This can't be undone."
            onConfirm={handleTaskDeleteConfirm}
            onCancel={() => setConfirmDelTask(null)}
          />

        </SkeletonTheme>
      </main>

      <Toast message={toastMsg} />
      <BottomNav />
    </div>
  )
}

export default Home
