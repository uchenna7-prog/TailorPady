import { useState } from 'react'
import styles from './ShareAppSheet.module.css'

function buildShareText(referralCode) {
  return referralCode
    ? `Join me on TailorPady! Use my code ${referralCode} when you sign up, and I get a free month once you get started.`
    : 'Check out TailorPady!'
}

function buildShareUrl(referralCode) {
  return referralCode
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : window.location.origin
}

export default function ShareAppSheet({ open, referralCode, onClose }) {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const shareText = buildShareText(referralCode)
  const shareUrl = buildShareUrl(referralCode)

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank')
  }

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
  }

  const handleSms = () => {
    window.location.href = `sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
  }

  const handleEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent('Join me on TailorPady')}&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <h4>Share TailorPady</h4>
        <p>Invite another tailor and you'll both get a free month of Pro.</p>

        <div className={styles.channelGrid}>
          <button className={styles.channelBtn} onClick={handleWhatsApp}>
            <div className={`${styles.channelIcon} ${styles.whatsapp}`}>
              <svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm5.8 14.14c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.6-2.88-1.24-4.76-4.12-4.9-4.31-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.14.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.21.72-.84.91-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.68-.17 1.36z" /></svg>
            </div>
            <span className={styles.channelLabel}>WhatsApp</span>
          </button>

          <button className={styles.channelBtn} onClick={handleTelegram}>
            <div className={`${styles.channelIcon} ${styles.telegram}`}>
              <svg viewBox="0 0 24 24"><path d="M21.94 4.5c.28-1.13-.42-1.63-1.19-1.35L2.7 10.36c-1.1.44-1.09 1.06-.19 1.34l4.53 1.41 10.5-6.6c.5-.31.95-.14.58.2L9.5 14.2l-.35 4.94c.5 0 .72-.23.98-.5l2.36-2.28 4.9 3.6c.9.5 1.55.24 1.78-.83l3.77-14.63z" /></svg>
            </div>
            <span className={styles.channelLabel}>Telegram</span>
          </button>

          <button className={styles.channelBtn} onClick={handleSms}>
            <div className={`${styles.channelIcon} ${styles.neutral}`}>
              <span className="mi">sms</span>
            </div>
            <span className={styles.channelLabel}>Messages</span>
          </button>

          <button className={styles.channelBtn} onClick={handleEmail}>
            <div className={`${styles.channelIcon} ${styles.neutral}`}>
              <span className="mi">mail</span>
            </div>
            <span className={styles.channelLabel}>Email</span>
          </button>
        </div>

        <div className={styles.linkRow}>
          <span className={styles.linkText}>{shareUrl.replace(/^https?:\/\//, '')}</span>
          <button
            className={`${styles.copyChip} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
