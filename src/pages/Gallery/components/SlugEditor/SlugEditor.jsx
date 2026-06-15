import { isSlugAvailable, claimSlug } from '../../../../services/slugService'
import { useState, useRef } from 'react'
import styles from './SlugEditor.module.css'
import { db } from '../../../../firebase'


function toSlug(raw = '') {
  const words = raw
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return ''
  return words
    .map((w, i) => i === 0
      ? w.toLowerCase()
      : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join('')
    .slice(0, 30)
}


export function SlugEditor({ uid, currentSlug, onSlugSaved }) {
  const [editing,   setEditing]   = useState(false)
  const [inputVal,  setInputVal]  = useState('')
  const [checking,  setChecking]  = useState(false)
  const [available, setAvailable] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState('')
  const debounceRef = useRef(null)

  const preview = toSlug(inputVal)

  const handleChange = (val) => {
    setInputVal(val)
    setAvailable(null)
    setSaveError('')
    clearTimeout(debounceRef.current)
    const slug = toSlug(val)
    if (!slug || slug.length < 3) return
    setChecking(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const ok = await isSlugAvailable(db,slug, uid)
        setAvailable(ok)
      } catch {
        setAvailable(null)
      } finally {
        setChecking(false)
      }
    }, 600)
  }

  const handleSave = async () => {
    const slug = toSlug(inputVal)
    if (!slug || slug.length < 3 || available !== true) return
    setSaving(true)
    setSaveError('')
    try {
      await claimSlug(db,uid, slug, currentSlug)
      onSlugSaved(slug)
      setEditing(false)
      setInputVal('')
    } catch (err) {
      setSaveError(
        err.message === 'slug_taken'
          ? 'Already taken — try a different name.'
          : 'Failed to save. Try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setInputVal('')
    setAvailable(null)
    setSaveError('')
    clearTimeout(debounceRef.current)
  }

  const canSave = preview.length >= 3 && available === true && !saving

  const statusIcon = () => {
    if (checking) return <span className={`mi ${styles.spinIcon}`}>refresh</span>
    if (available === true)  return <span className={`mi ${styles.okIcon}`}>check_circle</span>
    if (available === false) return <span className={`mi ${styles.errIcon}`}>cancel</span>
    return null
  }

  const inputBorderClass = available === true
    ? styles.inputWrapOk
    : available === false
    ? styles.inputWrapErr
    : ''

  if (!editing) {
    return (
      <div className={styles.readView}>
        <div className={styles.readTop}>
          <div className={styles.readIconWrap}>
            <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>link</span>
          </div>
          <div className={styles.readMeta}>
            <span className={styles.readLabel}>Your Portfolio Link</span>
            <span className={styles.readUrl}>
              …/portfolio/
              <strong>{currentSlug || <em className={styles.notSet}>brandName</em>}</strong>
            </span>
          </div>
          <button className={styles.editTriggerBtn} onClick={() => setEditing(true)}>
            <span className="mi-outlined" style={{ fontSize: '0.9rem' }}>edit</span>
            {currentSlug ? 'Edit' : 'Set'}
          </button>
        </div>
        {!currentSlug && (
          <p className={styles.readHint}>
            Set a custom link so clients can find you easily e.g. <strong>emekaTailors</strong>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.editorView}>
      <div className={styles.editorTop}>
        <span className={styles.editorLabel}>Choose your link</span>
        <button className={styles.cancelIconBtn} onClick={handleCancel} disabled={saving}>
          <span className="mi" style={{ fontSize: '1rem' }}>close</span>
        </button>
      </div>

      <div className={`${styles.inputWrap} ${inputBorderClass}`}>
        <span className={styles.domainPrefix}>…/portfolio/</span>
        <input
          className={styles.slugInput}
          value={inputVal}
          onChange={e => handleChange(e.target.value)}
          placeholder="emekaTailors"
          maxLength={34}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <span className={styles.statusSlot}>{statusIcon()}</span>
      </div>

      {preview && inputVal.trim() && preview !== inputVal.trim() && (
        <p className={styles.previewNote}>Saves as: <strong>{preview}</strong></p>
      )}

      {available === true  && <p className={`${styles.hint} ${styles.hintOk}`}><span className="mi" style={{ fontSize: '0.8rem' }}>check_circle</span> Available!</p>}That name is already taken. Try adding your city or a number, for example emekaTailors_Lagos or emekaTailors2.
      {available === false && <p className={`${styles.hint} ${styles.hintErr}`}><span className="mi" style={{ fontSize: '0.8rem' }}>error_outline</span> </p>}
      {preview.length > 0 && preview.length < 3 && <p className={styles.hint}>Minimum 3 characters.</p>}
      {saveError && <p className={`${styles.hint} ${styles.hintErr}`}>{saveError}</p>}

      <div className={styles.editorActions}>
        <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={!canSave}>
          {saving
            ? <><span className={`mi ${styles.spinIcon}`} style={{ fontSize: '0.9rem' }}>refresh</span> Saving…</>
            : <><span className="mi" style={{ fontSize: '0.9rem' }}>check</span> Save Link</>
          }
        </button>
      </div>
    </div>
  )
}