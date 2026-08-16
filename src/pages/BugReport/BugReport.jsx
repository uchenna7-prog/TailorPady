import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../contexts/AuthContext'
import { uploadToCloudinary } from '../../services/cloudinaryService'
import Header from '../../components/Header/Header'
import BottomNav from '../../components/BottomNav/BottomNav'
import { Dropdown } from '../../components/Dropdown/Dropdown'
import styles from './BugReport.module.css'

const SECTIONS = [
  'Dashboard',
  'Customers',
  'Orders',
  'Inventory',
  'Gallery',
  'Appointments',
  'Tasks',
  'Payments',
  'Invoices',
  'Receipts',
  'Reports',
  'Reviews',
  'Settings',
  'Account',
  'Something else',
]

const SEVERITIES = [
  { value: 'low',      label: 'Low',      hint: 'Minor annoyance, app still usable'      },
  { value: 'medium',   label: 'Medium',   hint: 'A feature is broken or behaves oddly'   },
  { value: 'high',     label: 'High',     hint: 'Blocking work, no easy workaround'      },
  { value: 'critical', label: 'Critical', hint: 'App crashes or data is lost'            },
]

function getDeviceMeta() {
  return {
    userAgent:  navigator.userAgent,
    platform:   navigator.platform,
    language:   navigator.language,
    screen:     `${window.screen.width}x${window.screen.height}`,
    viewport:   `${window.innerWidth}x${window.innerHeight}`,
    url:        window.location.href,
    standalone: window.matchMedia('(display-mode: standalone)').matches,
    appVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
  }
}

function notifyTelegram(payload) {
  fetch('https://tailor-pady-api.vercel.app/api/notify-bug', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}

export default function BugReport({ onMenuClick }) {
  const { user } = useAuth()

  const [section, setSection]   = useState('')
  const [severity, setSeverity] = useState('medium')
  const [title, setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [screenshotFile, setScreenshotFile] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)

  const [submitting, setSubmitting]         = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitted, setSubmitted]           = useState(false)
  const [error, setError]                   = useState(null)

  const canSubmit = title.trim().length > 2 && description.trim().length > 4 && !submitting

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot must be smaller than 5MB.')
      return
    }
    setError(null)
    setScreenshotFile(file)
    const reader = new FileReader()
    reader.onload = () => setScreenshotPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const removeScreenshot = () => {
    setScreenshotFile(null)
    setScreenshotPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setUploadProgress(0)
    setError(null)

    try {
      let screenshotUrl      = null
      let screenshotPublicId = null

      if (screenshotFile) {
        const uploaded = await uploadToCloudinary(screenshotFile, 'bug-reports', setUploadProgress)
        screenshotUrl      = uploaded.url
        screenshotPublicId = uploaded.publicId
      }

      const trimmedTitle       = title.trim()
      const trimmedDescription = description.trim()
      const resolvedSection    = section || 'Not specified'

      await addDoc(collection(db, 'bugReports'), {
        title:              trimmedTitle,
        description:        trimmedDescription,
        section:            resolvedSection,
        severity,
        screenshotUrl,
        screenshotPublicId,
        status:             'new',
        userId:              user?.uid ?? null,
        userEmail:           user?.email ?? null,
        device:              getDeviceMeta(),
        createdAt:           serverTimestamp(),
      })

      notifyTelegram({
        title: trimmedTitle,
        description: trimmedDescription,
        section: resolvedSection,
        severity,
        screenshotUrl,
        userEmail: user?.email ?? null,
      })

      setSubmitted(true)
    } catch (err) {
      console.error('Bug report submit failed:', err)
      setError('Something went wrong sending your report. Please try again.')
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  const resetForm = () => {
    setSection('')
    setSeverity('medium')
    setTitle('')
    setDescription('')
    removeScreenshot()
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <Header onMenuClick={onMenuClick} title="Report a Bug" showNotifications={false} />
        <div className={styles.scrollArea}>
          <div className={styles.successWrap}>
            <div className={styles.successIconWrap}>
              <span className="mi" style={{ fontSize: '2rem' }}>check_circle</span>
            </div>
            <div className={styles.successTitle}>Report sent</div>
            <p className={styles.successSub}>
              Thanks for flagging this — it's been logged and we'll take a look.
              If we need more detail, we'll reach you at the email on your account.
            </p>
            <button className={styles.secondaryBtn} onClick={resetForm}>
              Report another issue
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Report a Bug" showNotifications={false} />

      <form className={styles.scrollArea} onSubmit={handleSubmit}>

        <p className={styles.pageSub}>
          Spot something broken? Let us know what happened and we'll get it fixed.
        </p>

        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrap}>
            <span className="mi" style={{ fontSize: '1rem' }}>edit_note</span>
          </div>
          <span className={styles.sectionLabel}>What happened</span>
        </div>

        <div className={styles.fieldPadding}>
          <label className={styles.label} htmlFor="bugTitle">Summary</label>
          <input
            id="bugTitle"
            className={styles.input}
            type="text"
            placeholder="e.g. Invoice total shows wrong amount"
            value={title}
            maxLength={100}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.fieldPadding}>
          <label className={styles.label} htmlFor="bugDesc">Description</label>
          <textarea
            id="bugDesc"
            className={styles.textarea}
            placeholder="What did you do, what did you expect, and what happened instead?"
            value={description}
            maxLength={1000}
            rows={5}
            onChange={e => setDescription(e.target.value)}
          />
          <div className={styles.charCount}>{description.length}/1000</div>
        </div>

        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrap}>
            <span className="mi" style={{ fontSize: '1rem' }}>tune</span>
          </div>
          <span className={styles.sectionLabel}>Details</span>
        </div>

        <div className={styles.fieldPadding}>
          <label className={styles.label} htmlFor="bugSection">Where did this happen?</label>
          <Dropdown
            options={SECTIONS}
            value={section}
            onChange={(val) => setSection(val)}
            placeholder="Select a page or section"
          />
        </div>

        <div className={styles.fieldPadding}>
          <label className={styles.label}>How bad is it?</label>
          <div className={styles.severityGrid}>
            {SEVERITIES.map(s => (
              <button
                key={s.value}
                type="button"
                className={`${styles.severityChip} ${severity === s.value ? styles.severityChipActive : ''} ${styles[`severity_${s.value}`]}`}
                onClick={() => setSeverity(s.value)}
              >
                <span className={styles.severityChipLabel}>{s.label}</span>
                <span className={styles.severityChipHint}>{s.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrap}>
            <span className="mi" style={{ fontSize: '1rem' }}>image</span>
          </div>
          <span className={styles.sectionLabel}>Screenshot (optional)</span>
        </div>

        <div className={styles.fieldPadding}>
          {screenshotPreview ? (
            <div className={styles.screenshotPreviewWrap}>
              <img src={screenshotPreview} alt="Screenshot preview" className={styles.screenshotPreview} />
              <button type="button" className={styles.screenshotRemove} onClick={removeScreenshot}>
                <span className="mi" style={{ fontSize: '1rem' }}>close</span>
              </button>
            </div>
          ) : (
            <label className={styles.uploadBox} htmlFor="bugScreenshot">
              <span className="mi" style={{ fontSize: '1.4rem', color: 'var(--text3)' }}>add_photo_alternate</span>
              <span className={styles.uploadText}>Add a screenshot</span>
              <span className={styles.uploadHint}>Helps us see exactly what you saw</span>
              <input
                id="bugScreenshot"
                type="file"
                accept="image/*"
                className={styles.uploadInput}
                onChange={handleScreenshotChange}
              />
            </label>
          )}
        </div>

        {error && (
          <div className={styles.fieldPadding}>
            <div className={styles.errorBanner}>
              <span className="mi" style={{ fontSize: '1.1rem' }}>error_outline</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className={styles.submitPadding}>
          <button className={styles.submitBtn} type="submit" disabled={!canSubmit}>
            {submitting
              ? screenshotFile
                ? `Uploading… ${uploadProgress}%`
                : 'Sending…'
              : 'Send report'}
          </button>
          <p className={styles.submitHint}>
            We'll automatically include your device and app version to help us debug faster.
          </p>
        </div>

        <div style={{ height: 40 }} />
      </form>

      <BottomNav />
    </div>
  )
}
