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

const TRUST_STATS = [
  { value: '9,400+', label: 'Orders tracked' },
  { value: '430+', label: 'Shops onboard' },
  { value: '₦180M+', label: 'Invoiced through the app' },
]

const FEATURES = [
  {
    icon: 'people',
    tag: '01',
    title: 'Customers & measurements',
    body: 'Save every customer\u2019s measurements once. Find them again in seconds, on any device.',
  },
  {
    icon: 'shopping_bag',
    tag: '02',
    title: 'Orders & tasks',
    body: 'Break an order into steps like cutting, sewing, and finishing. Assign each step to a worker and watch it move along.',
  },
  {
    icon: 'receipt_long',
    tag: '03',
    title: 'Invoices, receipts & payments',
    body: 'Bill in any currency you like. See what is paid and what is still owed. Hand over a clean receipt when the customer picks up.',
  },
  {
    icon: 'inventory_2',
    tag: '04',
    title: 'Inventory',
    body: 'Know what fabric and trims you have left, with a warning before you run out.',
  },
  {
    icon: 'event',
    tag: '05',
    title: 'Appointments',
    body: 'Book fittings and pickups around your real shop hours. Customers get a reminder so they do not forget.',
  },
  {
    icon: 'bar_chart',
    tag: '06',
    title: 'Reports',
    body: 'See today\u2019s orders and payments at a glance, plus how the whole month is going.',
  },
  {
    icon: 'photo_library',
    tag: '07',
    title: 'Gallery & portfolio',
    body: 'Take photos of finished work and share a link customers can browse before they choose a style.',
  },
  {
    icon: 'smart_toy',
    tag: '08',
    title: 'Pady, the AI agent',
    body: 'Just ask, in plain language — like who owes you money this week, or when you last measured a customer.',
  },
]

const SHOWCASE_TABS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    title: 'The whole shop, on one screen',
    body: 'Open the app and see what is due today, what is late, and what just came in. No more keeping it all in your head.',
    image: '/images/landing/screen-dashboard.png',
  },
  {
    key: 'orders',
    label: 'Orders',
    title: 'Track every order from cut to collection',
    body: 'Move an order step by step: cutting, sewing, finishing. Everyone on your team knows exactly where it is at.',
    image: '/images/landing/screen-orders.png',
  },
  {
    key: 'invoices',
    label: 'Invoices',
    title: 'Bill and get paid without the back and forth',
    body: 'Create a bill in your own currency, send it on WhatsApp, and mark it paid the moment the money lands.',
    image: '/images/landing/screen-invoices.png',
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    title: 'A lookbook clients can find on their own',
    body: 'Snap a photo of every finished outfit. Customers can browse your work before they order.',
    image: '/images/landing/screen-portfolio.png',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Set up your shop',
    body: 'Add your shop name, address, and workers. Takes a few minutes. Nothing to install.',
  },
  {
    n: '02',
    title: 'Bring in your customers',
    body: 'Enter your customers and their measurements once. You will never measure from scratch again.',
  },
  {
    n: '03',
    title: 'Run your shop from TailorPady',
    body: 'Take orders, assign work, send bills, and check reports, all from one place, on your phone or tablet.',
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
]

const PLANS = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    tagline: 'Everything a small shop needs to get off paper.',
    features: [
      'Up to 15 customers',
      'Full body & cloth measurements',
      '20 active orders per month',
      '10 invoices & 10 receipts per month',
      'Basic branding',
      '3 AI assistant actions per month',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₦4,500',
    period: 'per month',
    tagline: 'For shops that have outgrown the free limits.',
    features: [
      'Unlimited customers & orders',
      'Unlimited invoices & receipts',
      'Full branding: logo, colours, signature',
      'Unlimited portfolio uploads',
      'Advanced payment tracking & reports',
      'Unlimited AI assistant actions',
    ],
    cta: 'Go Pro',
    highlighted: true,
  },
]

const FAQ_PREVIEW = [
  {
    q: 'Does TailorPady work without internet?',
    a: 'Yes. It works fully offline and updates itself the moment you are back online.',
  },
  {
    q: 'Can I customise my invoices and receipts?',
    a: 'Yes, for everyone, for free. Pick a template and add your bank details in Settings.',
  },
  {
    q: 'What does the AI assistant actually do?',
    a: 'Pady can write receipts, invoices, and birthday messages for you, and remind you before an order is late.',
  },
  {
    q: 'How many invoices can I send on the free plan?',
    a: 'You get 10 invoices, 10 receipts, and 20 active orders a month for free. Pro removes every limit.',
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

function Reveal({ as: Tag = 'div', children, className = '', delay = 0, ...rest }) {
  const [ref, inView] = useInView()
  const combined = `${styles.reveal} ${inView ? styles.revealVisible : ''} ${className}`.trim()
  return (
    <Tag ref={ref} className={combined} style={{ '--reveal-delay': `${delay}ms` }} {...rest}>
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

function TrustValue({ value }) {
  const [ref, inView] = useInView(0.5)
  const display = useCountUp(value, inView)
  return (
    <span ref={ref} className={styles.trustValue}>
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
          TailorPady
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
  return (
    <div className={styles.phone}>
      <div className={styles.phoneNotch} />
      <div className={styles.phoneScreen}>
        <img
          src="/images/landing/hero-dashboard.png"
          alt="TailorPady dashboard on a phone"
          className={styles.phoneImage}
          loading="lazy"
        />
      </div>
    </div>
  )
}

function Hero({ onNavigate }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroTitle}>
          Run your tailoring shop
          <br />
          from your phone.
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

function TrustBar() {
  return (
    <section className={styles.trustBar}>
      {TRUST_STATS.map((stat, i) => (
        <Reveal key={stat.label} as="div" className={styles.trustStat} delay={i * 90}>
          <TrustValue value={stat.value} />
          <span className={styles.trustLabel}>{stat.label}</span>
        </Reveal>
      ))}
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
      <SectionHeading eyebrow="Features" title="Everything your shop needs, in one app" />
      <div className={styles.featureGrid}>
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} as="div" className={styles.featureCard} delay={(i % 4) * 60}>
            <div className={styles.featureCardTop}>
              <span className={`mi ${styles.featureIcon}`}>{f.icon}</span>
              <span className={styles.featureTag}>{f.tag}</span>
            </div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureBody}>{f.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function ProductShowcase() {
  const [active, setActive] = useState(SHOWCASE_TABS[0].key)
  const current = SHOWCASE_TABS.find(tab => tab.key === active)

  return (
    <section id="product" className={styles.showcase}>
      <SectionHeading eyebrow="Inside the app" title="A closer look at TailorPady" align="center" />

      <div className={styles.showcaseTabs}>
        {SHOWCASE_TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.showcaseTab} ${tab.key === active ? styles.showcaseTabActive : ''}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.showcaseStage}>
        <div className={styles.showcaseCopy} key={`copy-${current.key}`}>
          <h3 className={styles.showcaseTitle}>{current.title}</h3>
          <p className={styles.showcaseBody}>{current.body}</p>
        </div>
        <div className={styles.showcaseFrame} key={`frame-${current.key}`}>
          <div className={styles.browserBar}>
            <span className={styles.browserDot} />
            <span className={styles.browserDot} />
            <span className={styles.browserDot} />
          </div>
          <img
            src={current.image}
            alt={`${current.label} screen in TailorPady`}
            className={styles.showcaseImage}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how" className={styles.how}>
      <SectionHeading eyebrow="How it works" title="Three simple steps to get started" />
      <div className={styles.stepGrid}>
        {STEPS.map((s, i) => (
          <Reveal key={s.n} as="div" className={styles.step} delay={i * 100}>
            <span className={styles.stepNumber}>{s.n}</span>
            <h3 className={styles.stepTitle}>{s.title}</h3>
            <p className={styles.stepBody}>{s.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="reviews" className={styles.reviews}>
      <SectionHeading eyebrow="Shops using TailorPady" title="What shop owners say" align="center" />
      <div className={styles.reviewGrid}>
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} as="figure" className={styles.reviewCard} delay={i * 100}>
            <blockquote className={styles.reviewQuote}>{t.quote}</blockquote>
            <figcaption className={styles.reviewMeta}>
              <span className={styles.reviewName}>{t.name}</span>
              <span className={styles.reviewRole}>{t.role}</span>
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function PricingTeaser({ onNavigate }) {
  return (
    <section id="pricing" className={styles.pricing}>
      <SectionHeading eyebrow="Pricing" title="Start free, upgrade when the shop grows" align="center" />
      <div className={styles.pricingGrid}>
        {PLANS.map((plan, i) => (
          <Reveal
            key={plan.name}
            as="div"
            className={`${styles.pricingCard} ${plan.highlighted ? styles.pricingCardHighlighted : ''}`}
            delay={i * 100}
          >
            <div className={styles.pricingCardHead}>
              <span className={styles.pricingName}>{plan.name}</span>
              <div className={styles.pricingPriceRow}>
                <span className={styles.pricingPrice}>{plan.price}</span>
                <span className={styles.pricingPeriod}>{plan.period}</span>
              </div>
              <p className={styles.pricingTagline}>{plan.tagline}</p>
            </div>
            <ul className={styles.pricingList}>
              {plan.features.map(feature => (
                <li key={feature} className={styles.pricingListItem}>
                  <span className={`mi ${styles.pricingCheck}`}>check</span>
                  {feature}
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
  return (
    <section id="faq" className={styles.faq}>
      <SectionHeading eyebrow="Questions" title="Answers before you ask" />
      <div className={styles.faqGrid}>
        {FAQ_PREVIEW.map((item, i) => (
          <Reveal key={item.q} as="div" className={styles.faqCard} delay={(i % 2) * 80}>
            <h3 className={styles.faqQ}>{item.q}</h3>
            <p className={styles.faqA}>{item.a}</p>
          </Reveal>
        ))}
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
        <h2 className={styles.ctaTitle}>Run your whole shop from one app</h2>
        <p className={styles.ctaBody}>Set up your shop in minutes. No card required to start.</p>
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
            <span className={styles.footerLogo}>TailorPady</span>
            <p className={styles.footerTagline}>
              Track orders, measurements, and payments for your tailoring shop or boutique.
            </p>
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
        <TrustBar />
        <Features />
        <ProductShowcase />
        <HowItWorks />
        <Testimonials />
        <PricingTeaser onNavigate={goTo} />
        <FAQPreview />
        <FinalCTA onNavigate={goTo} />
      </main>
      <SiteFooter />
    </div>
  )
}