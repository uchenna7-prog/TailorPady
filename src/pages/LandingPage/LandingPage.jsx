import { useState, useEffect, useRef } from 'react'
import { useTheme } from './hooks/useTheme'
import SiteNav from './components/SiteNav/SiteNav'
import SiteFooter from './components/SiteFooter/SiteFooter'
import styles from './LandingPage.module.css'

const ABOUT_STATS = [
  { icon: 'group', value: '5+', label: 'Active tailors' },
  { icon: 'shopping_cart', value: '30+', label: 'Orders tracked' },
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

const APP_STRIP_ONE = [
  { label: 'Manage Dashboard', image: '/landingPageImages/screen-dashboard.jpg' },
  { label: 'Manage Customers', image: '/landingPageImages/screen-customers.jpg' },
  { label: 'Manage Measurements', image: '/landingPageImages/screen-customer-measurements.jpg' },
]

const APP_STRIP_TWO = [
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
    icon: 'settings',
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
    icon: 'bolt',
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
    rating: 5,
  },
  {
    quote:
      'The task board is what sold me. I can see exactly which order is stuck on embroidery without calling anyone.',
    name: 'Segun A.',
    role: 'Tailoring shop owner, Lagos',
    rating: 5,
  },
  {
    quote:
      'Payments and dues used to live in my head. Now they live in the app, and my head is a lot quieter.',
    name: 'Ifeoma K.',
    role: 'Fashion designer, Enugu',
    rating: 4,
  },
  {
    quote:
      'My workers know exactly what stage every order is at without asking me. That alone was worth switching.',
    name: 'Chinedu M.',
    role: 'Shop owner, Aba',
    rating: 5,
  },
  {
    quote:
      'Clients love that I can pull up their measurements from two years ago in seconds. It makes us look serious.',
    name: 'Blessing U.',
    role: 'Fashion designer, Abuja',
    rating: 5,
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

const CONTACT = {
  whatsapp: '+234 7079645766',
}

const WHATSAPP_HREF = `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`

const WHATSAPP_PEEK_KEY = 'tailorpady-whatsapp-peek-shown'

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

function StatValue({ value, className }) {
  const [ref, inView] = useInView(0.5)
  const display = useCountUp(value, inView)
  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}

function StarRating({ rating, max = 5 }) {
  return (
    <div className={styles.reviewStars} role="img" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`mi-outlined ${styles.reviewStarIcon} ${i < rating ? styles.reviewStarIconFilled : ''}`}
        >
          star
        </span>
      ))}
    </div>
  )
}

function MonoLabel({ children }) {
  return <span className={styles.monoLabel}>{children}</span>
}

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.5l-4.4-7c-18.5-29.4-28.3-63.3-28.3-98.1 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  )
}

function BotIcon({ size = 18, color = 'currentColor', backgroundColor = 'var(--bg)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="4" fill={color} />
      <rect x="7" y="14.5" width="2.5" height="2.5" rx="0.6" fill={backgroundColor} />
      <rect x="14.5" y="14.5" width="2.5" height="2.5" rx="0.6" fill={backgroundColor} />
      <path d="M9.5 18.5h5" stroke={backgroundColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 11V8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="6.5" r="1.8" fill={color} />
      <line x1="4" y1="15" x2="2" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="15" x2="22" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
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
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>
          The business side of tailoring, simplified.
          </h1>
          <p className={styles.heroBody}>
            Manage your tailoring business without the paperwork.
            Spend less time managing and more time sewing.
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryButton} onClick={() => onNavigate('/signup')}>
              Start free
            </button>
            <a href="#features" className={styles.secondaryButton}>
              Explore features
            </a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <PhoneMockup />
        </div>
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
            <span className={styles.featureIconTile}>
              {f.featured ? (
                <BotIcon size={20} color="var(--ink)" backgroundColor="var(--surface)" />
              ) : (
                <span className="mi-outlined">{f.icon}</span>
              )}
            </span>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureBody}>{f.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function AboutAndProduct({ items }) {
  return (
    <section id="about" className={styles.aboutProductRow}>
      <div className={styles.aboutCol}>
        <SectionHeading eyebrow={ABOUT_CONTENT.eyebrow} title={ABOUT_CONTENT.title} />
        <Reveal as="p" className={styles.aboutBody} delay={60}>
          {ABOUT_CONTENT.body}
        </Reveal>
        <Reveal as="ul" className={styles.aboutChecklist} delay={120}>
          {ABOUT_POINTS.map(point => (
            <li key={point} className={styles.aboutChecklistItem}>
              <span className={`mi-outlined ${styles.aboutCheckIcon}`}>check_circle</span>
              {point}
            </li>
          ))}
        </Reveal>

        <div className={styles.aboutStats}>
          {ABOUT_STATS.map((stat, i) => (
            <Reveal key={stat.label} as="div" className={styles.aboutStat} delay={180 + i * 70}>
              <span className={`mi-outlined ${styles.aboutStatIcon}`}>{stat.icon}</span>
              <div className={styles.aboutStatText}>
                <StatValue value={stat.value} className={styles.aboutStatValue} />
                <span className={styles.aboutStatLabel}>{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div id="product" className={styles.productCol}>
        <div className={styles.productShowcaseGrid}>
          {items.map((item, i) => (
            <Reveal key={item.label} as="div" className={styles.showcaseItem} delay={i * 70}>
              <div className={styles.showcasePhone}>
                <div className={styles.showcasePhoneScreen}>
                  <img src={item.image} alt={item.label} className={styles.showcasePhoneScreenImg} loading="lazy" />
                </div>
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

function Mission() {
  return (
    <section id="mission" className={styles.mission}>
      <div className={styles.missionGlow} aria-hidden="true" />
      <div className={styles.missionInner}>
        <Reveal as="div" className={styles.missionCopy}>
          <span className={styles.missionQuoteMark} aria-hidden="true">"</span>
          <MonoLabel>Our mission</MonoLabel>
          <p className={styles.missionStatement}>{MISSION_STATEMENT}</p>
          <p className={styles.missionSub}>{MISSION_SUB}</p>
        </Reveal>
      </div>
    </section>
  )
}

function AppStrip({ id, eyebrow, title, items }) {
  return (
    <section id={id} className={styles.showcase}>
      <SectionHeading eyebrow={eyebrow} title={title} align="center" />
      <div className={styles.showcaseBand}>
        <div className={styles.showcaseGrid}>
          {items.map((item, i) => (
            <Reveal key={item.label} as="div" className={styles.showcaseItem} delay={i * 70}>
              <div className={styles.showcasePhone}>
                <div className={styles.showcasePhoneScreen}>
                  <img src={item.image} alt={item.label} className={styles.showcasePhoneScreenImg} loading="lazy" />
                </div>
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
      <div className={styles.howGrid}>
        {STEPS.map((s, i) => (
          <Reveal key={s.n} as="div" className={styles.howCol} delay={i * 130}>
            <div className={styles.howColHead}>
              <span className={styles.howIndex}>
                {s.n}
                <span className={styles.howIndexTotal}>/{STEPS.length.toString().padStart(2, '0')}</span>
              </span>
              <span className={`mi-outlined ${styles.howIcon}`}>{s.icon}</span>
            </div>
            <h3 className={styles.stepTitle}>{s.title}</h3>
            <p className={styles.stepBody}>{s.body}</p>
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
              <div className={styles.reviewTop}>
                <StarRating rating={t.rating} />
                <span className={styles.reviewQuoteMark} aria-hidden="true">"</span>
              </div>
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
            className={`${styles.pricingCard} `}
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
                  <span className={`mi-outlined ${styles.pricingCheck}`}>{feature.icon}</span>
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
                <span className={`mi-outlined ${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}>add</span>
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
    </section>
  )
}

function FinalCTA({ onNavigate }) {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaCurve} aria-hidden="true">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,100 C480,0 960,0 1440,100 L1440,100 L0,100 Z" />
        </svg>
      </div>
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

function TypingDots() {
  return (
    <span className={styles.typingDots}>
      <span />
      <span />
      <span />
    </span>
  )
}

function WhatsAppWidget() {
  const [open, setOpen] = useState(false)
  const [peekVisible, setPeekVisible] = useState(false)
  const [peekDismissed, setPeekDismissed] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (sessionStorage.getItem(WHATSAPP_PEEK_KEY)) return
    const showTimer = setTimeout(() => {
      setPeekVisible(true)
      sessionStorage.setItem(WHATSAPP_PEEK_KEY, '1')
    }, 5000)
    return () => clearTimeout(showTimer)
  }, [])

  useEffect(() => {
    if (!peekVisible) return
    const hideTimer = setTimeout(() => setPeekVisible(false), 14000)
    return () => clearTimeout(hideTimer)
  }, [peekVisible])

  useEffect(() => {
    if (!open || hasAnimatedRef.current) return
    hasAnimatedRef.current = true
    setShowTyping(true)
    const typingTimer = setTimeout(() => {
      setShowTyping(false)
      setShowMessage(true)
    }, 1100)
    return () => clearTimeout(typingTimer)
  }, [open])

  const handleOpen = () => {
    setOpen(true)
    setPeekVisible(false)
    setPeekDismissed(true)
  }

  const handlePeekDismiss = event => {
    event.stopPropagation()
    setPeekVisible(false)
    setPeekDismissed(true)
  }

  const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={styles.whatsappWidget}>
      {peekVisible && (
        <div
          className={styles.peekBubble}
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') handleOpen()
          }}
        >
          <button
            type="button"
            className={styles.peekClose}
            onClick={handlePeekDismiss}
            aria-label="Dismiss message"
          >
            <span className="mi-outlined" style={{ fontSize: '0.95rem' }}>close</span>
          </button>
          <span className={styles.peekAvatar}>
            <WhatsAppIcon size={18} />
          </span>
          <span className={styles.peekText}>
            <span className={styles.peekName}>TailorPady Support</span>
            <span className={styles.peekMessage}>Hi there! 👋 Need help getting your shop set up?</span>
          </span>
        </div>
      )}

      {open && (
        <div className={styles.whatsappPanel} role="dialog" aria-label="Chat with TailorPady support">
          <div className={styles.whatsappPanelHeader}>
            <span className={styles.whatsappPanelAvatar}>
              <WhatsAppIcon size={20} />
            </span>
            <div className={styles.whatsappPanelHeaderText}>
              <span className={styles.whatsappPanelTitle}>TailorPady Support</span>
              <span className={styles.whatsappPanelStatus}>
                <span className={styles.whatsappStatusDot} />
                Online
              </span>
            </div>
            <button
              type="button"
              className={styles.whatsappPanelClose}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <span className="mi-outlined" style={{ fontSize: '1.1rem' }}>close</span>
            </button>
          </div>
          <div className={styles.whatsappPanelBody}>
            <span className={styles.whatsappDateChip}>Today</span>
            {showTyping && (
              <div className={styles.whatsappTypingBubble}>
                <TypingDots />
              </div>
            )}
            {showMessage && (
              <div className={styles.whatsappBubble}>
                Hi there! 👋 How can we help you with TailorPady today?
                <span className={styles.whatsappBubbleTime}>{timeNow()}</span>
              </div>
            )}
          </div>
          <div className={styles.whatsappPanelFooter}>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
              className={styles.whatsappStartChatBtn}
            >
              <WhatsAppIcon size={18} />
              Continue on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`${styles.whatsappTrigger} ${open ? styles.whatsappTriggerOpen : ''}`}
        onClick={() => (open ? setOpen(false) : handleOpen())}
        aria-label={open ? 'Close chat' : 'Chat with us on WhatsApp'}
      >
        <WhatsAppIcon size={24} />
        {!open && !peekDismissed && <span className={styles.whatsappBadgeDot} />}
        {open && <span className={styles.whatsappTriggerLabel}>Close chat</span>}
      </button>
    </div>
  )
}

export default function LandingPage() {

  const goTo = path => {
    window.location.href = path
  }
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
      <SiteNav theme={theme} onToggleTheme={toggleTheme} />
      <main className={styles.mainContent}>
        <Hero onNavigate={goTo} />
        <AboutAndProduct items={APP_STRIP_ONE} />
        <Features />
        <HowItWorks />
        <AppStrip
          eyebrow="Built for the workflow"
          title="From order to delivery"
          items={APP_STRIP_TWO}
        />
        <Mission />
        <Testimonials />
        <PricingTeaser onNavigate={goTo} />
        <FAQPreview />
        <FinalCTA onNavigate={goTo} />
      </main>
      <SiteFooter />
      <WhatsAppWidget />
    </div>
  )
}