import { useState, useMemo } from 'react'
import { useOrders }    from '../../contexts/OrdersContext'
import { useTasks }     from '../../contexts/TaskContext'
import { usePayments }  from '../../contexts/PaymentContext'
import { useCustomers } from '../../contexts/CustomerContext'
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

function StatCard({ icon, label, value, sub }) {
  return (
    <div className={styles.statCard}>
      <span className={`mi ${styles.statIcon}`}>{icon}</span>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

function CollectionBar({ rate }) {
  return (
    <div className={styles.collectionCard}>
      <div className={styles.collectionTop}>
        <div>
          <div className={styles.collectionLabel}>Collection Rate</div>
          <div className={styles.collectionSub}>Payments received vs order value</div>
        </div>
        <div className={styles.collectionRate}>{rate}%</div>
      </div>
      <div className={styles.collectionTrack}>
        <div className={styles.collectionFill} style={{ width: `${Math.min(rate, 100)}%` }} />
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

  const [perfPeriod,  setPerfPeriod]  = useState('month')
  const [orderPeriod, setOrderPeriod] = useState('month')
  const [taskPeriod,  setTaskPeriod]  = useState('month')
  const [custPeriod,  setCustPeriod]  = useState('month')

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

    const collectionRate = orderValue > 0 ? Math.round((payReceived / orderValue) * 100) : 0
    const outstanding    = Math.max(0, orderValue - payReceived)
    return { totalOrders, orderValue, payReceived, collectionRate, outstanding }
  }, [orders, allPayments, perfPeriod])

  const orderStats = useMemo(() => {
    const start      = periodStart(orderPeriod)
    const filtered   = orders.filter(o => inPeriod(o, start))
    const total      = filtered.length
    const delivered  = filtered.filter(o => o.status === 'delivered').length
    const inProgress = filtered.filter(o => o.status === 'pending' || o.status === 'in_progress').length
    const completed  = filtered.filter(o => o.status === 'completed').length
    const overdue    = filtered.filter(o => {
      if (!o.due) return false
      return new Date(o.due + 'T23:59:59') < new Date() &&
        o.status !== 'delivered' && o.status !== 'completed'
    }).length

    const turnaroundSamples = orders.filter(o => {
      const created = parseItemDate(o)
      return (o.status === 'delivered' || o.status === 'completed') && created && o.due
    })
    const avgDays = turnaroundSamples.length > 0
      ? Math.round(
          turnaroundSamples.reduce((s, o) => {
            const created = parseItemDate(o)
            const due     = new Date(o.due)
            return s + Math.max(0, (due - created) / (1000 * 60 * 60 * 24))
          }, 0) / turnaroundSamples.length
        )
      : null

    return { total, delivered, inProgress, completed, overdue, avgDays }
  }, [orders, orderPeriod])

  const taskStats = useMemo(() => {
    const start    = periodStart(taskPeriod)
    const filtered = tasks.filter(t => inPeriod(t, start))
    const total    = filtered.length
    const done     = filtered.filter(t => t.done).length
    const pending  = filtered.filter(t => !t.done && new Date(t.dueDate + 'T23:59:59') >= new Date()).length
    const overdue  = filtered.filter(t => {
      if (!t.dueDate || t.done) return false
      return new Date(t.dueDate + 'T23:59:59') < new Date()
    }).length
    return { total, done, pending, overdue }
  }, [tasks, taskPeriod])

  const custStats = useMemo(() => {
    const start      = periodStart(custPeriod)
    const newClients = customers.filter(c => inPeriod(c, start)).length
    const orderMap   = {}
    orders.forEach(o => {
      if (o.customerId) orderMap[o.customerId] = (orderMap[o.customerId] || 0) + 1
    })
    const repeatCount   = Object.values(orderMap).filter(c => c > 1).length
    const activeCount   = Object.keys(orderMap).length
    const inactiveCount = Math.max(0, customers.length - activeCount)
    const avgOrders     = customers.length > 0
      ? (orders.length / customers.length).toFixed(1)
      : '0'
    return { total: customers.length, newClients, repeatCount, inactiveCount, avgOrders }
  }, [customers, custPeriod, orders])

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Reports" />

      <div className={styles.scrollArea}>

        <Section title="Performance" period={perfPeriod} onPeriodChange={setPerfPeriod}>
          <CollectionBar rate={perfStats.collectionRate} />
          <div className={styles.statsGrid}>
            <StatCard icon="receipt_long"          label="Total Orders"  value={perfStats.totalOrders}     sub="in period"       />
            <StatCard icon="sell"                   label="Order Value"   value={fmt(perfStats.orderValue)} sub="est. revenue"    />
            <StatCard icon="account_balance_wallet" label="Received"      value={fmt(perfStats.payReceived)}                      />
            <StatCard icon="pending_actions"        label="Outstanding"   value={fmt(perfStats.outstanding)} sub="unpaid balance" />
          </div>
        </Section>

        <Section title="Orders" period={orderPeriod} onPeriodChange={setOrderPeriod}>
          <div className={styles.chartCard}>
            <div className={styles.chartCardInner}>
              <DonutChart
                segments={[
                  { value: orderStats.delivered,  color: '#818cf8' },
                  { value: orderStats.inProgress, color: '#fb923c' },
                  { value: orderStats.completed,  color: '#22c55e' },
                  { value: orderStats.overdue,    color: '#ef4444' },
                ]}
                centerLabel={orderStats.total}
                centerSub="Total"
              />
              <div className={styles.statusRows}>
                <StatusRow label="Delivered"   count={orderStats.delivered}  total={orderStats.total} color="#818cf8" />
                <StatusRow label="In Progress" count={orderStats.inProgress} total={orderStats.total} color="#fb923c" />
                <StatusRow label="Completed"   count={orderStats.completed}  total={orderStats.total} color="#22c55e" />
                <StatusRow label="Overdue"     count={orderStats.overdue}    total={orderStats.total} color="#ef4444" />
              </div>
            </div>
            {orderStats.avgDays !== null && (
              <InsightRow items={[
                { value: `${orderStats.avgDays}d`, label: 'Avg Turnaround' },
                { value: `${pct(orderStats.delivered + orderStats.completed, orderStats.total)}%`, label: 'Completion Rate' },
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
          </div>
        </Section>

        <Section title="Customers" period={custPeriod} onPeriodChange={setCustPeriod}>
          <div className={styles.chartCard}>
            <div className={styles.chartCardInner}>
              <DonutChart
                segments={[
                  { value: custStats.newClients,    color: '#22c55e' },
                  { value: custStats.repeatCount,   color: '#818cf8' },
                  { value: custStats.inactiveCount, color: '#94a3b8' },
                ]}
                centerLabel={custStats.total}
                centerSub="Clients"
              />
              <div className={styles.statusRows}>
                <StatusRow label="New"      count={custStats.newClients}    total={custStats.total} color="#22c55e" />
                <StatusRow label="Repeat"   count={custStats.repeatCount}   total={custStats.total} color="#818cf8" />
                <StatusRow label="Inactive" count={custStats.inactiveCount} total={custStats.total} color="#94a3b8" />
              </div>
            </div>
            <InsightRow items={[
              { value: custStats.newClients,  label: 'New This Period' },
              { value: custStats.repeatCount, label: 'Repeat Clients'  },
              { value: custStats.avgOrders,   label: 'Avg Orders'      },
            ]} />
          </div>
        </Section>

        <div style={{ height: 40 }} />
      </div>

      <BottomNav />
    </div>
  )
}
