import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTour } from '../../contexts/TourContext'
import styles from './BottomNav.module.css'

const NAV_ITEMS = [
  { icon: 'dashboard',     label: 'Dashboard',    route: '/'             },
  { icon: 'groups',        label: 'Customers',    route: '/customers'    },
  { icon: 'event',         label: 'Appointments', route: '/appointments' },
  { icon: 'shopping_cart', label: 'All Orders',   route: '/orders'       },
  { icon: 'assignment',    label: 'Tasks',        route: '/tasks'        },
]

function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { currentStep, completeStep, isActive: tourActive, guardNavigation } = useTour()
  const [hidden, setHidden] = useState(false)

  const lastY     = useRef(0)
  const ticking   = useRef(false)
  const hiddenRef = useRef(false)

  useEffect(() => {
    const onScroll = (e) => {
      if (tourActive) return

      const target = e.target.scrollingElement ?? e.target

      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const currentY = target.scrollTop
        const delta    = currentY - lastY.current

        if (Math.abs(delta) > 6) {
          const shouldHide = delta > 0 && currentY > 80

          if (shouldHide !== hiddenRef.current) {
            hiddenRef.current = shouldHide
            setHidden(shouldHide)
          }

          lastY.current = currentY
        }

        ticking.current = false
      })
    }

    setHidden(false)
    hiddenRef.current = false
    lastY.current = 0

    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [pathname])

  useEffect(() => {
    if (!tourActive) return
    setHidden(false)
    hiddenRef.current = false
  }, [tourActive])

  function handleNavClick(item) {
    const isExpectedTourStep = item.route === '/customers' && currentStep?.id === 'goto-customers-nav'
    if (isExpectedTourStep) {
      completeStep('goto-customers-nav')
      navigate(item.route)
      return
    }
    guardNavigation(() => {
      navigate(item.route)
    })
  }

  return (
    <nav className={`${styles.bottomNav} ${hidden ? styles.bottomNavHidden : ''}`}>
      {NAV_ITEMS.map(item => {
        const isActive = item.route === '/'
          ? pathname === '/' || pathname === '/home'
          : pathname.startsWith(item.route)

        return (
          <button
            key={item.route}
            className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
            onClick={() => handleNavClick(item)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            data-tour={item.route === '/customers' ? 'nav-customers' : undefined}
          >
            <span className={`mi ${styles.navIcon}`}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            {isActive && <span className={styles.activeDot} />}
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
