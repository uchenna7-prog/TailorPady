import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './SignatureSection.module.css'

const FONTS = [
  { id: 'dancing',  label: 'Dancing Script', family: "'Dancing Script', cursive" },
  { id: 'great',    label: 'Great Vibes',    family: "'Great Vibes', cursive"    },
  { id: 'pacifico', label: 'Pacifico',       family: "'Pacifico', cursive"       },
  { id: 'pinyon',   label: 'Pinyon Script',  family: "'Pinyon Script', cursive"  },
]


// ── Draw Tab ─────────────────────────────────────────────────────────────────

function DrawTab({ value, onChange }) {
  const canvasRef = useRef(null)
  const drawing   = useRef(false)
  const points    = useRef([])
  const hasStroke = useRef(false)

  useEffect(() => {
    if (!value || !canvasRef.current) return
    const img = new Image()
    img.onload = () => {
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
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
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


// ── Upload Tab ────────────────────────────────────────────────────────────────

function UploadTab({ onChange }) {
  const [preview,    setPreview]    = useState(null)
  const [processing, setProcessing] = useState(false)
  const fileRef = useRef(null)

  function removeBackground(imageEl) {
    const canvas  = document.createElement('canvas')
    canvas.width  = imageEl.naturalWidth  || imageEl.width
    canvas.height = imageEl.naturalHeight || imageEl.height
    const ctx     = canvas.getContext('2d')
    ctx.drawImage(imageEl, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data      = imageData.data

    const corners = [
      { r: data[0],                                              g: data[1],                                              b: data[2]                                              },
      { r: data[(canvas.width - 1) * 4],                        g: data[(canvas.width - 1) * 4 + 1],                     b: data[(canvas.width - 1) * 4 + 2]                     },
      { r: data[(canvas.width * (canvas.height - 1)) * 4],      g: data[(canvas.width * (canvas.height - 1)) * 4 + 1],   b: data[(canvas.width * (canvas.height - 1)) * 4 + 2]   },
      { r: data[(canvas.width * canvas.height - 1) * 4],        g: data[(canvas.width * canvas.height - 1) * 4 + 1],     b: data[(canvas.width * canvas.height - 1) * 4 + 2]     },
    ]
    const bgR = Math.round(corners.reduce((s, c) => s + c.r, 0) / 4)
    const bgG = Math.round(corners.reduce((s, c) => s + c.g, 0) / 4)
    const bgB = Math.round(corners.reduce((s, c) => s + c.b, 0) / 4)

    const threshold = 40
    for (let i = 0; i < data.length; i += 4) {
      const dr = Math.abs(data[i]     - bgR)
      const dg = Math.abs(data[i + 1] - bgG)
      const db = Math.abs(data[i + 2] - bgB)
      if (dr < threshold && dg < threshold && db < threshold) {
        data[i + 3] = 0
      }
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas.toDataURL('image/png')
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setProcessing(true)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img  = new Image()
      img.onload = () => {
        const result = removeBackground(img)
        setPreview(result)
        setProcessing(false)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleAccept() {
    onChange(preview)
  }

  function handleRetake() {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className={styles.tabPane}>
      {!preview && !processing && (
        <div
          className={styles.uploadZone}
          onClick={() => fileRef.current?.click()}
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
          <p className={styles.uploadTitle}>Snap or upload your signature</p>
          <p className={styles.uploadSub}>Sign on white paper, take a photo — background is removed automatically</p>
          <span className={styles.uploadBtn}>Choose Photo</span>
        </div>
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
            <button type="button" className={styles.acceptBtn} onClick={handleAccept}>
              <span className="mi" style={{ fontSize: '0.9rem' }}>check</span>Use this
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


// ── Type Tab ──────────────────────────────────────────────────────────────────

function TypeTab({ onChange }) {
  const [name,       setName]       = useState('')
  const [selectedId, setSelectedId] = useState('dancing')
  const canvasRef = useRef(null)

  const renderToCanvas = useCallback((text, fontFamily) => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return
    const ctx    = canvas.getContext('2d')

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


// ── SignatureSection ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'draw',   label: 'Draw',  icon: 'draw'         },
  { id: 'upload', label: 'Photo', icon: 'photo_camera' },
  { id: 'type',   label: 'Type',  icon: 'title'        },
]

export function SignatureSection({ value, onChange }) {
  const [activeTab, setActiveTab] = useState('draw')

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

      {activeTab === 'draw'   && <DrawTab   value={value} onChange={onChange} />}
      {activeTab === 'upload' && <UploadTab              onChange={onChange} />}
      {activeTab === 'type'   && <TypeTab                onChange={onChange} />}
    </div>
  )
}