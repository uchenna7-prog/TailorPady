import { Link, useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

const MEASUREMENTS = [
  { label: 'Chest', value: '38 in' },
  { label: 'Waist', value: '32 in' },
  { label: 'Sleeve', value: '24.5 in' },
  { label: 'Shoulder', value: '17.5 in' },
]

const FEATURES = [
  {
    tag: 'Records',
    title: 'Customers & measurements',
    body: 'Keep every client, body measurement, and fit note in one record you can pull up in seconds, on any device.',
  },
  {
    tag: 'Workflow',
    title: 'Orders & tasks',
    body: 'Break an order into cutting, stitching, embroidery, and finishing, assign each step, and watch it move.',
  },
  {
    tag: 'Money',
    title: 'Invoices, receipts & payments',
    body: 'Bill in your own currency, track what is paid and what is due, and hand over a clean receipt at pickup.',
  },
  {
    tag: 'Stock',
    title: 'Inventory',
    body: 'Know what fabric and trims are on the shelf before you promise a delivery date you cannot keep.',
  },
  {
    tag: 'Schedule',
    title: 'Appointments',
    body: 'Book fittings and collections against real shop hours, with reminders that reach the customer on time.',
  },
  {
    tag: 'Numbers',
    title: 'Reports',
    body: 'See today\u2019s orders, today\u2019s payments, and the monthly numbers that tell you how the shop is really doing.',
  },
  {
    tag: 'Showcase',
    title: 'Gallery',
    body: 'Photograph finished pieces and build a lookbook clients can browse before they choose a style.',
  },
  {
    tag: 'Assistant',
    title: 'Agent',
    body: 'Ask in plain language for anything above: this week\u2019s dues, a customer\u2019s last measurements, a stock count.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Set up your shop',
    body: 'Add your shop name, address, currency, and workers. Ready in a few minutes, no training required.',
  },
  {
    n: '02',
    title: 'Bring in your customers',
    body: 'Import or enter your existing clients and their measurements once, and never re-measure from scratch again.',
  },
  {
    n: '03',
    title: 'Run the shop from Tailorpady',
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
]

function StitchDivider({ label }) {
  return (
    <div className={styles.divider} role="separator" aria-hidden="true">
      <div className={styles.dividerLine} />
      {label ? <span className={styles.dividerLabel}>{label}</span> : null}
    </div>
  )
}

function OrderDocket() {
  return (
    <div className={styles.docketWrap}>
      <span className={styles.docketEyebrow}>Live on the shop floor</span>
      <div className={styles.docket}>
        <div className={styles.docketTop}>
          <span className={styles.docketNumber}>Order № 0231</span>
          <span className={styles.docketStatus}>In progress</span>
        </div>
        <div className={styles.docketRow}>
          <span className={styles.docketRowLabel}>Customer</span>
          <span className={styles.docketRowValue}>A. Chukwu</span>
        </div>
        <div className={styles.docketRow}>
          <span className={styles.docketRowLabel}>Item</span>
          <span className={styles.docketRowValue}>Agbada, 2 piece</span>
        </div>
        <div className={styles.docketMeasure}>
          {MEASUREMENTS.map(m => (
            <div key={m.label} className={styles.docketMeasureCell}>
              <span className={styles.docketMeasureLabel}>{m.label}</span>
              <span className={styles.docketMeasureValue}>{m.value}</span>
            </div>
          ))}
        </div>
        <div className={styles.docketFoot}>
          <span>Balance due</span>
          <span className={styles.docketFootValue}>₦4,500</span>
        </div>
        <span className={styles.docketStamp}>Ready 18 Jul</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <span className={styles.logo}>Tailorpady</span>
        <nav className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#reviews">Reviews</a>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className={styles.navActions}>
          <Link to="/login" className={styles.navLogin}>
            Log in
          </Link>
          <button
            type="button"
            className={styles.navCta}
            onClick={() => navigate('/signup')}
          >
            Start free
          </button>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Tailoring shop management</span>
            <h1 className={styles.heroTitle}>
              Every measurement,
              <br />
              order, and naira,
              <br />
              in one place.
            </h1>
            <p className={styles.heroBody}>
              Tailorpady replaces the notebook on your counter with customer
              records, order tracking, invoicing, and reports built for how a
              tailoring shop actually runs.
            </p>
            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => navigate('/signup')}
              >
                Start free
              </button>
              <a href="#features" className={styles.secondaryButton}>
                See what it does
              </a>
            </div>
          </div>
          <OrderDocket />
        </section>

        <StitchDivider label="Built for the whole shop floor" />

        <section className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>9,400+</span>
            <span className={styles.statLabel}>Orders tracked</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>430+</span>
            <span className={styles.statLabel}>Shops onboard</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>1</span>
            <span className={styles.statLabel}>Place for the whole shop</span>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <span className={styles.sectionEyebrow}>What it does</span>
          <h2 className={styles.sectionTitle}>
            Everything the counter, the workshop, and the books need
          </h2>
          <div className={styles.featureGrid}>
            {FEATURES.map(f => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureTag}>{f.tag}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <StitchDivider label="From first fitting to final delivery" />

        <section id="how" className={styles.how}>
          <span className={styles.sectionEyebrow}>How it works</span>
          <h2 className={styles.sectionTitle}>Three steps to run your shop on Tailorpady</h2>
          <div className={styles.stepGrid}>
            {STEPS.map(s => (
              <div key={s.n} className={styles.step}>
                <span className={styles.stepNumber}>{s.n}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="reviews" className={styles.reviews}>
          <span className={styles.sectionEyebrow}>Shops using Tailorpady</span>
          <h2 className={styles.sectionTitle}>What shop owners say</h2>
          <div className={styles.reviewGrid}>
            {TESTIMONIALS.map(t => (
              <figure key={t.name} className={styles.reviewCard}>
                <blockquote className={styles.reviewQuote}>{t.quote}</blockquote>
                <figcaption className={styles.reviewMeta}>
                  <span className={styles.reviewName}>{t.name}</span>
                  <span className={styles.reviewRole}>{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Run your shop from one screen</h2>
          <p className={styles.ctaBody}>
            Set up your shop in minutes. No card required to start.
          </p>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={() => navigate('/signup')}
          >
            Start free
          </button>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <span className={styles.logo}>Tailorpady</span>
          <p className={styles.footerTagline}>
            Order, measurement, and payment tracking for tailoring shops and
            boutiques.
          </p>
        </div>
        <div className={styles.footerLinks}>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms & conditions</Link>
          <Link to="/refund">Refund policy</Link>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Tailorpady. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}