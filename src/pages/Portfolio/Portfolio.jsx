import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore'
import { db } from '../../firebasePublic'
import { getPublicBrandDataFromServer } from '../../services/profileService'
import { getPortfolioSettingsFromServer } from '../../services/portfolioSettingsService'
import { getApprovedReviews } from '../../services/reviewService'
import { resolveSlug } from '../../services/slugService'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { PortfolioTemplate1 } from './PortfolioTemplates/PortfolioTemplate1/PortfolioTemplate1'
import { PortfolioTemplate2 } from './PortfolioTemplates/PortfolioTemplate2/PortfolioTemplate2'
import { PortfolioTemplate3 } from './PortfolioTemplates/PortfolioTemplate3/PortfolioTemplate3'
import { PortfolioTemplate4 } from './PortfolioTemplates/PortfolioTemplate4/PortfolioTemplate4'
import styles from './Portfolio.module.css'

const TEMPLATE_MAP = {
  template1: PortfolioTemplate1,
  template2: PortfolioTemplate2,
  template3: PortfolioTemplate3,
  template4: PortfolioTemplate4,
}

const DEFAULT_TEMPLATE = 'template1'

export default function Portfolio() {
  const { handle } = useParams()
  const [searchParams] = useSearchParams()
  const previewTemplate = searchParams.get('template')
  const isOnline = useNetworkStatus()

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
    if (!isOnline) return
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
          if (!uid) {
            setNotFound(true)
            setLoading(false)
          } else {
            setResolvedUid(uid)
          }
        })
        .catch(() => {
          if (navigator.onLine) {
            setNotFound(true)
            setLoading(false)
          }
        })
    }
  }, [handle, isOnline])

  useEffect(() => {
    if (!resolvedUid || !isOnline) return
    getPublicBrandDataFromServer(db, resolvedUid)
      .then(data => {
        if (!data || Object.keys(data).length === 0) {
          setNotFound(true)
        } else {
          setBrand(data)
        }
        setLoading(false)
      })
      .catch(() => {
        if (navigator.onLine) {
          setNotFound(true)
          setLoading(false)
        }
      })
  }, [resolvedUid, isOnline])

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
    getPortfolioSettingsFromServer(db, resolvedUid)
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
    getApprovedReviews(db, resolvedUid)
      .then(setReviews)
      .catch(() => {})
  }, [resolvedUid])

  if (!isOnline && loading) {
    return (
      <div className={styles.statusScreen}>
        <span className='mi-outlined' style={{ fontSize: '3rem' }}>wifi_off</span>
        <p className={styles.statusTitle}>You're offline</p>
        <p className={styles.statusSub}>Check your connection and try again.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className={styles.statusScreen}>
        <span className='mi-outlined' style={{ fontSize: '3rem' }}>search_off</span>
        <p className={styles.statusTitle}>Portfolio not found</p>
        <p className={styles.statusSub}>This tailor hasn't set up their portfolio yet.</p>
      </div>
    )
  }

  const activeKey = (previewTemplate && TEMPLATE_MAP[previewTemplate])
    ? previewTemplate
    : templateKey

  const TemplateComponent = TEMPLATE_MAP[activeKey] ?? PortfolioTemplate1

  const mergedBrand = { ...portfolioSettings, ...brand }

  return (
    <TemplateComponent
      brand={mergedBrand}
      photos={photos}
      garmentTypes={garmentTypes}
      reviews={reviews}
    />
  )
}
