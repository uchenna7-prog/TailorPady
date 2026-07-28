import styles from './FounderSection.module.css'

export default function FounderSection() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Meet the Founder</span>
        <h2 className={styles.headline}>
          Built by someone who watched the problem up close.
        </h2>
      </div>

      <div className={styles.intro}>
        <div className={styles.photoWrap}>
          <img
            src="/landingPageImages/founder-picture.jpg"
            alt="Uchenna Uchendu, Founder of TailorPady"
            className={styles.photo}
          />
        </div>

        <div className={styles.introText}>
          <p className={styles.bioParagraph}>
            I'm Uchenna Uchendu, the founder of TailorPady. I'm not a tailor. I'm a software engineer. But I grew up around tailors, family and friends who spent their days measuring, cutting, and stitching, and their evenings buried in notebooks trying to remember who ordered what, who still owed money, and whose measurements were whose.
          </p>
          <p className={styles.bioParagraph}>
            Watching that up close is what led to TailorPady. I saw skilled people losing hours every week to problems that software had already solved in almost every other industry. Tailoring just hadn't caught up yet.
          </p>
          <p className={styles.bioParagraph}>
            So I built the tool I wished they had: something that keeps track of customers, orders, measurements, and payments automatically, so tailors can spend their time on the craft instead of the paperwork.
          </p>
          <p className={styles.bioParagraph}>
            TailorPady is built for the tailoring industry specifically, shaped by real conversations with real tailors about how they actually work, not how a generic tool assumes they work.
          </p>
          <p className={styles.bioParagraph}>
            We're still early, and still listening. Every update comes from feedback from the people actually using it every day.
          </p>

          <div className={styles.signature}>
            <p className={styles.signatureName}>Uchenna Uchendu</p>
            <p className={styles.signatureRole}>Founder, TailorPady</p>
          </div>

          <div className={styles.badges}>
            <span className={styles.badge}>
              <span className="mi-outlined" aria-hidden="true">code</span>
              Software Engineer
            </span>
            <span className={styles.badge}>
              <span className="mi-outlined" aria-hidden="true">location_on</span>
              Built in Nigeria
            </span>
            <span className={styles.badge}>
              <span className="mi-outlined" aria-hidden="true">rocket_launch</span>
              Building tools for fashion businesses
            </span>
          </div>
        </div>
      </div>

      <div className={styles.quoteCard}>
        <p className={styles.quoteText}>
          Technology shouldn't replace craftsmanship. It should give craftsmen more time to create.
        </p>
      </div>
    </div>
  )
}
