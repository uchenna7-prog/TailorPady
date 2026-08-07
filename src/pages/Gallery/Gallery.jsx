import { useState, useRef, useCallback, useEffect } from 'react'
import { useCustomers } from '../../contexts/CustomerContext'
import { useGallery } from '../../contexts/GalleryContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { useTour } from '../../contexts/TourContext'
import { AddPhotoModal } from './components/AddPhotoModal/AddPhotoModal'
import {SharePortfolioModal} from './components/SharePortfolioModal/SharePortfolioModal'
import { Lightbox } from './components/Lightbox/Lightbox'
import { ManageGarmentTypesSheet } from './components/ManageGarmentTypesSheet/ManageGarmentTypesSheet'
import BottomNav from '../../components/BottomNav/BottomNav'
import Header from '../../components/Header/Header'
import ConfirmSheet from '../../components/ConfirmSheet/ConfirmSheet'
import Toast from '../../components/Toast/Toast'
import styles from './Gallery.module.css'

const TABS = [
  { id: 'completed_works', label: 'Portfolio',   icon: 'check_circle' },
  { id: 'designs',         label: 'Designs',     icon: 'content_cut'  },
  { id: 'inspiration',     label: 'Inspiration', icon: 'lightbulb'    },
]

const CATEGORY_MAP = {
  completed_works: { label: 'Portfolio',    icon: 'check_circle' },
  designs:         { label: 'Design',       icon: 'content_cut'  },
  inspiration:     { label: 'Inspiration',  icon: 'lightbulb'    },
}

const ALL_SUB_TAB = { id: '__all__', label: 'All' }

export default function Gallery({ onMenuClick }) {
  const { customers } = useCustomers()
  const { photos, GarmentTypes, loading, addPhoto, deletePhoto, updatePhoto, saveGarmentTypes } = useGallery()
  const { profileSettings } = useProfileSettings()
  const { currentStep, completeStep } = useTour()

  const [activeTab,     setActiveTab]     = useState('completed_works')
  const [activeSubTabs, setActiveSubTabs] = useState({})
  const [manageTabId,   setManageTabId]   = useState(null)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [confirmDel,    setConfirmDel]    = useState(null)
  const [toastMsg,      setToastMsg]      = useState('')
  const [shareOpen,     setShareOpen]     = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const toastTimer       = useRef(null)
  const tabsRef          = useRef(null)
  const subTabsRef       = useRef(null)
  const tabActionBarRef  = useRef(null)
  const pageRef          = useRef(null)

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }, [])

  const currentGarmentTypes = GarmentTypes[activeTab] || []

  useEffect(() => {
    const el = tabActionBarRef.current
    const page = pageRef.current
    if (!el || !page) return
    const update = () => {
      page.style.setProperty('--tab-bar-h', `${el.offsetHeight}px`)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const activeSubTab = activeSubTabs[activeTab] ?? '__all__'

  const filteredByMain = photos.filter(p => p.category === activeTab)
  const filteredBySub = activeSubTab === '__all__'
    ? filteredByMain
    : filteredByMain.filter(p => p.clothingType === activeSubTab)
  const filtered = searchQuery.trim()
    ? filteredBySub.filter(p =>
        p.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clothingTypeLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredBySub

  const counts = Object.fromEntries(TABS.map(t => [t.id, photos.filter(p => p.category === t.id).length]))
  const lightboxList = lightboxPhoto ? filtered : []

  const completedWorksPhotos = photos.filter(p => p.category === 'completed_works')

  const handleAddPhoto = async (photoData) => {
    try { await addPhoto(photoData) }
    catch { showToast('Failed to save photo') }
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDel) return
    try {
      await deletePhoto(confirmDel)
      if (lightboxPhoto?.id === confirmDel.id) setLightboxPhoto(null)
      showToast('Photo deleted')
    } catch { showToast('Failed to delete photo') }
    setConfirmDel(null)
  }

  const handleSaveGarmentTypes = async (tabId, types) => {
    try {
      const survivingIds = new Set(types.map(t => t.id))
      const removedIds   = (GarmentTypes[tabId] || [])
        .map(t => t.id)
        .filter(id => !survivingIds.has(id))

      if (removedIds.length > 0) {
        const orphans = photos.filter(
          p => p.category === tabId && removedIds.includes(p.clothingType)
        )
        await Promise.all(orphans.map(p => deletePhoto(p)))
        if (orphans.length > 0) showToast(`${orphans.length} photo${orphans.length > 1 ? 's' : ''} removed`)
      }

      await saveGarmentTypes(tabId, types)

      const ids = types.map(t => t.id)
      setActiveSubTabs(prev => ({
        ...prev,
        [tabId]: ids.includes(prev[tabId]) ? prev[tabId] : '__all__'
      }))
    } catch { showToast('Failed to save dress types') }
  }

  useEffect(() => {
    if (!subTabsRef.current) return
    const activeEl = subTabsRef.current.querySelector(`.${styles.subTabActive}`)
    if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeSubTab, activeTab])

  const TAB_ACTIONS = {
    completed_works: { icon: 'share',          label: 'Share Portfolio Link', onPress: () => setShareOpen(true) },
    designs:         { icon: 'picture_as_pdf', label: 'Export Lookbook',      onPress: () => showToast('Export lookbook coming soon!') },
    inspiration:     { icon: 'send',           label: 'Send Board',           onPress: () => showToast('Share board coming soon!') },
  }
  const tabAction = TAB_ACTIONS[activeTab]
  const [pillExpanded, setPillExpanded] = useState(true)
  const pillTimer = useRef(null)

  useEffect(() => {
    setPillExpanded(true)
    clearTimeout(pillTimer.current)
    pillTimer.current = setTimeout(() => setPillExpanded(false), 2000)
    return () => clearTimeout(pillTimer.current)
  }, [activeTab])

  const handlePillClick = () => {
    if (!pillExpanded) {
      setPillExpanded(true)
      clearTimeout(pillTimer.current)
      pillTimer.current = setTimeout(() => setPillExpanded(false), 2000)
    } else {
      tabAction?.onPress()
      if (currentStep?.id === 'portfolio-share-link') {
        completeStep('portfolio-share-link')
      }
      if (currentStep?.id === 'portfolio-share-link-2') {
        completeStep('portfolio-share-link-2')
      }
    }
  }

  const resolveImgSrc = (photo) => photo.storageUrl || photo.src

  return (
    <div className={styles.page} ref={pageRef}>
      <Header title="Gallery" onMenuClick={onMenuClick} />

      <div className={styles.stickyHeader}>
        <div className={styles.tabActionBar} ref={tabActionBarRef}>
          <div className={styles.tabs} ref={tabsRef}>
            {TABS.map(tab => (
              <div
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={(e) => {
                  setActiveTab(tab.id)
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                }}
              >
                <span>{tab.label}</span>
                {counts[tab.id] > 0 && <span className={styles.tabBadge}>{counts[tab.id]}</span>}
              </div>
            ))}
          </div>
          {tabAction && (
            <div className={styles.pillWrap}>
              <button
                className={`${styles.pill} ${pillExpanded ? styles.pillExpanded : ''}`}
                onClick={handlePillClick}
                aria-label={tabAction.label}
                data-tour="gallery-share-portfolio-pill"
              >
                <span className={`mi ${styles.pillIcon}`}>{tabAction.icon}</span>
                <span className={styles.pillLabel}>{tabAction.label}</span>
              </button>
            </div>
          )}
        </div>

        <div className={styles.subTabsBar}>
          <div className={styles.subTabsScroll} ref={subTabsRef} data-tour="gallery-garment-subtabs">
            <button
              key="__all__"
              className={`${styles.subTab} ${activeSubTab === '__all__' ? styles.subTabActive : ''}`}
              onClick={() => setActiveSubTabs(prev => ({ ...prev, [activeTab]: '__all__' }))}
            >
              All
            </button>
            {currentGarmentTypes.map(st => (
              <button
                key={st.id}
                className={`${styles.subTab} ${activeSubTab === st.id ? styles.subTabActive : ''}`}
                onClick={() => setActiveSubTabs(prev => ({ ...prev, [activeTab]: st.id }))}
              >
                {st.label}
              </button>
            ))}
            <button
              className={styles.subTabEditBtn}
              onClick={() => setManageTabId(activeTab)}
              title="Edit garment types"
              data-tour="gallery-garment-edit-btn"
            >
              <span className="mi-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.searchBarWrap}>
        <div className={styles.gallerySearchWrap}>
          <span className="mi" style={{ fontSize: '1.1rem', color: 'var(--text3)', flexShrink: 0 }}>search</span>
          <input
            className={styles.gallerySearchInput}
            type="text"
            placeholder="Search photos…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button className={styles.gallerySearchClear} onClick={() => setSearchQuery('')}>
              <span className="mi" style={{ fontSize: '1rem' }}>close</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.gridArea}>
        {loading ? (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '2rem', opacity: 0.2 }}>hourglass_empty</span>
            <p>Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '3rem', opacity: 0.15 }}>{CATEGORY_MAP[activeTab]?.icon ?? 'image'}</span>
            <p>{searchQuery ? 'No results found.' : 'No photos here yet.'}</p>
            {!searchQuery && <span className={styles.emptyHint}>Tap + to add your first photo</span>}
          </div>
        ) : (
          <div className={styles.masonryGrid}>
            {[0, 1].map(col => (
              <div key={col} className={styles.masonryCol}>
                {filtered.filter((_, i) => i % 2 === col).map((photo, i) => (
                  <div
                    key={photo.id}
                    className={styles.photoThumb}
                    style={{ animationDelay: `${i * 0.03}s` }}
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    <img
                      src={resolveImgSrc(photo)}
                      alt={photo.caption || 'photo'}
                      className={styles.thumbImg}
                    />
                    <div className={styles.thumbBadge}>
                      <span className="mi" style={{ fontSize: '0.8rem' }}>{CATEGORY_MAP[photo.category]?.icon}</span>
                    </div>
                    {photo.price && (
                      <div className={styles.thumbPrice}>₦{photo.price}</div>
                    )}
                    {photo.caption && <div className={styles.thumbCaption}>{photo.caption}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className={styles.fab} onClick={() => setModalOpen(true)} data-tour="gallery-add-photo-fab">
        <span className="mi">add</span>
      </button>

      {modalOpen && (
        <AddPhotoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleAddPhoto}
          GarmentTypes={GarmentTypes}
          activeMainTab={activeTab}
        />
      )}

      <ManageGarmentTypesSheet
        isOpen={!!manageTabId}
        onClose={() => setManageTabId(null)}
        tabId={manageTabId}
        types={GarmentTypes[manageTabId] || []}
        onSave={handleSaveGarmentTypes}
        photos={photos}
      />

      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          photos={lightboxList}
          onClose={() => setLightboxPhoto(null)}
          onDelete={(p) => { setLightboxPhoto(null); setConfirmDel(p) }}
        />
      )}

      <ConfirmSheet
        open={!!confirmDel}
        title="Delete Photo?"
        message="This photo will be permanently removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDel(null)}
      />

      <SharePortfolioModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        brandName={profileSettings.brandName}
        completedWorksPhotos={completedWorksPhotos}
      />

      <Toast message={toastMsg} />
      <BottomNav></BottomNav>
    </div>
  )
}
