import { useState, useMemo, useEffect } from 'react'
import { useOrders }    from '../../contexts/OrdersContext'
import { useTasks }     from '../../contexts/TaskContext'
import { usePayments }  from '../../contexts/PaymentContext'
import { useCustomers } from '../../contexts/CustomerContext'
import { useAppointments, parseApptDate, getEffectiveStatus } from '../../contexts/AppointmentContext'
import { useRevenueGoal } from '../../contexts/RevenueGoalContext'
import Header           from '../../components/Header/Header'
import BottomNav        from '../../components/BottomNav/BottomNav'
import styles           from './Reports.module.css'

const PERIODS = [
  { id: 'week',  label: 'This week'     },
  { id: 'month', label: 'This month'    },
  { id: '3mo',   label: 'Last 3 months' },
  { id: 'year',  label: 'This year'     },
  { id: 'all',   label: 'All time'      },
]

function periodStart(id) {
  const now = new Date()
  switch (id) {
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - d.getDay())
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'month': return new Date(now.getFullYear(), now.getMonth(), 1)
    case '3mo':   return new Date(now.getFullYear(), now.getMonth() - 2, 1)
    case 'year':  return new Date(now.getFullYear(), 0, 1)
    default:      return null
  }
}

function parseItemDate(item) {
  if (item.createdAt?.toDate)  return item.createdAt.toDate()
  if (item.createdAt?.seconds) return new Date(item.createdAt.seconds * 1000)
  if (item.date)               return new Date(item.date)
  return null
}

function inPeriod(item, start) {
  if (!start) return true
  const d = parseItemDate(item)
  if (!d) return false
  return d >= start
}

function fmt(amount) {
  const n = parseFloat(amount) || 0
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return `₦${n.toLocaleString('en-NG')}`
}

function pct(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

function isOverdueOrder(order) {
  if (!order.dueRaw) return false
  if (order.status === 'delivered' || order.status === 'completed') return false
  return new Date(order.dueRaw + 'T23:59:59') < new Date()
}

function orderBucket(order) {
  if (order.status === 'delivered') return 'delivered'
  if (order.status === 'completed') return 'completed'
  if (isOverdueOrder(order)) return 'overdue'
  if (!order.status || order.status === 'pending' || order.status === 'in_progress') return 'inProgress'
  return 'other'
}

function periodBounds(id) {
  const now = new Date()
  switch (id) {
    case 'week': {
      const start = new Date(now)
      start.setDate(start.getDate() - start.getDay())
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 7)
      return { start, end }
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      return { start, end }
    }
    case '3mo': {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      return { start, end }
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1)
      const end   = new Date(now.getFullYear() + 1, 0, 1)
      return { start, end }
    }
    default: return { start: null, end: null }
  }
}

function apptInPeriod(appt, periodId) {
  const { start, end } = periodBounds(periodId)
  const d = parseApptDate(appt)
  if (!d) return false
  if (start && d < start) return false
  if (end && d >= end) return false
  return true
}


function DonutChart({ segments, centerLabel, centerSub }) {
  const R = 42, CX = 54, CY = 54
  const circumference = 2 * Math.PI * R
  const GAP = 3
  const sum = segments.reduce((s, seg) => s + seg.value, 0)
  let offset = 0
  const arcs = segments.map(seg => {
    const fraction = sum > 0 ? seg.value / sum : 0
    const dash = Math.max(0, fraction * circumference - GAP)
    const arc = {
      dash,
      gap: circumference - dash,
      offset: circumference - offset,
      color: seg.color,
    }
    offset += fraction * circumference
    return arc
  })
  return (
    <svg width="108" height="108" viewBox="0 0 108 108" className={styles.donutSvg}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth="12" />
      {sum === 0
        ? <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border2)" strokeWidth="12" />
        : arcs.map((arc, i) =>
            arc.dash > 0 && (
              <circle
                key={i}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth="12"
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            )
          )
      }
      <text x={CX} y={CY - 5} textAnchor="middle" className={styles.donutNum}>{centerLabel}</text>
      <text x={CX} y={CY + 9} textAnchor="middle" className={styles.donutSub}>{centerSub}</text>
    </svg>
  )
}

function StatusRow({ label, count, total, color }) {
  const w = total > 0 ? Math.max(2, (count / total) * 100) : 0
  return (
    <div className={styles.statusRow}>
      <div className={styles.statusRowTop}>
        <span className={styles.statusRowLabel}>
          <span className={styles.statusRowDot} style={{ background: color }} />
          {label}
        </span>
        <span className={styles.statusRowCount}>{count}</span>
      </div>
      <div className={styles.statusRowTrack}>
        <div className={styles.statusRowFill} style={{ width: `${w}%`, background: color }} />
      </div>
    </div>
  )
}

function InsightRow({ items }) {
  return (
    <div className={styles.insightRow}>
      {items.map((item, i) => (
        <div key={i} className={styles.insightItem}>
          <div className={styles.insightVal}>{item.value}</div>
          <div className={styles.insightLbl}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

const TONE_COLORS = {
  info:     '#6366f1',
  positive: '#22c55e',
  warning:  '#f97316',
  neutral:  null,
}

function StatCard({ icon, label, value, info, isInfoOpen, onToggleInfo, onCloseInfo }) {
  useEffect(() => {
    if (!isInfoOpen) return
    const timer = setTimeout(() => onCloseInfo(), 4000)
    return () => clearTimeout(timer)
  }, [isInfoOpen, onCloseInfo])

  return (
    <div className={styles.statCard}>
      {info && (
        <>
          <button
            type="button"
            className={styles.statInfoBtn}
            onClick={onToggleInfo}
            aria-label="More info"
          >
            <span className="mi" style={{ fontSize: '0.8rem' }}>info</span>
          </button>
          {isInfoOpen && (
            <>
              <div className={styles.statInfoBackdrop} onClick={onCloseInfo} />
              <div className={styles.statInfoPopover}>{info}</div>
            </>
          )}
        </>
      )}
      <span className={`mi ${styles.statIcon}`}>{icon}</span>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

function GoalProgressCard({ goal, derived, fmt }) {
  if (!goal || !derived) {
    return (
      <div className={styles.collectionCard}>
        <div className={styles.collectionTop}>
          <div>
            <div className={styles.collectionLabel}>Revenue Goal</div>
            <div className={styles.collectionSub}>Set a goal to track your progress here</div>
          </div>
        </div>
      </div>
    )
  }

  const periodLabel = goal.period === 'weekly'
    ? 'This week'
    : goal.period === 'yearly'
      ? 'This year'
      : 'This month'

  const previousLabel = goal.period === 'weekly'
    ? 'last week'
    : goal.period === 'yearly'
      ? 'last year'
      : 'last month'

  const deltaAbs   = Math.abs(derived.delta)
  const deltaColor = derived.isUp ? '#22c55e' : '#f97316'
  const deltaIcon  = derived.isUp ? 'trending_up' : 'trending_down'
  const deltaWord  = derived.isUp ? 'more' : 'less'
  const isMet      = derived.met
  const displayPercent = derived.rawPercent ?? derived.percent

  const progressSub = isMet
    ? derived.over > 0
      ? `${fmt(derived.earnedThis)} earned · ${fmt(derived.over)} over goal`
      : `${fmt(derived.earnedThis)} · Goal reached exactly`
    : `${fmt(derived.earnedThis)} of ${fmt(goal.goal)}`

  return (
    <div className={styles.collectionCard}>
      <div className={styles.collectionTop}>
        <div>
          <div className={styles.collectionLabel}>Revenue Goal</div>
          <div className={styles.collectionSub}>{periodLabel} · {progressSub}</div>
        </div>
        <div className={styles.collectionRate}>{displayPercent}%</div>
      </div>
      <div className={styles.collectionTrack}>
        <div className={styles.collectionFill} style={{ width: `${Math.min(derived.percent, 100)}%` }} />
      </div>
      <div className={styles.collectionSub} style={{ color: deltaColor, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span className="mi" style={{ fontSize: '0.8rem' }}>{deltaIcon}</span>
        {fmt(deltaAbs)} {deltaWord} than {previousLabel}
      </div>
    </div>
  )
}

function PeriodSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const current = PERIODS.find(p => p.id === value)
  return (
    <div className={styles.periodWrap}>
      <button className={styles.periodBtn} onClick={() => setOpen(p => !p)}>
        {current.label}
        <span className="mi" style={{ fontSize: '0.85rem' }}>expand_more</span>
      </button>
      {open && (
        <>
          <div className={styles.periodBackdrop} onClick={() => setOpen(false)} />
          <div className={styles.periodDropdown}>
            {PERIODS.map(p => (
              <button
                key={p.id}
                className={`${styles.periodOption} ${value === p.id ? styles.periodOptionActive : ''}`}
                onClick={() => { onChange(p.id); setOpen(false) }}
              >
                {p.label}
                {value === p.id && (
                  <span className="mi" style={{ fontSize: '0.85rem', marginLeft: 'auto' }}>check</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Section({ title, period, onPeriodChange, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>
      {children}
    </section>
  )
}


export default function Reports({ onMenuClick }) {
  const { allOrders }   = useOrders()
  const { tasks }       = useTasks()
  const { allPayments } = usePayments()
  const { customers }   = useCustomers()
  const { allAppointments } = useAppointments()
  const { goal, derived: goalDerived } = useRevenueGoal()

  const [perfPeriod,  setPerfPeriod]  = useState('month')
  const [orderPeriod, setOrderPeriod] = useState('month')
  const [apptPeriod,  setApptPeriod]  = useState('month')
  const [taskPeriod,  setTaskPeriod]  = useState('month')
  const [custPeriod,  setCustPeriod]  = useState('month')
  const [openStatInfo, setOpenStatInfo] = useState(null)

  const orders = useMemo(() => Array.isArray(allOrders) ? allOrders : [], [allOrders])

  const perfStats = useMemo(() => {
    const start       = periodStart(perfPeriod)
    const filtered    = orders.filter(o => inPeriod(o, start))
    const totalOrders = filtered.length
    const orderValue  = filtered.reduce((s, o) => s + (parseFloat(o.price) || 0), 0)

    let payReceived = 0
    allPayments.forEach(p => {
      ;(p.installments || []).forEach(inst => {
        const d = new Date(inst.date)
        if (!isNaN(d) && (!start || d >= start)) {
          payReceived += parseFloat(inst.amount) || 0
        }
      })
    })

    const outstanding = Math.max(0, orderValue - payReceived)
    return { totalOrders, orderValue, payReceived, outstanding }
  }, [orders, allPayments, perfPeriod])

  const orderStats = useMemo(() => {
    const start    = periodStart(orderPeriod)
    const filtered = orders.filter(o => inPeriod(o, start))
    const total    = filtered.length

    const buckets = { delivered: 0, inProgress: 0, completed: 0, overdue: 0, other: 0 }
    filtered.forEach(o => { buckets[orderBucket(o)] += 1 })

    const withDueDate = filtered.filter(o => o.dueRaw && parseItemDate(o))
    const avgDays = withDueDate.length > 0
      ? Math.round(
          withDueDate.reduce((s, o) => {
            const created = parseItemDate(o)
            const due     = new Date(o.dueRaw + 'T23:59:59')
            return s + Math.max(0, (due - created) / (1000 * 60 * 60 * 24))
          }, 0) / withDueDate.length
        )
      : null

    return { total, avgDays, ...buckets }
  }, [orders, orderPeriod])

  const apptStats = useMemo(() => {
    const filtered = allAppointments.filter(a => apptInPeriod(a, apptPeriod))
    const total    = filtered.length

    const buckets = { done: 0, upcoming: 0, missed: 0, cancelled: 0 }
    filtered.forEach(a => { buckets[getEffectiveStatus(a)] += 1 })

    const resolved   = buckets.done + buckets.missed
    const showUpRate = resolved > 0 ? Math.round((buckets.done / resolved) * 100) : null
    const cancelRate = total > 0 ? Math.round((buckets.cancelled / total) * 100) : null

    return { total, showUpRate, cancelRate, ...buckets }
  }, [allAppointments, apptPeriod])

  const taskStats = useMemo(() => {
    const start    = periodStart(taskPeriod)
    const filtered = tasks.filter(t => inPeriod(t, start))
    const total    = filtered.length
    const done     = filtered.filter(t => t.done).length
    const overdue  = filtered.filter(t => {
      if (t.done || !t.dueDate) return false
      return new Date(t.dueDate + 'T23:59:59') < new Date()
    }).length
    const pending  = Math.max(0, total - done - overdue)

    return { total, done, pending, overdue }
  }, [tasks, taskPeriod])

  const custStats = useMemo(() => {
    const start        = periodStart(custPeriod)
    const periodOrders = orders.filter(o => inPeriod(o, start))

    const orderCountMap = {}
    periodOrders.forEach(o => {
      if (o.customerId) orderCountMap[o.customerId] = (orderCountMap[o.customerId] || 0) + 1
    })

    const buckets = { newCount: 0, repeatCount: 0, activeCount: 0, inactiveCount: 0 }
    customers.forEach(c => {
      const isNew      = inPeriod(c, start)
      const orderCount = orderCountMap[c.id] || 0
      if (isNew)                    buckets.newCount      += 1
      else if (orderCount > 1)      buckets.repeatCount    += 1
      else if (orderCount === 1)    buckets.activeCount    += 1
      else                          buckets.inactiveCount += 1
    })

    const avgOrders = customers.length > 0
      ? (periodOrders.length / customers.length).toFixed(1)
      : '0'

    return { total: customers.length, avgOrders, ...buckets }
  }, [customers, custPeriod, orders])

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Reports" />

      <div className={styles.scrollArea}>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Performance</h3>
          </div>

          <GoalProgressCard goal={goal} derived={goalDerived} fmt={fmt} />

          <div className={styles.sectionHeader} style={{ marginTop: 20, justifyContent: 'flex-end' }}>
            <PeriodSelector value={perfPeriod} onChange={setPerfPeriod} />
          </div>
          <div className={styles.statsGrid}>
            <StatCard icon="receipt_long"          label="Orders Placed"      value={perfStats.totalOrders}      
              isInfoOpen={openStatInfo === 0}
              onToggleInfo={() => setOpenStatInfo(p => (p === 0 ? null : 0))}
              onCloseInfo={() => setOpenStatInfo(p => (p === 0 ? null : p))}
            />
            <StatCard icon="sell"                   label="Total Order Value"  value={fmt(perfStats.orderValue)} 
              isInfoOpen={openStatInfo === 1}
              onToggleInfo={() => setOpenStatInfo(p => (p === 1 ? null : 1))}
              onCloseInfo={() => setOpenStatInfo(p => (p === 1 ? null : p))}
            />
            <StatCard icon="account_balance_wallet" label="Amount Collected"   value={fmt(perfStats.payReceived)} 
              isInfoOpen={openStatInfo === 2}
              onToggleInfo={() => setOpenStatInfo(p => (p === 2 ? null : 2))}
              onCloseInfo={() => setOpenStatInfo(p => (p === 2 ? null : p))}
            />
            <StatCard icon="pending_actions"        label="Amount Outstanding" value={fmt(perfStats.outstanding)} 
              isInfoOpen={openStatInfo === 3}
              onToggleInfo={() => setOpenStatInfo(p => (p === 3 ? null : 3))}
              onCloseInfo={() => setOpenStatInfo(p => (p === 3 ? null : p))}
            />
          </div>
        </section>

        <Section title="Orders" period={orderPeriod} onPeriodChange={setOrderPeriod}>
          <div className={styles.chartCard}>
            <div className={styles.chartCardInner}>
              <DonutChart
                segments={[
                  { value: orderStats.delivered,  color: '#818cf8' },
                  { value: orderStats.inProgress, color: '#fb923c' },
                  { value: orderStats.completed,  color: '#22c55e' },
                  { value: orderStats.overdue,    color: '#ef4444' },
                  { value: orderStats.other,      color: '#94a3b8' },
                ]}
                centerLabel={orderStats.total}
                centerSub="Total"
              />
              <div className={styles.statusRows}>
                <StatusRow label="Delivered"   count={orderStats.delivered}  total={orderStats.total} color="#818cf8" />
                <StatusRow label="In Progress" count={orderStats.inProgress} total={orderStats.total} color="#fb923c" />
                <StatusRow label="Completed"   count={orderStats.completed}  total={orderStats.total} color="#22c55e" />
                <StatusRow label="Overdue"     count={orderStats.overdue}    total={orderStats.total} color="#ef4444" />
                {orderStats.other > 0 && (
                  <StatusRow label="Other" count={orderStats.other} total={orderStats.total} color="#94a3b8" />
                )}
              </div>
            </div>
            {orderStats.avgDays !== null && (
              <InsightRow items={[
                { value: `${orderStats.avgDays}d`, label: 'Usual Wait Time' },
                { value: `${pct(orderStats.delivered + orderStats.completed, orderStats.total)}%`, label: 'Orders Finished' },
              ]} />
            )}
          </div>
        </Section>

        <Section title="Customers" period={custPeriod} onPeriodChange={setCustPeriod}>
          <div className={styles.chartCard}>
            <div className={styles.chartCardInner}>
              <DonutChart
                segments={[
                  { value: custStats.newCount,      color: '#22c55e' },
                  { value: custStats.repeatCount,   color: '#818cf8' },
                  { value: custStats.activeCount,   color: '#fb923c' },
                  { value: custStats.inactiveCount, color: '#94a3b8' },
                ]}
                centerLabel={custStats.total}
                centerSub="Clients"
              />
              <div className={styles.statusRows}>
                <StatusRow label="New"           count={custStats.newCount}      total={custStats.total} color="#22c55e" />
                <StatusRow label="Repeat"        count={custStats.repeatCount}   total={custStats.total} color="#818cf8" />
                <StatusRow label="One-time"      count={custStats.activeCount}   total={custStats.total} color="#fb923c" />
                <StatusRow label="No Orders Yet" count={custStats.inactiveCount} total={custStats.total} color="#94a3b8" />
              </div>
            </div>
            <InsightRow items={[
              { value: custStats.newCount,    label: 'New This Period'      },
              { value: custStats.repeatCount, label: 'Repeat Clients'       },
              { value: custStats.avgOrders,   label: 'Avg Orders / Client'  },
            ]} />
          </div>
        </Section>

        <Section title="Appointments" period={apptPeriod} onPeriodChange={setApptPeriod}>
          <div className={styles.chartCard}>
            <div className={styles.chartCardInner}>
              <DonutChart
                segments={[
                  { value: apptStats.done,      color: '#22c55e' },
                  { value: apptStats.upcoming,  color: '#818cf8' },
                  { value: apptStats.missed,    color: '#ef4444' },
                  { value: apptStats.cancelled, color: '#94a3b8' },
                ]}
                centerLabel={apptStats.total}
                centerSub="Total"
              />
              <div className={styles.statusRows}>
                <StatusRow label="Completed" count={apptStats.done}      total={apptStats.total} color="#22c55e" />
                <StatusRow label="Upcoming"  count={apptStats.upcoming}  total={apptStats.total} color="#818cf8" />
                <StatusRow label="Missed"    count={apptStats.missed}    total={apptStats.total} color="#ef4444" />
                <StatusRow label="Cancelled" count={apptStats.cancelled} total={apptStats.total} color="#94a3b8" />
              </div>
            </div>
            {apptStats.showUpRate !== null && (
              <InsightRow items={[
                { value: `${apptStats.showUpRate}%`, label: 'Show-up Rate' },
                { value: `${apptStats.cancelRate ?? 0}%`, label: 'Cancelled' },
              ]} />
            )}
          </div>
        </Section>

        <Section title="Tasks" period={taskPeriod} onPeriodChange={setTaskPeriod}>
          <div className={styles.chartCard}>
            <div className={styles.chartCardInner}>
              <DonutChart
                segments={[
                  { value: taskStats.done,    color: '#22c55e' },
                  { value: taskStats.pending, color: '#818cf8' },
                  { value: taskStats.overdue, color: '#ef4444' },
                ]}
                centerLabel={`${pct(taskStats.done, taskStats.total)}%`}
                centerSub="Done"
              />
              <div className={styles.statusRows}>
                <StatusRow label="Completed"   count={taskStats.done}    total={taskStats.total} color="#22c55e" />
                <StatusRow label="In Progress" count={taskStats.pending} total={taskStats.total} color="#818cf8" />
                <StatusRow label="Overdue"     count={taskStats.overdue} total={taskStats.total} color="#ef4444" />
              </div>
            </div>
            {taskStats.total > 0 && (
              <InsightRow items={[
                { value: `${pct(taskStats.done, taskStats.total)}%`, label: 'Completion Rate' },
                { value: `${pct(taskStats.overdue, taskStats.total)}%`, label: 'Overdue Rate' },
              ]} />
            )}
          </div>
        </Section>


        <div style={{ height: 40 }} />
      </div>

      <BottomNav />
    </div>
  )
}
