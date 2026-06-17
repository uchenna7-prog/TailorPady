import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNotifications } from '../../contexts/NotificationContext'
import { useAutonomousAgent } from '../../contexts/AgentContext'
import styles from './Header.module.css'

const NOTIF_TYPE_BG = {
  order:       'rgba(168,85,247,0.12)',
  invoice:     'rgba(34,197,94,0.12)',
  task:        'rgba(99,102,241,0.12)',
  appointment: 'rgba(6,182,212,0.12)',
  birthday:    'rgba(251,146,60,0.12)',
  review:      'rgba(245,158,11,0.15)',
}

function timeLabel(timeStr) {
  if (!timeStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(timeStr)) {
    const diff = Math.round((new Date(timeStr + 'T00:00:00') - new Date().setHours(0, 0, 0, 0)) / 86400000)
    if (diff === 0)  return 'Today'
    if (diff === 1)  return 'Tomorrow'
    if (diff === -1) return 'Yesterday'
    if (diff < 0)    return `${Math.abs(diff)}d ago`
    return `In ${diff}d`
  }
  return timeStr
}

function NotifItem({ n, onRead, onNavigate }) {
  const handleClick = () => {
    if (n.unread) onRead(n.id)
    if (n.type === 'review') onNavigate?.('/reviews')
  }

  return (
    <div
      className={`${styles.notifItem} ${n.unread ? styles.notifItemUnread : ''} ${n.type === 'review' ? styles.notifItemReview : ''}`}
      onClick={handleClick}
      style={{ cursor: (n.type === 'review' || n.unread) ? 'pointer' : 'default' }}
    >
      <div className={styles.notifIcon} style={{ background: NOTIF_TYPE_BG[n.type] || 'var(--surface2)' }}>
        <span className={n.icon.outlined ? 'mi-outlined' : 'mi'} style={{ fontSize: '1.2rem' }}>
          {n.icon.name}
        </span>
      </div>
      <div className={styles.notifContent}>
        <h5>{n.title}</h5>
        <p>{n.body}</p>
        {n.type === 'review' && (
          <span className={styles.reviewHint}>Tap to review →</span>
        )}
        <span className={styles.notifTime}>{timeLabel(n.time)}</span>
      </div>
      {n.unread && <span className={styles.unreadDot} />}
    </div>
  )
}

export function BotIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="4" fill="currentColor" />
      <rect x="7" y="14.5" width="2.5" height="2.5" rx="0.6" fill="var(--bg)" />
      <rect x="14.5" y="14.5" width="2.5" height="2.5" rx="0.6" fill="var(--bg)" />
      <path d="M9.5 18.5h5" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 11V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="6.5" r="1.8" fill="currentColor" />
      <line x1="4" y1="15" x2="2" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function StatusDot({ active }) {
  return <span className={`${styles.statusDot} ${active ? styles.statusDotActive : ''}`} />
}

function Header({
  onMenuClick,
  onBackClick,
  type = 'default',
  showBorderBottom = true,
  showNotifications = true,
  showBotButton: showBotButtonProp = true,
  title,
  customTitle = {},
  customActions = [],
  backIcon = 'arrow_back_ios',
  scrolledAvatar = null,
  isScrolled: isScrolledProp = false,
  agentActive = false,
}) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifTab,  setNotifTab]  = useState('all')
  const [scrolled,  setScrolled]  = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const { drafts } = useAutonomousAgent()

  const agentPendingCount = drafts.length

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const PAGE_TITLES = {
    '/':          'Dashboard',
    '/customers': 'Customers',
    '/tasks':     'Tasks',
    '/settings':  'Settings',
    '/agent':     'Agent',
  }

  const pageTitle     = title || PAGE_TITLES[location.pathname] || 'TailorPady'
  const isAgentPage   = location.pathname === '/agent'
  const showBotButton = type === 'default' && showBotButtonProp && !isAgentPage

  const openNotif  = () => { setNotifTab('all'); setNotifOpen(true) }
  const closeNotif = () => setNotifOpen(false)

  const handleBack     = () => onBackClick ? onBackClick() : navigate(-1)
  const handleBotClick = () => navigate('/agent')

  const visibleNotifs = (() => {
    if (notifTab === 'unread') return notifications.filter(n => n.unread)
    if (notifTab === 'read')   return notifications.filter(n => !n.unread)
    return notifications
  })()

  const TABS = [
    { id: 'all',    label: 'All',    count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'read',   label: 'Read',   count: notifications.length - unreadCount },
  ]

  const filteredActions = customActions.filter(a => !a._isScrollAvatar)

  const BotButton = () => (
    <button
      className={styles.iconBtn}
      onClick={handleBotClick}
      aria-label="Open Agent"
      title="Pady — Sew Padi Agent"
    >
      <span className={styles.iconWithStatus}>
        <BotIcon />
        <StatusDot active={agentActive} />
      </span>
      {agentPendingCount > 0 && (
        <span className={styles.agentBadge}>
          {agentPendingCount > 9 ? '9+' : agentPendingCount}
        </span>
      )}
    </button>
  )

  return (
    <>
      <header
        className={[
          styles.header,
          scrolled && showBorderBottom ? styles.headerScrolled : '',
        ].join(' ')}
      >
        <div className={styles.left}>

          {type === 'default' && (
            <button className={styles.iconBtn} onClick={onMenuClick} aria-label="Open menu">
              <span className={styles.hamburger}><span /><span /><span /></span>
            </button>
          )}

          {type === 'back' && (
            <button className={styles.iconBtn} onClick={handleBack} aria-label="Go back">
              <span className="mi" style={{ fontSize: '1.4rem' }}>{backIcon}</span>
            </button>
          )}

          {type === 'back' && scrolledAvatar && (
            <div
              className={`${styles.scrollAvatar} ${isScrolledProp ? styles.scrollAvatarVisible : styles.scrollAvatarHidden}`}
              onClick={isScrolledProp ? scrolledAvatar.onClick : undefined}
              role={isScrolledProp ? 'button' : undefined}
              aria-hidden={!isScrolledProp}
            >
              {scrolledAvatar.src
                ? <img src={scrolledAvatar.src} className={styles.scrollAvatarImg} alt="" />
                : <span className={styles.scrollAvatarInitials}>{scrolledAvatar.initials}</span>
              }
            </div>
          )}

          {customTitle?.title ? (
            <div className={`${styles.customTitleWrap} ${isScrolledProp && scrolledAvatar ? styles.titleShifted : ''}`}>
              <div className={styles.customTitle}>
                {customTitle.iconComponent && (
                  <span className={styles.titleIcon}>
                    <customTitle.iconComponent />
                    <StatusDot active={agentActive} />
                  </span>
                )}
                <span>{customTitle.title}</span>
              </div>
            </div>
          ) : (
            <div className={`${styles.title} header-title ${isScrolledProp && scrolledAvatar ? styles.titleShifted : ''}`}>
              {pageTitle}
            </div>
          )}
        </div>

        {type === 'back' && (
          <div className={styles.right}>
            {filteredActions.map((action, i) => {
              if (action.customNode) {
                return (
                  <div key={i} className={styles.customNode}>
                    {action.customNode}
                  </div>
                )
              }
              return (
                <button
                  key={i}
                  className={`${action.label ? styles.textBtn : styles.iconBtn} ${styles.relativeBtn}`}
                  onClick={action.onClick}
                  aria-label={action.label || action.icon}
                  disabled={action.disabled}
                  style={!action.label ? { color: action.color || 'var(--text2)' } : {}}
                >
                  {action.icon && (
                    <span
                      className={`mi${action.outlined ? '-outlined' : ''}`}
                      style={{ fontSize: action.label ? '1.1rem' : '1.4rem' }}
                    >
                      {action.icon}
                    </span>
                  )}
                  {action.label && <span>{action.label}</span>}
                  {action.badge > 0 && (
                    <span className={styles.actionBadge}>
                      {action.badge > 9 ? '9+' : action.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {type === 'default' && (showNotifications || showBotButton) && (
          <div className={styles.right}>
            {showNotifications && (
              <button className={styles.iconBtn} onClick={openNotif} aria-label="Notifications">
                <span className="mi" style={{ fontSize: '1.4rem', color: 'var(--text2)' }}>notifications</span>
                {unreadCount > 0 && (
                  <span className={styles.notifBadge}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {showBotButton && <BotButton />}
          </div>
        )}
      </header>

      {type === 'default' && notifOpen && (
        <div className={styles.notifOverlay} onClick={e => e.target === e.currentTarget && closeNotif()}>
          <div className={styles.notifPanel}>

            <div className={styles.notifPanelHeader}>
              <span className={styles.notifPanelTitle}>Notifications</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {unreadCount > 0 && (
                  <button className={styles.markAllBtn} onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
                <button className={styles.iconBtn} onClick={closeNotif}>
                  <span className="mi" style={{ fontSize: '1.5rem' }}>close</span>
                </button>
              </div>
            </div>

            <div className={styles.notifTabs}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`${styles.notifTabBtn} ${notifTab === t.id ? styles.notifTabActive : ''}`}
                  onClick={() => setNotifTab(t.id)}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span className={`${styles.notifTabBadge} ${t.id === 'unread' && t.count > 0 ? styles.notifTabBadgeAlert : ''}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className={styles.notifBody}>
              {visibleNotifs.length === 0 ? (
                <div className={styles.notifEmpty}>
                  <span className="mi" style={{ fontSize: '2.5rem', opacity: 0.2 }}>
                    {notifTab === 'read' ? 'done_all' : 'notifications_none'}
                  </span>
                  <p>
                    {notifTab === 'unread'
                      ? 'All caught up!'
                      : notifTab === 'read'
                      ? 'No read notifications yet.'
                      : 'No notifications.'}
                  </p>
                </div>
              ) : (
                visibleNotifs.map(n => (
                  <NotifItem
                    key={n.id}
                    n={n}
                    onRead={markRead}
                    onNavigate={path => { closeNotif(); navigate(path) }}
                  />
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default Header
