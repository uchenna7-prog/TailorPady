import { createContext, useContext, useMemo } from 'react'
import { useOrders }       from './OrdersContext'
import { useAppointments } from './AppointmentContext'
import { useTasks }        from './TaskContext'
import { useInvoices }     from './InvoiceContext'
import { useReviews }      from './ReviewContext'

const BadgeContext = createContext(null)

export function BadgeProvider({ children }) {
  const { allOrders }         = useOrders()
  const { todayAppointments } = useAppointments()
  const { tasks }             = useTasks()
  const { allInvoices }       = useInvoices()
  const { pendingCount: reviewsPending } = useReviews()

  const badges = useMemo(() => ({
    orders:       allOrders.filter(o => o.status === 'pending' || o.status === 'new').length,
    appointments: todayAppointments.length,
    tasks:        tasks.filter(t => !t.done && !t.completed).length,
    invoices:     allInvoices.filter(inv =>
                    inv.status === 'unpaid' ||
                    inv.status === 'overdue' ||
                    inv.status === 'sent'
                  ).length,
    reviews:      reviewsPending,
  }), [allOrders, todayAppointments, tasks, allInvoices, reviewsPending])

  return (
    <BadgeContext.Provider value={badges}>
      {children}
    </BadgeContext.Provider>
  )
}

export function useBadges() {
  const ctx = useContext(BadgeContext)
  if (!ctx) throw new Error('useBadges must be used inside BadgeProvider')
  return ctx
}