import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/Header/Header'
import styles from './BroadcastAdmin.module.css'

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID
const API_BASE = import.meta.env.VITE_API_BASE_URL

function BroadcastAdmin() {
  const { user } = useAuth()

  const [title, setTitle]     = useState('')
  const [body, setBody]       = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  if (!user || user.uid !== ADMIN_UID) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.deniedWrapper}>
          <p className={styles.deniedText}>Not authorized.</p>
        </div>
      </div>
    )
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      setError('Title and message are both required.')
      return
    }

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
    <div className={styles.pageWrapper}>
      <Header type="back" title="Broadcast" />

      <main className={styles.main}>


        <div className={styles.card}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New feature live"
              disabled={sending}
              maxLength={60}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Message</label>
            <textarea
              className={styles.textarea}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Check out the new inventory tracker in Settings."
              disabled={sending}
              maxLength={200}
            />
            <p className={styles.charCount}>{body.length}/200</p>
          </div>

          <button className={styles.sendBtn} onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : 'Send to all subscribed users'}
          </button>

          {error && (
            <div className={styles.errorBanner}>{error}</div>
          )}

          {result && (
            <div className={styles.successBanner}>
              Sent to {result.usersTargeted} users ({result.sent} deliveries, {result.removed} stale subscriptions cleaned up).
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default BroadcastAdmin