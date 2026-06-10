import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './SignatureSection.module.css'
import { useSignatureUsage } from '../../../../hooks/useSignatureUsage'
import { uploadToCloudinary } from '../../../../services/cloudinaryService'

const FONTS = [
  { id: 'dancing',  label: 'Dancing Script', family: "'Dancing Script', cursive" },
  { id: 'great',    label: 'Great Vibes',    family: "'Great Vibes', cursive"    },
  { id: 'pacifico', label: 'Pacifico',       family: "'Pacifico', cursive"       },
  { id: 'pinyon',   label: 'Pinyon Script',  family: "'Pinyon Script', cursive"  },
]

const VERCEL_API_URL = import.meta.env.VITE_VERCEL_API_URL


async function removeBackground(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)

  const response = await fetch(`${VERCEL_API_URL}/api/remove-bg`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) throw new Error('Background removal failed')
  const data = await response.json()
  return data.image
}


function DrawTab({ value, onChange }) {
  const canvasRef = useRef(null)
  const drawing   = useRef(false)
  const points    = useRef([])
  const hasStroke = useRef(false)

  useEffect(() => {
    if (!value || !canvasRef.current) return
    const img    = new Image()
    img.onload   = () => {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)
      hasStroke.current = true
    }
    img.src = value
  }, [])

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const src    = e.touches ? e.touches[0] : e
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    }
  }, [])

  const drawCurve = useCallback(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const pts    = points.current
    if (pts.length < 2) return

    ctx.lineWidth   = 2.2
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--text').trim() || '#111'

    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)

    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) / 2
      const midY = (pts[i].y + pts[i + 1].y) / 2
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY)
    }

    const last = pts[pts.length - 1]
    ctx.lineTo(last.x, last.y)
    ctx.stroke()
  }, [])

  const startDraw = useCallback((e) => {
    e.preventDefault()
    drawing.current = true
    points.current  = [getPos(e)]
    canvasRef.current.getContext('2d').beginPath()
  }, [getPos])

  const draw = useCallback((e) => {
    e.preventDefault()
    if (!drawing.current) return
    points.current.push(getPos(e))
    if (points.current.length > 3) points.current = points.current.slice(-4)
    drawCurve()
    hasStroke.current = true
  }, [getPos, drawCurve])

  const endDraw = useCallback((e) => {
    e?.preventDefault()
    if (!drawing.current) return
    drawing.current = false
    points.current  = []
    if (hasStroke.current) onChange(canvasRef.current.toDataURL('image/png'))
  }, [onChange])

  const clear = useCallback(() => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    hasStroke.current = false
    onChange(null)
  }, [onChange])

  return (
    <div className={styles.tabPane}>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className={styles.sigCanvas}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <div className={styles.sigFooter}>
        <span className={styles.sigHint}>Draw your signature above</span>
        <button type="button" className={styles.clearBtn} onClick={clear}>
          <span className="mi" style={{ fontSize: '0.9rem' }}>refresh</span>Clear
        </button>
      </div>
    </div>
  )
}


function PhotoTab({ onChange, userId }) {
  const [preview,    setPreview]    = useState(null)
  const [processing, setProcessing] = useState(false)
  const [error,      setError]      = useState(null)
  const fileRef = useRef(null)

  const {
    cachedUrl,
    attemptsLeft,
    canAttempt,
    loading,
    incrementAttempts,
    saveSignatureUrl,
    clearSignatureCache,
  } = useSignatureUsage(userId)

  useEffect(() => {
    if (cachedUrl) {
      setPreview(cachedUrl)
      onChange(cachedUrl)
    }
  }, [cachedUrl])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!canAttempt) {
      setError('No attempts left this month.')
      return
    }

    setError(null)
    setProcessing(true)

    try {
      const cleanedDataUrl = await removeBackground(file)
      const cleanedBlob    = await fetch(cleanedDataUrl).then(r => r.blob())
      const cleanedFile    = new File([cleanedBlob], 'signature.png', { type: 'image/png' })
      const cloudinaryUrl  = await uploadToCloudinary(cleanedFile, 'signatures')
      await incrementAttempts()
      await saveSignatureUrl(cloudinaryUrl)
      setPreview(cloudinaryUrl)
      onChange(cloudinaryUrl)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  async function handleRetake() {
    await clearSignatureCache()
    setPreview(null)
    setError(null)
    onChange(null)
  }

  if (loading) {
    return (
      <div className={styles.tabPane}>
        <div className={styles.uploadZone}>
          <div className={styles.processingSpinner} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.tabPane}>
      {!preview && !processing && (
        <>
          <div
            className={`${styles.uploadZone} ${!canAttempt ? styles.uploadZone_disabled : ''}`}
            onClick={() => canAttempt && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className={styles.hiddenInput}
              onChange={handleFile}
            />
            <span className="mi" style={{ fontSize: '2rem', color: 'var(--text3)' }}>photo_camera</span>
            <p className={styles.uploadTitle}>
              {canAttempt ? 'Snap or upload your signature' : 'No attempts left this month'}
            </p>
            <p className={styles.uploadSub}>
              {canAttempt
                ? 'Sign on white paper, take a photo — background is removed automatically'
                : 'Your 5 monthly attempts have been used. Resets next month.'}
            </p>
            {canAttempt && <span className={styles.uploadBtn}>Choose Photo</span>}
          </div>

          <div className={styles.attemptsBar}>
            <span className={styles.attemptsText}>
              {attemptsLeft} of 5 attempts remaining this month
            </span>
            <div className={styles.attemptsDots}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dot} ${i < attemptsLeft ? styles.dot_active : styles.dot_used}`}
                />
              ))}
            </div>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}
        </>
      )}

      {processing && (
        <div className={styles.uploadZone}>
          <div className={styles.processingSpinner} />
          <p className={styles.uploadSub}>Removing background…</p>
        </div>
      )}

      {preview && !processing && (
        <div className={styles.previewWrap}>
          <div className={styles.previewCanvas}>
            <img src={preview} alt="Signature preview" className={styles.previewImg} />
          </div>
          <div className={styles.sigFooter}>
            <button type="button" className={styles.clearBtn} onClick={handleRetake}>
              <span className="mi" style={{ fontSize: '0.9rem' }}>refresh</span>Retake
            </button>
            <div className={styles.attemptsInline}>
              <span className={styles.attemptsText}>{attemptsLeft} of 5 left this month</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function TypeTab({ onChange }) {
  const [name,       setName]       = useState('')
  const [selectedId, setSelectedId] = useState('dancing')
  const canvasRef = useRef(null)

  const renderToCanvas = useCallback((text, fontFamily) => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return
    const ctx        = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font         = `64px ${fontFamily}`
    ctx.fillStyle    = getComputedStyle(document.documentElement)
      .getPropertyValue('--text').trim() || '#111'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  }, [])

  useEffect(() => {
    if (!name.trim()) { onChange(null); return }
    const font = FONTS.find(f => f.id === selectedId)
    if (!font) return
    renderToCanvas(name, font.family)
    onChange(canvasRef.current.toDataURL('image/png'))
  }, [name, selectedId, renderToCanvas, onChange])

  return (
    <div className={styles.tabPane}>
      <input
        type="text"
        className={styles.typeInput}
        placeholder="Type your name…"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={40}
      />
      <div className={styles.fontGrid}>
        {FONTS.map(font => (
          <button
            key={font.id}
            type="button"
            className={`${styles.fontOption} ${selectedId === font.id ? styles.fontOption_active : ''}`}
            style={{ fontFamily: font.family }}
            onClick={() => setSelectedId(font.id)}
          >
            {name.trim() || 'Your Name'}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} width={600} height={200} className={styles.hiddenCanvas} />
      {!name.trim() && (
        <p className={styles.sigHint} style={{ textAlign: 'center', marginTop: 8 }}>
          Type your name above to preview
        </p>
      )}
    </div>
  )
}


const TABS = [
  { id: 'photo', label: 'Photo', icon: 'photo_camera' },
  { id: 'draw',  label: 'Draw',  icon: 'draw'         },
  { id: 'type',  label: 'Type',  icon: 'title'        },
]

export function SignatureSection({ value, onChange, userId }) {
  const [activeTab, setActiveTab] = useState('photo')

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    onChange(null)
  }

  return (
    <div className={styles.sigWrap}>
      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtn_active : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="mi" style={{ fontSize: '1rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'photo' && <PhotoTab onChange={onChange} userId={userId} />}
      {activeTab === 'draw'  && <DrawTab  value={value} onChange={onChange} />}
      {activeTab === 'type'  && <TypeTab  onChange={onChange} />}
    </div>
  )
}