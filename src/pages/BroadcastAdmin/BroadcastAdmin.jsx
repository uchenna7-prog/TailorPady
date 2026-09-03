import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/Header/Header'
import styles from './BroadcastAdmin.module.css'

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID
const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function BroadcastAdmin({ onMenuClick }) {
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending

  if (!user || user.uid !== ADMIN_UID) {
    return (
      <div className={styles.page}>
        <Header onMenuClick={onMenuClick} title="Broadcast" showNotifications={false} />
        <div className={styles.scrollArea}>
          <div className={styles.deniedWrap}>
            <p className={styles.deniedText}>Not authorized.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSend = async () => {
    if (!canSend) return

    setSending(true)
    setError('')
    setResult(null)

    try {
      const idToken = await user.getIdToken()
      const response = await fetch(`${API_BASE}/api/cron/tasks?job=broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Broadcast failed.')
        return
      }

      setResult(data)
      setTitle('')
      setBody('')
    } catch (err) {
      setError('Network error while sending broadcast.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header onMenuClick={onMenuClick} title="Broadcast" showNotifications={false} />

      <div className={styles.scrollArea}>

        <p className={styles.pageSub}>
          Send a push notification to all subscribed users.
        </p>

        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconWrap}>
            <span className="mi-outlined" style={{ fontSize: '1rem' }}>campaign</span>
          </div>
          <span className={styles.sectionLabel}>Compose</span>
        </div>

        <div className={styles.fieldPadding}>
          <label className={styles.label} htmlFor="broadcastTitle">Title</label>
          <input
            id="broadcastTitle"
            className={styles.input}
            type="text"
            placeholder="New feature live"
            value={title}
            maxLength={60}
            disabled={sending}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.fieldPadding}>
          <label className={styles.label} htmlFor="broadcastBody">Message</label>
          <textarea
            id="broadcastBody"
            className={styles.textarea}
            placeholder="Check out the new inventory tracker in Settings."
            value={body}
            maxLength={200}
            rows={5}
            disabled={sending}
            onChange={e => setBody(e.target.value)}
          />
          <div className={styles.charCount}>{body.length}/200</div>
        </div>

        {error && (
          <div className={styles.fieldPadding}>
            <div className={styles.errorBanner}>
              <span className="mi-outlined" style={{ fontSize: '1.1rem' }}>error_outline</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className={styles.fieldPadding}>
            <div className={styles.successBanner}>
              <span className="mi-outlined" style={{ fontSize: '1.1rem' }}>check_circle</span>
              <span>
                Sent to {result.usersTargeted} users ({result.sent} deliveries, {result.removed} stale subscriptions cleaned up).
              </span>
            </div>
          </div>
        )}

        <div className={styles.submitPadding}>
          <button className={styles.submitBtn} onClick={handleSend} disabled={!canSend}>
            {sending ? 'Sending…' : 'Send to all subscribed users'}
          </button>
          <p className={styles.submitHint}>
            This will push a notification to every subscribed device immediately.
          </p>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}