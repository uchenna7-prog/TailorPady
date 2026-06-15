import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot, doc, where } from 'firebase/firestore'
import { db } from '../../firebasePublic'
import { getPublicBrandDataFromFirestore } from '../../services/profileService'
import { getPortfolioSettings } from '../../services/portfolioSettingsService'
import { resolveSlug } from '../../services/slugService'
import { PortfolioTemplate1 } from './PortfolioTemplates/PortfolioTemplate1/PortfolioTemplate1'
import { PortfolioTemplate2 } from './PortfolioTemplates/PortfolioTemplate2/PortfolioTemplate2'
import styles from './Portfolio.module.css'

const TEMPLATE_MAP = {
  template1: PortfolioTemplate1,
  template2: PortfolioTemplate2,
}

const DEFAULT_TEMPLATE = 'template2'

export default function Portfolio() {
  const { handle } = useParams()
  const [searchParams] = useSearchParams()
  const previewTemplate = searchParams.get('template')

  const [resolvedUid,       setResolvedUid]       = useState(null)
  const [brand,             setBrand]             = useState(null)
  const [photos,            setPhotos]            = useState([])
  const [garmentTypes,      setGarmentTypes]      = useState([])
  const [reviews,           setReviews]           = useState([])
  const [portfolioSettings, setPortfolioSettings] = useState(null)
  const [templateKey,       setTemplateKey]       = useState(DEFAULT_TEMPLATE)
  const [loading,           setLoading]           = useState(true)
  const [notFound,          setNotFound]          = useState(false)

  useEffect(() => {
    if (!handle) {
      setNotFound(true)
      setLoading(false)
      return
    }
    const looksLikeUid = /[A-Z]/.test(handle)
    if (looksLikeUid) {
      setResolvedUid(handle)
    } else {
      resolveSlug(db, handle)
        .then(uid => {
          if (!uid) { setNotFound(true); setLoading(false) }
          else setResolvedUid(uid)
        })
        .catch(() => { setNotFound(true); setLoading(false) })
    }
  }, [handle])

  useEffect(() => {
    if (!resolvedUid) return
    getPublicBrandDataFromFirestore(db, resolvedUid)
      .then(data => { if (!data || Object.keys(data).length === 0) setNotFound(true); else setBrand(data) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [resolvedUid])

  useEffect(() => {
    if (!resolvedUid) return
    const q = query(
      collection(db, 'users', resolvedUid, 'galleryPhotos'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, snap =>
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {}
    )
  }, [resolvedUid])

  useEffect(() => {
    if (!resolvedUid) return
    return onSnapshot(
      doc(db, 'users', resolvedUid, 'galleryGarmentTypes', 'completed_works'),
      snap => setGarmentTypes(snap.exists() ? (snap.data().types ?? []) : []),
      () => {}
    )
  }, [resolvedUid])

  useEffect(() => {
    if (!resolvedUid) return
    getPortfolioSettings(db, resolvedUid)
      .then(settings => {
        setPortfolioSettings(settings)
        if (settings.portfolioTemplate && TEMPLATE_MAP[settings.portfolioTemplate]) {
          setTemplateKey(settings.portfolioTemplate)
        }
      })
      .catch(() => {})
  }, [resolvedUid])

  useEffect(() => {
    if (!resolvedUid) return
    const q = query(
      collection(db, 'users', resolvedUid, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('approvedAt', 'desc')
    )
    return onSnapshot(q, snap =>
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {}
    )
  }, [resolvedUid])

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingLine} />
        <p className={styles.loadingText}>Loading</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className={styles.notFoundScreen}>
        <span className="mi" style={{ fontSize: '3rem', color: '#bbb' }}>content_cut</span>
        <p className={styles.notFoundTitle}>Portfolio not found</p>
        <p className={styles.notFoundSub}>This tailor hasn't set up their portfolio yet.</p>
      </div>
    )
  }

  const activeKey = (previewTemplate && TEMPLATE_MAP[previewTemplate])
    ? previewTemplate
    : templateKey

  const TemplateComponent = TEMPLATE_MAP[activeKey] ?? PortfolioTemplate1

  const mergedBrand = { ...brand, ...portfolioSettings }

  return (
    <TemplateComponent
      brand={mergedBrand}
      photos={photos}
      garmentTypes={garmentTypes}
      reviews={reviews}
      heroImageId={portfolioSettings?.heroBgImage}
      footerImageId={portfolioSettings?.footerBgImage}
    />
  )
}