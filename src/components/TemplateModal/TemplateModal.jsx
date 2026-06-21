import { useState, useRef, useMemo, useCallback, useEffect, useLayoutEffect } from 'react'
import { useBrandTokens } from '../../hooks/useBrandTokens'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import Header from '../Header/Header'
import { ZoomOverlay } from './ZoomOverlay/ZoomOverlay'
import { MissingFieldsSheet } from './MissingFieldsSheet/MissingFieldsSheet'
import { INVOICE_TEMPLATE_GROUPS } from './datas/invoiceTemplateGroups'
import { RECEIPT_TEMPLATE_GROUPS } from './datas/receiptTemplateGroups'
import {
  CUSTOMER_SAMPLE_DATA,
  getInvoiceSampleData,
  getReceiptSampleData,
} from './datas/sampleDatas'
import { useReceiptBrandSettings } from '../../hooks/useReceiptBrandSettings'
import { useInvoiceBrandSettings } from '../../hooks/useInvoiceBrandSettings'
import styles from './TemplateModal.module.css'

const STYLE_FILTERS = [
  { id: 'all',    label: 'All'    },
  { id: 'Clean',  label: 'Clean'  },
  { id: 'Accent', label: 'Accent' },
  { id: 'Solid',  label: 'Solid'  },
]

const FIELD_TO_PROFILE_KEY = {
  name:          'brandName',
  tagline:       'brandTagline',
  phone:         'brandPhone',
  email:         'brandEmail',
  address:       'brandAddress',
  website:       'brandWebsite',
  logo:          'brandLogo',
  signature:     'brandSignature',
  accountBank:   'accountBank',
  accountNumber: 'accountNumber',
  accountName:   'accountName',
  paymentTerms:  'brandPaymentTerms',
}

function isMissing(key, profileSettings) {
  const rawKey = FIELD_TO_PROFILE_KEY[key]
  const value  = rawKey ? profileSettings[rawKey] : null
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

function getMissingFields(requires, profileSettings) {
  return requires.filter(key => isMissing(key, profileSettings))
}

function getUnionRequires(invoiceTemplateId, receiptTemplateId) {
  const allInvoice      = INVOICE_TEMPLATE_GROUPS.flatMap(g => g.templates)
  const allReceipt      = RECEIPT_TEMPLATE_GROUPS.flatMap(g => g.templates)
  const invoiceTemplate = allInvoice.find(t => t.id === invoiceTemplateId)
  const receiptTemplate = allReceipt.find(t => t.id === receiptTemplateId)
  const combined        = new Set([
    ...(invoiceTemplate?.requires ?? []),
    ...(receiptTemplate?.requires ?? []),
  ])
  return Array.from(combined)
}

export function TemplateModal({
  isOpen,
  currentInvoiceTemplate,
  currentReceiptTemplate,
  colourId,
  lockToTab,
  onClose,
  onSelect,
  onOpenInvoiceSettings,
}) {
  const { profileSettings }    = useProfileSettings()
  const RECEIPT_BRAND_SETTINGS = useReceiptBrandSettings()
  const INVOICE_BRAND_SETTINGS = useInvoiceBrandSettings()

  const modalRef     = useRef(null)
  const scrollRef    = useRef(null)
  const filterBarRef = useRef(null)
  const chipRefs     = useRef({})
  const cardRefs     = useRef({})

  const [selectedInvoiceTemplate, setSelectedInvoiceTemplate] = useState(
    currentInvoiceTemplate || 'invoiceTemplate1'
  )
  const [selectedReceiptTemplate, setSelectedReceiptTemplate] = useState(
    currentReceiptTemplate || 'receiptTemplate1'
  )
  const [appliedInvoiceTemplate, setAppliedInvoiceTemplate] = useState(
    currentInvoiceTemplate || 'invoiceTemplate1'
  )
  const [appliedReceiptTemplate, setAppliedReceiptTemplate] = useState(
    currentReceiptTemplate || 'receiptTemplate1'
  )
  const [activeTab,      setActiveTab]      = useState(lockToTab || 'invoice')
  const [inActiveTab,    setInActiveTab]    = useState(lockToTab === 'receipt' ? 'invoice' : 'receipt')
  const [activeFilter,   setActiveFilter]   = useState('all')
  const [gridAnimKey,    setGridAnimKey]    = useState(0)
  const [zoomedTemplate, setZoomedTemplate] = useState(null)
  const [zoomIndex,      setZoomIndex]      = useState(null)
  const [slideDir,       setSlideDir]       = useState(null)
  const [slideKey,       setSlideKey]       = useState(0)
  const [missingFields,  setMissingFields]  = useState(null)

  useBrandTokens(colourId, modalRef)

  const tabs = useMemo(() => ({
    invoice: {
      label: 'Invoice',
      icon: 'receipt_long',
      templateGroups: INVOICE_TEMPLATE_GROUPS,
      selectedId: selectedInvoiceTemplate,
      appliedId: appliedInvoiceTemplate,
      onSelectTemplate: setSelectedInvoiceTemplate,
      getSampleProps: () => ({
        invoice: getInvoiceSampleData(INVOICE_BRAND_SETTINGS),
        customer: CUSTOMER_SAMPLE_DATA,
        invoiceBrandSettings: INVOICE_BRAND_SETTINGS,
      }),
    },
    receipt: {
      label: 'Receipt',
      icon: 'payments',
      templateGroups: RECEIPT_TEMPLATE_GROUPS,
      selectedId: selectedReceiptTemplate,
      appliedId: appliedReceiptTemplate,
      onSelectTemplate: setSelectedReceiptTemplate,
      getSampleProps: () => ({
        receipt: getReceiptSampleData(RECEIPT_BRAND_SETTINGS),
        customer: CUSTOMER_SAMPLE_DATA,
        receiptBrandSettings: RECEIPT_BRAND_SETTINGS,
      }),
    },
  }), [
    selectedInvoiceTemplate,
    selectedReceiptTemplate,
    appliedInvoiceTemplate,
    appliedReceiptTemplate,
    INVOICE_BRAND_SETTINGS,
    RECEIPT_BRAND_SETTINGS,
  ])

  const activeTabObject   = tabs[activeTab]
  const inActiveTabObject = tabs[inActiveTab]

  const hasChanges =
    selectedInvoiceTemplate !== appliedInvoiceTemplate ||
    selectedReceiptTemplate !== appliedReceiptTemplate

  const filteredTemplates = useMemo(() => {
    const groups = activeFilter === 'all'
      ? activeTabObject.templateGroups
      : activeTabObject.templateGroups.filter(g => g.groupLabel === activeFilter)
    return groups.flatMap(g => g.templates)
  }, [activeTabObject, activeFilter])

  function scrollFilterChipIntoView(filterId) {
    const bar  = filterBarRef.current
    const chip = chipRefs.current[filterId]
    if (!bar || !chip) return
    const barRect  = bar.getBoundingClientRect()
    const chipRect = chip.getBoundingClientRect()
    const offset   = chipRect.left - barRect.left - barRect.width / 2 + chipRect.width / 2
    bar.scrollBy({ left: offset, behavior: 'smooth' })
  }

  function scrollSelectedCardIntoView(selectedId) {
    const el        = cardRefs.current[selectedId]
    const container = scrollRef.current
    if (!el || !container) return
    const containerRect = container.getBoundingClientRect()
    const elRect        = el.getBoundingClientRect()
    const offset        = elRect.top - containerRect.top + container.scrollTop - 12
    container.scrollTo({ top: offset, behavior: 'smooth' })
  }

  useLayoutEffect(() => {
    if (!isOpen) return
    setActiveFilter('all')
    requestAnimationFrame(() => {
      scrollFilterChipIntoView('all')
      scrollSelectedCardIntoView(activeTabObject.selectedId)
    })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    setActiveFilter('all')
    setGridAnimKey(k => k + 1)
    requestAnimationFrame(() => {
      scrollFilterChipIntoView('all')
      scrollSelectedCardIntoView(activeTabObject.selectedId)
    })
  }, [activeTab])

  const handleTabSwitch = useCallback((tabKey) => {
    if (lockToTab) return
    if (tabKey === activeTab) return
    if (tabKey === 'invoice') {
      setActiveTab('invoice')
      setInActiveTab('receipt')
    } else {
      setActiveTab('receipt')
      setInActiveTab('invoice')
    }
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab, lockToTab])

  const handleFilterChange = useCallback((filterId) => {
    setActiveFilter(filterId)
    setGridAnimKey(k => k + 1)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    requestAnimationFrame(() => scrollFilterChipIntoView(filterId))
  }, [])

  const handleTemplateSelect = useCallback((template) => {
    if (activeTabObject.label === 'Invoice') {
      const num = template.id.replace('invoiceTemplate', '')
      activeTabObject.onSelectTemplate(template.id)
      inActiveTabObject.onSelectTemplate('receiptTemplate' + num)
    } else {
      const num = template.id.replace('receiptTemplate', '')
      activeTabObject.onSelectTemplate(template.id)
      inActiveTabObject.onSelectTemplate('invoiceTemplate' + num)
    }
  }, [activeTabObject, inActiveTabObject])

  const handleZoomOpen = useCallback((template) => {
    const idx = filteredTemplates.findIndex(t => t.id === template.id)
    setZoomedTemplate(template)
    setZoomIndex(idx)
    setSlideDir(null)
    setSlideKey(k => k + 1)
  }, [filteredTemplates])

  const handleZoomClose = useCallback(() => {
    setZoomedTemplate(null)
    setZoomIndex(null)
    setSlideDir(null)
  }, [])

  const handleZoomNav = useCallback((dir) => {
    setZoomIndex(prev => {
      const next = prev + dir
      if (next < 0 || next >= filteredTemplates.length) return prev
      setSlideDir(dir)
      setSlideKey(k => k + 1)
      setZoomedTemplate(filteredTemplates[next])
      return next
    })
  }, [filteredTemplates])

  const handleSavePress = useCallback(() => {
    const unionRequires = getUnionRequires(selectedInvoiceTemplate, selectedReceiptTemplate)
    const missing       = getMissingFields(unionRequires, profileSettings)
    if (missing.length > 0) {
      setMissingFields(missing)
      return
    }
    onSelect({
      invoiceTemplate: selectedInvoiceTemplate,
      receiptTemplate: selectedReceiptTemplate,
    })
    setAppliedInvoiceTemplate(selectedInvoiceTemplate)
    setAppliedReceiptTemplate(selectedReceiptTemplate)
    onClose()
  }, [selectedInvoiceTemplate, selectedReceiptTemplate, profileSettings, onSelect, onClose])

  const handleSkipAndSave = useCallback(() => {
    setMissingFields(null)
    onSelect({
      invoiceTemplate: selectedInvoiceTemplate,
      receiptTemplate: selectedReceiptTemplate,
    })
    setAppliedInvoiceTemplate(selectedInvoiceTemplate)
    setAppliedReceiptTemplate(selectedReceiptTemplate)
    onClose()
  }, [onSelect, onClose, selectedInvoiceTemplate, selectedReceiptTemplate])

  const handleGoToProfile = useCallback(() => {
    setMissingFields(null)
    onClose()
  }, [onClose])

  const handleGoToInvoiceSettings = useCallback(() => {
    setMissingFields(null)
    onClose()
    onOpenInvoiceSettings()
  }, [onClose, onOpenInvoiceSettings])

  if (!isOpen) return null

  const slideClass = slideDir === 1
    ? styles.zoomSlideEnterFromRight
    : slideDir === -1
    ? styles.zoomSlideEnterFromLeft
    : ''

  const sampleProps = activeTabObject.getSampleProps()
  const showTabBar  = !lockToTab

  return (
    <div className={styles.templateModalContainer} ref={modalRef}>

      <Header
        type="back"
        title="Templates"
        onBackClick={onClose}
        showBorderBottom={false}
        customActions={[{
          label:    'Save',
          onClick:  handleSavePress,
          disabled: !hasChanges,
        }]}
      />

      {showTabBar && (
        <div className={styles.tabBar}>
          {Object.entries(tabs).map(([tabKey, tab]) => (
            <button
              key={tabKey}
              className={`${styles.tabButton} ${activeTab === tabKey ? styles.tabButtonActive : ''}`}
              onClick={() => handleTabSwitch(tabKey)}
            >
              <span className="mi" style={{ fontSize: '1rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <span
            className={styles.tabIndicator}
            style={{ transform: `translateX(${activeTab === 'invoice' ? '0%' : '100%'})` }}
          />
        </div>
      )}

      <div className={styles.filterBar} ref={filterBarRef}>
        {STYLE_FILTERS.map(filter => {
          const hasTemplates = filter.id === 'all'
            ? true
            : activeTabObject.templateGroups.some(g => g.groupLabel === filter.id)
          if (!hasTemplates) return null
          return (
            <button
              key={filter.id}
              ref={el => { chipRefs.current[filter.id] = el }}
              className={`${styles.filterChip} ${activeFilter === filter.id ? styles.filterChipActive : ''}`}
              onClick={() => handleFilterChange(filter.id)}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <div className={styles.templateList} ref={scrollRef}>
        {filteredTemplates.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="mi" style={{ fontSize: '2rem' }}>layers</span>
            <p>No templates in this style</p>
          </div>
        ) : (
          <div key={gridAnimKey} className={styles.templateGrid}>
            {filteredTemplates.map((template, index) => {
              const isSelected = activeTabObject.selectedId === template.id
              return (
                <div
                  key={template.id}
                  ref={el => { cardRefs.current[template.id] = el }}
                  className={styles.templateItem}
                  onClick={() => handleTemplateSelect(template)}
                  onContextMenu={e => e.preventDefault()}
                >
                  <div className={`${styles.templateCard} ${isSelected ? styles.templateCardSelected : ''}`}>
                    <div className={styles.previewShell}>
                      <div className={styles.previewScaler}>
                        <template.Component {...sampleProps} />
                      </div>
                      <button
                        className={styles.zoomTrigger}
                        onClick={e => { e.stopPropagation(); handleZoomOpen(template) }}
                        aria-label="Preview template"
                      >
                        <span className="mi" style={{ fontSize: '0.9rem' }}>open_in_full</span>
                      </button>
                      {isSelected && (
                        <div className={styles.selectedBadge}>
                          <span className="mi" style={{ fontSize: '0.75rem' }}>check</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.templateMeta}>
                    {template.tags && template.tags.length > 0 && (
                      <div className={styles.tagList}>
                        {template.tags.map(tag => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className={`${styles.templateName} ${isSelected ? styles.templateNameSelected : ''}`}>
                      {`${index + 1}. ${template.label}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {zoomedTemplate && (
        <ZoomOverlay
          template={zoomedTemplate}
          index={zoomIndex}
          total={filteredTemplates.length}
          isSelected={activeTabObject.selectedId === zoomedTemplate.id}
          sampleProps={sampleProps}
          onClose={handleZoomClose}
          onSelect={handleTemplateSelect}
          onNav={handleZoomNav}
          canNavPrev={zoomIndex > 0}
          canNavNext={zoomIndex < filteredTemplates.length - 1}
          slideClass={slideClass}
          slideKey={slideKey}
        />
      )}

      {missingFields !== null && (
        <MissingFieldsSheet
          missingFields={missingFields}
          onClose={() => setMissingFields(null)}
          onGoToProfile={handleGoToProfile}
          onGoToInvoiceSettings={handleGoToInvoiceSettings}
          onSkipAndSave={handleSkipAndSave}
        />
      )}

    </div>
  )
}