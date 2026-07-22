import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useInstall } from '../../contexts/InstallContext'
import styles from './LandingPage.module.css'

const THEME_STORAGE_KEY = 'tailorpady-theme'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#product', label: 'Product' },
  { href: '#how', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

const SECTION_IDS = NAV_LINKS.map(link => link.href.slice(1))

const ABOUT_STATS = [
  { icon: 'storefront', value: '5+', label: 'Active tailors' },
  { icon: 'shopping_bag', value: '30+', label: 'Orders tracked' },
  { icon: 'straighten', value: '70+', label: 'Measurements stored' },
]

const FEATURES = [
  {
    icon: 'people',
    title: 'Customers & measurements',
    body: 'Every client, every body measurement, every fit note, saved once and pulled up in seconds from any device in the shop.',
  },
  {
    icon: 'shopping_bag',
    title: 'Orders & tasks',
    body: 'Split an order into cutting, stitching, embroidery, and finishing. Assign each step to a worker and watch it move across the board.',
  },
  {
    icon: 'receipt_long',
    title: 'Invoices, receipts & payments',
    body: 'Bill in naira or any currency you choose, track what is paid against what is owed, and hand over a clean receipt at pickup.',
  },
  {
    icon: 'inventory_2',
    title: 'Inventory',
    body: 'Know what fabric and trims are on the shelf, with low-stock alerts, before you promise a delivery date you cannot keep.',
  },
  {
    icon: 'event',
    title: 'Appointments',
    body: 'Book fittings and collections against your real shop hours, with reminders that reach the customer before they forget.',
  },
  {
    icon: 'bar_chart',
    title: 'Reports',
    body: 'See today\u2019s orders, today\u2019s payments, and the monthly numbers that tell you how the shop is actually doing.',
  },
  {
    icon: 'photo_library',
    title: 'Gallery & portfolio',
    body: 'Photograph finished pieces and publish a branded portfolio link clients can browse before they choose a style.',
  },
  {
    icon: 'smart_toy',
    title: 'Pady, the AI agent',
    body: 'Ask in plain language for anything above: this week\u2019s dues, a customer\u2019s last measurements, or a stock count.',
    featured: true,
  },
]

const ABOUT_CONTENT = {
  eyebrow: 'About TailorPady',
  title: 'One app for the whole shop, from measurement to delivery',
  body: 'TailorPady replaces the notebooks, WhatsApp chats, and loose paper slips most tailoring shops run on with a single place to manage customers, orders, payments, and everything in between.',
}

const ABOUT_POINTS = ['Works offline first', 'No training required']

const MISSION_STATEMENT =
  'We believe every tailoring shop deserves the same tools the big fashion houses already have.'

const MISSION_SUB =
  'TailorPady exists to give independent tailors and designers a system that keeps up with their craft, so the business behind the stitches runs as smoothly as the stitches themselves.'

const SHOWCASE_ITEMS = [
  { label: 'Manage Dashboard', image: '/landingPageImages/screen-dashboard.jpg' },
  { label: 'Manage Customers', image: '/landingPageImages/screen-customers.jpg' },
  { label: 'Customer Details', image: '/landingPageImages/screen-customer-details.jpg' },
  { label: 'Manage Measurements', image: '/landingPageImages/screen-customer-measurements.jpg' },
  { label: 'Manage Orders', image: '/landingPageImages/screen-orders.jpg' },
  { label: 'Manage Invoices', image: '/landingPageImages/screen-invoices.jpg' },
  { label: 'Manage Receipts', image: '/landingPageImages/screen-receipts.jpg' },
]

const HERO_SCREENS = [
  '/landingPageImages/screen-dashboard.jpg',
  '/landingPageImages/screen-customers.jpg',
  '/landingPageImages/screen-customer-details.jpg',
  '/landingPageImages/screen-customer-measurements.jpg',
  '/landingPageImages/screen-orders.jpg',
  '/landingPageImages/screen-invoices.jpg',
  '/landingPageImages/screen-receipts.jpg',
]

const STEPS = [
  {
    n: '01',
    icon: 'storefront',
    title: 'Set up your shop',
    body: 'Add your shop name, address, currency, and workers. It takes a few minutes and there is nothing to install.',
  },
  {
    n: '02',
    icon: 'group_add',
    title: 'Bring in your customers',
    body: 'Enter your existing clients and their measurements once. You will never re-measure from scratch again.',
  },
  {
    n: '03',
    icon: 'insights',
    title: 'Run the shop from TailorPady',
    body: 'Take orders, assign tasks, bill, and report from one place, on the counter tablet or your phone in the back room.',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'I stopped keeping measurements on paper the week I started using this. Nothing gets lost between the counter and the tailor now.',
    name: 'Amara O.',
    role: 'Boutique owner, Port Harcourt',
  },
  {
    quote:
      'The task board is what sold me. I can see exactly which order is stuck on embroidery without calling anyone.',
    name: 'Segun A.',
    role: 'Tailoring shop owner, Lagos',
  },
  {
    quote:
      'Payments and dues used to live in my head. Now they live in the app, and my head is a lot quieter.',
    name: 'Ifeoma K.',
    role: 'Fashion designer, Enugu',
  },
  {
    quote:
      'My workers know exactly what stage every order is at without asking me. That alone was worth switching.',
    name: 'Chinedu M.',
    role: 'Shop owner, Aba',
  },
  {
    quote:
      'Clients love that I can pull up their measurements from two years ago in seconds. It makes us look serious.',
    name: 'Blessing U.',
    role: 'Fashion designer, Abuja',
  },
]

const FREE_FEATURES = [
  { icon: 'group', label: 'Up to 15 customers' },
  { icon: 'straighten', label: 'Full body & cloth measurements' },
  { icon: 'receipt_long', label: '20 active orders / month' },
  { icon: 'description', label: 'All invoice & receipt templates' },
  { icon: 'print', label: '10 invoice + 10 receipt generations / month' },
  { icon: 'palette', label: 'Basic branding customisation' },
  { icon: 'photo_library', label: '15 portfolio uploads / month' },
  { icon: 'link', label: 'Public portfolio link' },
  { icon: 'star_rate', label: '5 review links / month' },
  { icon: 'payments', label: 'Basic payment tracking' },
  { icon: 'smart_toy', label: '3 AI assistant actions / month' },
  { icon: 'cake', label: 'Birthday reminders' },
]

const PRO_FEATURES = [
  { icon: 'all_inclusive', label: 'Unlimited customers' },
  { icon: 'all_inclusive', label: 'Unlimited measurements' },
  { icon: 'all_inclusive', label: 'Unlimited active orders' },
  { icon: 'all_inclusive', label: 'Unlimited invoice & receipt generations' },
  { icon: 'palette', label: 'Full branding — logo, colours, signature' },
  { icon: 'account_balance', label: 'Bank details & T&Cs on every document' },
  { icon: 'photo_library', label: 'Unlimited portfolio uploads' },
  { icon: 'auto_awesome', label: 'Fully branded portfolio page' },
  { icon: 'star', label: 'Unlimited review links' },
  { icon: 'bar_chart', label: 'Advanced payment tracking & reports' },
  { icon: 'smart_toy', label: 'Unlimited AI assistant actions' },
  { icon: 'edit_note', label: 'Smart invoice auto-drafts' },
  { icon: 'campaign', label: 'Customer re-engagement reminders' },
  { icon: 'cloud', label: 'Expanded cloud storage' },
]

const FREE_PLAN = {
  name: 'Free',
  price: '₦0',
  period: 'forever',
  tagline: 'Everything a one-person shop needs to get off paper.',
  features: FREE_FEATURES,
  cta: 'Start free',
  highlighted: false,
}

const PLANS_BY_BILLING = {
  monthly: [
    FREE_PLAN,
    {
      name: 'Pro',
      price: '₦1,200',
      period: 'per month',
      tagline: 'For shops that have outgrown the free limits.',
      features: PRO_FEATURES,
      cta: 'Go Pro',
      highlighted: true,
    },
  ],
  yearly: [
    FREE_PLAN,
    {
      name: 'Pro',
      price: '₦9,999',
      period: 'per year',
      tagline: 'For shops that have outgrown the free limits.',
      features: PRO_FEATURES,
      cta: 'Go Pro',
      highlighted: true,
      badge: 'Save 31%',
      subNote: '≈ ₦833 / month',
    },
  ],
}

const BILLING_TABS = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
]

const FAQ_PREVIEW = [
  {
    q: 'Does TailorPady work without internet?',
    a: 'Yes. It runs fully offline and syncs to the cloud automatically the moment you are back online.',
  },
  {
    q: 'Can I customise my invoices and receipts?',
    a: 'Yes, for everyone, for free. Choose a template and set your bank details and footer message in Settings.',
  },
  {
    q: 'What does the AI assistant actually do?',
    a: 'Pady can draft receipts, invoices, and birthday messages, and remind you before an order slips.',
  },
  {
    q: 'How many invoices can I send on the free plan?',
    a: 'Up to 10 invoices and 10 receipts a month, alongside 20 active orders. Pro removes every limit.',
  },
]

const FOOTER_COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms & conditions', to: '/terms' },
      { label: 'Refund policy', to: '/refund' },
    ],
  },
]

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || navigator.vendor || ''
  const isAppleHandheld = /iPad|iPhone|iPod/.test(ua)
  const isIPadOnMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isAppleHandheld || isIPadOnMac
}

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin: '0px 0px -80px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}

function useTheme() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
      return
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_STORAGE_KEY, next)
      return next
    })
  }

  return [theme, toggleTheme]
}

function Reveal({ as: Tag = 'div', children, className = '', delay = 0, style, ...rest }) {
  const [ref, inView] = useInView()
  const combined = `${styles.reveal} ${inView ? styles.revealVisible : ''} ${className}`.trim()
  return (
    <Tag ref={ref} className={combined} style={{ '--reveal-delay': `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  )
}

function formatStatic(value) {
  return value.replace(/[\d.,]+/, m => (m.includes('.') ? '0.0' : '0'))
}

function useCountUp(value, inView, duration = 1400) {
  const [display, setDisplay] = useState(() => formatStatic(value))
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView || startedRef.current) return
    startedRef.current = true

    const match = value.match(/[\d.,]+/)
    if (!match) {
      setDisplay(value)
      return
    }

    const raw = match[0]
    const prefix = value.slice(0, match.index)
    const suffix = value.slice(match.index + raw.length)
    const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
    const target = parseFloat(raw.replace(/,/g, ''))
    const start = performance.now()

    const tick = now => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased
      const formatted =
        decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()
      setDisplay(`${prefix}${formatted}${suffix}`)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [inView, value, duration])

  return display
}

function AboutStatValue({ value }) {
  const [ref, inView] = useInView(0.5)
  const display = useCountUp(value, inView)
  return (
    <span ref={ref} className={styles.aboutStatValue}>
      {display}
    </span>
  )
}

function MonoLabel({ children }) {
  return <span className={styles.monoLabel}>{children}</span>
}

function InstallButton({ className, fullWidth }) {
  const install = useInstall()
  const [showIOSHint, setShowIOSHint] = useState(false)

  if (!install || install.isInstalled) return null

  const iOS = isIOSDevice()
  if (!install.installPrompt && !iOS) return null

  const handleClick = async () => {
    if (install.installPrompt) {
      await install.triggerInstall()
      return
    }
    setShowIOSHint(prev => !prev)
  }

  return (
    <div className={`${styles.installWrap} ${fullWidth ? styles.installWrapFull : ''}`}>
      <button type="button" className={`${styles.installButton} ${className || ''}`} onClick={handleClick}>
        <span className="mi" style={{ fontSize: '1.05rem' }}>install_mobile</span>
        Install app
      </button>
      {showIOSHint && (
        <div className={styles.installHint}>
          <span className={styles.installHintTitle}>Install on iPhone or iPad</span>
          <ol className={styles.installHintList}>
            <li>Tap the Share icon in Safari</li>
            <li>Scroll down and tap Add to Home Screen</li>
            <li>Tap Add to confirm</li>
          </ol>
          <button type="button" className={styles.installHintClose} onClick={() => setShowIOSHint(false)}>
            Got it
          </button>
        </div>
      )}
    </div>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="mi">{isDark ? 'light_mode' : 'dark_mode'}</span>
    </button>
  )
}

function SiteNav({ onNavigate, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const activeSection = useActiveSection(SECTION_IDS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={styles.navInner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>TP</span>
        </Link>

        <nav className={styles.navLinks}>
          {NAV_LINKS.map(link => {
            const id = link.href.slice(1)
            const isActive = id === activeSection
            return (
              <a key={link.href} href={link.href} className={isActive ? styles.navLinkActive : ''}>
                <span className={styles.navLinkIndicator} />
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className={styles.navActions}>
          <div className={styles.navUtility}>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <InstallButton />
          </div>
          <div className={styles.navButtonGroup}>
            <Link to="/login" className={styles.navLogin}>
              Log in
            </Link>
            <button type="button" className={styles.navCta} onClick={() => onNavigate('/signup')}>
              Start free
            </button>
          </div>
        </div>

        <div className={styles.navMobileTrigger}>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            className={styles.navMenuButton}
            onClick={() => setOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            <span className="mi">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.navMobilePanel}>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <div className={styles.navMobileActions}>
            <InstallButton className={styles.navMobileFullButton} fullWidth />
            <Link to="/login" className={styles.navLoginMobile}>
              Log in
            </Link>
            <button type="button" className={styles.navCta} onClick={() => onNavigate('/signup')}>
              Start free
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

function PhoneMockup() {
  const [index, setIndex] = useState(0)
  const total = HERO_SCREENS.length

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % total)
    }, 3200)
    return () => clearInterval(id)
  }, [total])

  return (
    <div className={styles.phoneWrap}>
      <div className={styles.phone}>
        <div className={styles.phoneScreen}>
          <div
            className={styles.phoneCarouselTrack}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {HERO_SCREENS.map(src => (
              <img key={src} src={src} alt="TailorPady app screen" className={styles.phoneCarouselSlide} loading="lazy" />
            ))}
          </div>
        </div>
        <img src="/landingPageImages/phone-frame.png" alt="" className={styles.phoneFrameImage} />
      </div>
    </div>
  )
}

function Hero({ onNavigate }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroTitle}>
          The operating system
          for your tailoring shop.
        </h1>
        <p className={styles.heroBody}>
          Manage your tailoring business without the paperwork.
          Spend less time managing and more time sewing.
        </p>
        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryButton} onClick={() => onNavigate('/signup')}>
            Start free
          </button>
          <a href="#product" className={styles.secondaryButton}>
            See the app
          </a>
        </div>
      </div>

      <div className={styles.heroVisual}>
        <PhoneMockup />
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title, align = 'left' }) {
  return (
    <Reveal
      as="div"
      className={`${styles.sectionHeading} ${align === 'center' ? styles.sectionHeadingCenter : ''}`}
    >
      <MonoLabel>{eyebrow}</MonoLabel>
      <h2 className={styles.sectionTitle}>{title}</h2>
    </Reveal>
  )
}

function Features() {
  return (
    <section id="features" className={styles.features}>
      <SectionHeading eyebrow="Features" title="Every part of the shop, in one app" />
      <div className={styles.featureGrid}>
        {FEATURES.map((f, i) => (
          <Reveal
            key={f.title}
            as="div"
            className={`${styles.featureCard} ${f.featured ? styles.featureCardFeatured : ''}`}
            delay={(i % 4) * 60}
          >
            {f.featured && <span className={styles.featuredBadge}>AI</span>}
            <span className={`mi ${styles.featureIconRoundel}`}>{f.icon}</span>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureBody}>{f.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function AboutApp() {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.aboutText}>
        <SectionHeading eyebrow={ABOUT_CONTENT.eyebrow} title={ABOUT_CONTENT.title} />
        <Reveal as="p" className={styles.aboutBody} delay={60}>
          {ABOUT_CONTENT.body}
        </Reveal>
        <Reveal as="ul" className={styles.aboutChecklist} delay={120}>
          {ABOUT_POINTS.map(point => (
            <li key={point} className={styles.aboutChecklistItem}>
              <span className={`mi ${styles.aboutCheckIcon}`}>check_circle</span>
              {point}
            </li>
          ))}
        </Reveal>
      </div>

      <div className={styles.aboutStats}>
        {ABOUT_STATS.map((stat, i) => (
          <Reveal key={stat.label} as="div" className={styles.aboutStat} delay={180 + i * 70}>
            <span className={`mi ${styles.aboutStatIcon}`}>{stat.icon}</span>
            <div className={styles.aboutStatText}>
              <AboutStatValue value={stat.value} />
              <span className={styles.aboutStatLabel}>{stat.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Mission() {
  return (
    <section id="mission" className={styles.mission}>
      <div className={styles.missionInner}>
        <Reveal as="div">
          <MonoLabel>Our mission</MonoLabel>
          <p className={styles.missionStatement}>{MISSION_STATEMENT}</p>
          <p className={styles.missionSub}>{MISSION_SUB}</p>
        </Reveal>
      </div>
    </section>
  )
}

function ProductShowcase() {
  return (
    <section id="product" className={styles.showcase}>
      <SectionHeading eyebrow="Inside the app" title="A closer look at TailorPady" align="center" />
      <div className={styles.showcaseBand}>
        <div className={styles.showcaseGrid}>
          {SHOWCASE_ITEMS.map((item, i) => (
            <Reveal key={item.label} as="div" className={styles.showcaseItem} delay={i * 70}>
              <div className={styles.showcasePhone}>
                <img src={item.image} alt={item.label} className={styles.showcasePhoneScreen} loading="lazy" />
                <img src="/landingPageImages/phone-frame.png" alt="" className={styles.showcasePhoneFrame} />
              </div>
              <span className={styles.showcaseItemLabel}>{item.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how" className={styles.how}>
      <SectionHeading eyebrow="How it works" title="Three steps to run your shop on TailorPady" align="center" />
      <div className={styles.howTimeline}>
        {STEPS.map((s, i) => (
          <Reveal key={s.n} as="div" className={styles.howItem} delay={i * 120}>
            <span className={`mi ${styles.howIconWrap}`}>{s.icon}</span>
            <div className={styles.howCard}>
              <span className={styles.howNumber}>Step {s.n}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepBody}>{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Testimonials() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section id="reviews" className={styles.reviews}>
      <div className={styles.reviewsInner}>
        <SectionHeading eyebrow="Shops using TailorPady" title="What shop owners say" align="center" />
      </div>
      <div className={styles.marqueeViewport}>
        <div className={styles.marqueeTrack}>
          {loop.map((t, i) => (
            <figure className={styles.reviewCard} key={`${t.name}-${i}`}>
              <blockquote className={styles.reviewQuote}>{t.quote}</blockquote>
              <figcaption className={styles.reviewMeta}>
                <span className={styles.reviewAvatar}>{t.name.charAt(0)}</span>
                <span className={styles.reviewMetaText}>
                  <span className={styles.reviewName}>{t.name}</span>
                  <span className={styles.reviewRole}>{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingTeaser({ onNavigate }) {
  const [billing, setBilling] = useState('monthly')
  const plans = PLANS_BY_BILLING[billing]

  return (
    <section id="pricing" className={styles.pricing}>
      <SectionHeading eyebrow="Pricing" title="Start free, upgrade when the shop grows" align="center" />

      <div className={styles.billingToggle}>
        {BILLING_TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.billingToggleBtn} ${billing === tab.key ? styles.billingToggleBtnActive : ''}`}
            onClick={() => setBilling(tab.key)}
          >
            {tab.label}
            {tab.key === 'yearly' && <span className={styles.billingToggleBadge}>Save 31%</span>}
          </button>
        ))}
      </div>

      <div className={styles.pricingGrid}>
        {plans.map((plan, i) => (
          <Reveal
            key={`${plan.name}-${billing}`}
            as="div"
            className={`${styles.pricingCard} ${plan.highlighted ? styles.pricingCardHighlighted : ''}`}
            delay={i * 100}
          >
            <div className={styles.pricingCardHead}>
              <span className={styles.pricingName}>{plan.name}</span>
              <div className={styles.pricingPriceRow}>
                <span className={styles.pricingPrice}>{plan.price}</span>
                <span className={styles.pricingPeriod}>{plan.period}</span>
                {plan.badge && <span className={styles.pricingCardBadge}>{plan.badge}</span>}
              </div>
              {plan.subNote && <span className={styles.pricingSubNote}>{plan.subNote}</span>}
              <p className={styles.pricingTagline}>{plan.tagline}</p>
            </div>
            <ul className={styles.pricingList}>
              {plan.features.map(feature => (
                <li key={feature.label} className={styles.pricingListItem}>
                  <span className={`mi ${styles.pricingCheck}`}>{feature.icon}</span>
                  {feature.label}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={plan.highlighted ? styles.primaryButton : styles.outlineButton}
              onClick={() => onNavigate('/signup')}
            >
              {plan.cta}
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function FAQPreview() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className={styles.faq}>
      <SectionHeading eyebrow="Questions" title="Answers before you ask" />
      <div className={styles.faqList}>
        {FAQ_PREVIEW.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <Reveal as="div" key={item.q} className={styles.faqItem} delay={(i % 2) * 60}>
              <button
                type="button"
                className={styles.faqTrigger}
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span className={styles.faqQ}>{item.q}</span>
                <span className={`mi ${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}>add</span>
              </button>
              <div className={`${styles.faqPanel} ${isOpen ? styles.faqPanelOpen : ''}`}>
                <div className={styles.faqPanelInner}>
                  <p className={styles.faqA}>{item.a}</p>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
      <Link to="/faq" className={styles.faqMore}>
        See all questions
        <span className="mi" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
      </Link>
    </section>
  )
}

function FinalCTA({ onNavigate }) {
  return (
    <section className={styles.cta}>
      <Reveal as="div" className={styles.ctaInner}>
        <MonoLabel>Ready when you are</MonoLabel>
        <h2 className={styles.ctaTitle}>Give your shop the system it deserves</h2>
        <p className={styles.ctaBody}>
          Join tailors moving off paper and WhatsApp. Free to start, no card required.
        </p>
        <button type="button" className={styles.ctaButton} onClick={() => onNavigate('/signup')}>
          Start free
        </button>
      </Reveal>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogoMark}>TP</span>
          </div>
          <div className={styles.footerColumns}>
            {FOOTER_COLUMNS.map(col => (
              <div key={col.heading} className={styles.footerColumn}>
                <span className={styles.footerColumnHeading}>{col.heading}</span>
                {col.links.map(link =>
                  link.to ? (
                    <Link key={link.label} to={link.to}>
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.label} href={link.href}>
                      {link.label}
                    </a>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} TailorPady. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const goTo = path => navigate(path)
  const [theme, toggleTheme] = useTheme()

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduced) {
      document.documentElement.style.scrollBehavior = 'smooth'
    }
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <div className={styles.page} data-theme={theme}>
      <SiteNav onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      <main className={styles.mainContent}>
        <Hero onNavigate={goTo} />
        <AboutApp />
        <Features />
        <ProductShowcase />
        <HowItWorks />
        <Mission />
        <Testimonials />
        <PricingTeaser onNavigate={goTo} />
        <FAQPreview />
        <FinalCTA onNavigate={goTo} />
      </main>
      <SiteFooter />
    </div>
  )
}
