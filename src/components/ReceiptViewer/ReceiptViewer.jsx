import { useRef, useState, useEffect } from 'react'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { TEMPLATE_MAPPINGS } from '../Templates/datas/receiptTemplateMappings'
import {
  resolveCumulativePaid,
  buildReceiptWhatsAppMessage,
} from './utils'
import { useReceiptBrandSettings } from '../../hooks/useReceiptBrandSettings'
import { getBrandCSSVars } from '../../utils/cssVariablesUtils'
import { sharePDF, downloadPDF } from '../../utils/pdfUtils'
import { getPaletteById } from '../../config/brandPalette'
import { getMissingFields, getRequiresForDoc } from '../TemplateModal/templateRequiresUtils'
import { TemplateModal } from '../TemplateModal/TemplateModal'
import { MissingFieldsSheet } from '../TemplateModal/MissingFieldsSheet/MissingFieldsSheet'
import { DesignOptionsSheet } from '../DesignOptionsSheet/DesignOptionsSheet'
import { ShareOptionsSheet } from '../ShareOptionsSheet/ShareOptionsSheet'
import { MoreOptionsSheet } from '../MoreOptionsSheet/MoreOptionsSheet'
import { BrandColourSheet } from '../BrandColourSheet/BrandColourSheet'
import { ApplyScopeSheet } from '../ApplyScopeSheet/ApplyScopeSheet'
import Header from '../Header/Header'
import styles from './ReceiptViewer.module.css'


const COMPLETED_TOAST_LABELS = {
  brand:           'Brand details added ✓',
  businessContact: 'Business contact added ✓',
  invoiceSettings: 'Invoice details added ✓',
}

function getCompletedToastLabel(completedModal) {
  return COMPLETED_TOAST_LABELS[completedModal] ?? null
}

function normalizeCurrency(currency) {
  if (typeof currency === 'object' && currency !== null) {
    return currency.symbol || '₦'
  }
  return currency || '₦'
}

function buildSnapshotedBrandSettings(receiptBrandSettings, brandSnapshot) {
  const merged = brandSnapshot
    ? {
        ...receiptBrandSettings,
        ...Object.fromEntries(
          Object.entries(brandSnapshot).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        ),
      }
    : receiptBrandSettings

  return {
    ...merged,
    currency: normalizeCurrency(merged.currency),
  }
}

export default function ReceiptViewer({
  receipt: snapshotedReceipt,
  customer,
  onClose,
  onDelete,
  showToast,
  customerData,
  colourId,
  onApplyDefaultTemplates,
  reopenMissingFields = false,
  completedModal      = null,
  completedFields     = [],
  onReopenMissingFieldsHandled,
  hideDesign          = false,
}) {

  const { generalSettings, updateManyGeneralSettings } = useGeneralSettings()
  const { profileSettings, updateManyProfileSettings } = useProfileSettings()

  const RECEIPT_BRAND_SETTINGS = useReceiptBrandSettings()

  const paperRef = useRef(null)
  const [receipt, setReceipt] = useState(snapshotedReceipt)
  const [pdfLoading,          setPdfLoading]          = useState(false)
  const [shareLoading,        setShareLoading]         = useState(false)
  const [showDesignSheet,     setShowDesignSheet]      = useState(false)
  const [showShareSheet,      setShowShareSheet]       = useState(false)
  const [showMoreSheet,       setShowMoreSheet]        = useState(false)
  const [showTemplateModal,   setShowTemplateModal]    = useState(false)
  const [showColourSheet,     setShowColourSheet]      = useState(false)
  const [pendingChange,       setPendingChange]        = useState(null)
  const [missingFields,       setMissingFields]        = useState(null)
  const [pendingActionLabel,  setPendingActionLabel]   = useState(null)
  const [pendingActionFn,     setPendingActionFn]      = useState(null)
  const [activeCompletedModal, setActiveCompletedModal] = useState(null)

  const templateKey = receipt.template || generalSettings.receiptTemplate || 'receiptTemplate1'
  const Template    = TEMPLATE_MAPPINGS[templateKey] || TEMPLATE_MAPPINGS.receiptTemplate1

  const effectiveColourId = receipt.brandSnapshot?.colourId || colourId

  const snapShotedReceiptBrandSettings = buildSnapshotedBrandSettings(
    RECEIPT_BRAND_SETTINGS,
    receipt.brandSnapshot
  )

  const brandCSSVars   = getBrandCSSVars(snapShotedReceiptBrandSettings.colour)
  const filename       = `Receipt-${receipt.number}-${customer.name.replace(/\s+/g, '_')}.pdf`
  const cumulativePaid = resolveCumulativePaid(receipt)
  const orderTotal     = receipt.orderPrice ? parseFloat(receipt.orderPrice) : cumulativePaid
  const isFullPay      = cumulativePaid >= orderTotal && orderTotal > 0

  const returnTo = {
    customerId: customer.id,
    receiptId:  receipt.id,
  }

  useEffect(() => {
    if (!reopenMissingFields) return
    const requires   = getRequiresForDoc('receipt', null, templateKey)
    const missing    = getMissingFields(requires, profileSettings)
    const missingSet = new Set(missing)
    const madeProgress = completedFields.some(field => !missingSet.has(field))

    if (madeProgress) {
      const label = getCompletedToastLabel(completedModal)
      if (missing.length === 0 && label) {
        showToast?.(label)
      } else if (missing.length > 0) {
        setActiveCompletedModal(completedModal)
      }
    }

    if (missing.length > 0) {
      setMissingFields(missing)
    }

    onReopenMissingFieldsHandled?.()
  }, [reopenMissingFields])

  const checkMissingThen = (label, action) => {
    const requires = getRequiresForDoc('receipt', null, templateKey)
    const missing  = getMissingFields(requires, profileSettings)
    if (missing.length > 0) {
      setPendingActionLabel(label)
      setPendingActionFn(() => action)
      setActiveCompletedModal(null)
      setMissingFields(missing)
      return
    }
    action()
  }

  const executeDownload = async () => {
    if (!paperRef.current || pdfLoading) return
    setPdfLoading(true)
    showToast?.('Generating PDF…')
    try {
      const exactHeight = Math.ceil(paperRef.current.getBoundingClientRect().height)
      await downloadPDF(paperRef.current, filename, brandCSSVars, exactHeight)
      showToast?.('PDF downloaded ✓')
    } catch {
      showToast?.('PDF failed — please try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  const executeShare = async () => {
    if (!paperRef.current || shareLoading) return
    setShareLoading(true)
    showToast?.('Preparing…')
    try {
      const exactHeight = Math.ceil(paperRef.current.getBoundingClientRect().height)
      const message     = buildReceiptWhatsAppMessage(receipt, customer, snapShotedReceiptBrandSettings)
      await sharePDF(paperRef.current, filename, message, brandCSSVars, exactHeight)
      showToast?.('Shared ✓')
    } catch (err) {
      if (err?.name !== 'AbortError') {
        showToast?.('Share failed — please try again.')
      }
    } finally {
      setShareLoading(false)
    }
  }

  const handleDownload = () => checkMissingThen('download', executeDownload)
  const handleShare    = () => checkMissingThen('share', executeShare)

  const handleTemplateSelect = ({ receiptTemplate }) => {
    setPendingChange({ type: 'template', receiptTemplate })
  }

  const handleColourSelect = (selectedColourId) => {
    setShowColourSheet(false)
    const hex = getPaletteById(selectedColourId)?.tokens.primary
    setPendingChange({ type: 'colour', colourId: selectedColourId, colour: hex })
  }

  const handleApplyToThis = async () => {
    if (!pendingChange) return
    try {
      if (pendingChange.type === 'template') {
        await customerData.updateReceiptTemplate(receipt.id, pendingChange.receiptTemplate)
        setReceipt(prev => ({ ...prev, template: pendingChange.receiptTemplate }))
        showToast?.('Template updated for this receipt ✓')
      } else {
        await customerData.updateReceiptColour(receipt.id, pendingChange.colourId, pendingChange.colour)
        setReceipt(prev => ({
          ...prev,
          brandSnapshot: { ...prev.brandSnapshot, colourId: pendingChange.colourId, colour: pendingChange.colour },
        }))
        showToast?.('Colour updated for this receipt ✓')
      }
    } catch {
      showToast?.(pendingChange.type === 'template' ? 'Could not update template.' : 'Could not update colour.')
    } finally {
      setPendingChange(null)
    }
  }

  const handleApplyAsDefault = async () => {
    if (!pendingChange) return
    try {
      if (pendingChange.type === 'template') {
        await customerData.updateReceiptTemplate(receipt.id, pendingChange.receiptTemplate)
        setReceipt(prev => ({ ...prev, template: pendingChange.receiptTemplate }))
        updateManyGeneralSettings({ receiptTemplate: pendingChange.receiptTemplate })
        onApplyDefaultTemplates?.({ receiptTemplate: pendingChange.receiptTemplate })
        showToast?.('Template updated here and set as default ✓')
      } else {
        await customerData.updateReceiptColour(receipt.id, pendingChange.colourId, pendingChange.colour)
        setReceipt(prev => ({
          ...prev,
          brandSnapshot: { ...prev.brandSnapshot, colourId: pendingChange.colourId, colour: pendingChange.colour },
        }))
        updateManyProfileSettings({ brandColourId: pendingChange.colourId, brandColour: pendingChange.colour })
        showToast?.('Colour updated here and set as default ✓')
      }
    } catch {
      showToast?.(pendingChange.type === 'template' ? 'Could not update template.' : 'Could not update colour.')
    } finally {
      setPendingChange(null)
    }
  }

  const handleCancelScope = () => {
    setPendingChange(null)
  }

  const headerActions = [
    !hideDesign && {
      icon:    'palette',
      onClick: () => setShowDesignSheet(true),
    },
    {
      icon:    'share',
      onClick: () => setShowShareSheet(true),
    },
    {
      icon:    'more_vert',
      onClick: () => setShowMoreSheet(true),
    },
  ].filter(Boolean)

  return (
    <div className={styles.overlay} onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
      <Header
        type="back"
        title={receipt.number}
        onBackClick={onClose}
        customActions={headerActions}
      />

      <div className={styles.scrollArea}>

        <div className={styles.statusRow}>
          <div className={`${styles.statusBadge} ${isFullPay ? styles.status_paid : styles.status_part_paid}`}>
            {isFullPay ? 'Paid in Full' : 'Part Payment'}
          </div>
        </div>

        <div className={styles.paperWrap}>
          <div className={styles.paperInner} ref={paperRef} style={brandCSSVars}>
            <Template receipt={receipt} customer={customer} receiptBrandSettings={snapShotedReceiptBrandSettings} />
          </div>
        </div>

      </div>

      {showDesignSheet && (
        <DesignOptionsSheet
          onClose={() => setShowDesignSheet(false)}
          onSelectTemplate={() => { setShowDesignSheet(false); setShowTemplateModal(true) }}
          onSelectColour={() => { setShowDesignSheet(false); setShowColourSheet(true) }}
        />
      )}

      {showShareSheet && (
        <ShareOptionsSheet
          docType="receipt"
          onClose={() => setShowShareSheet(false)}
          onShare={handleShare}
          onDownload={handleDownload}
        />
      )}

      {showMoreSheet && (
        <MoreOptionsSheet
          docType="receipt"
          onClose={() => setShowMoreSheet(false)}
          onDelete={() => onDelete(receipt.id)}
        />
      )}

      {showTemplateModal && (
        <TemplateModal
          isOpen={showTemplateModal}
          currentInvoiceTemplate={generalSettings.invoiceTemplate}
          currentReceiptTemplate={templateKey}
          colourId={effectiveColourId}
          lockToTab="receipt"
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleTemplateSelect}
        />
      )}

      {showColourSheet && (
        <BrandColourSheet
          currentColourId={effectiveColourId}
          onClose={() => setShowColourSheet(false)}
          onSelect={handleColourSelect}
        />
      )}

      {pendingChange && (
        <ApplyScopeSheet
          icon={pendingChange.type === 'colour' ? 'palette' : 'style'}
          title={pendingChange.type === 'colour' ? 'Apply new colour' : 'Apply new template'}
          description={
            pendingChange.type === 'colour'
              ? 'Apply to this receipt only, or apply here and make it your default going forward?'
              : 'Apply to this receipt only, or apply here and make it your default going forward?'
          }
          thisLabel="This receipt only"
          defaultLabel="This receipt + set as default"
          onApplyToThis={handleApplyToThis}
          onApplyToDefault={handleApplyAsDefault}
          onCancel={handleCancelScope}
        />
      )}

      {missingFields !== null && missingFields.length > 0 && (
        <MissingFieldsSheet
          missingFields={missingFields}
          docType="receipt"
          pendingAction={pendingActionLabel}
          returnTo={returnTo}
          completedModal={activeCompletedModal}
          onClose={() => {
            setMissingFields(null)
            setPendingActionLabel(null)
            setPendingActionFn(null)
            setActiveCompletedModal(null)
          }}
          onSkipAndSave={() => {
            setMissingFields(null)
            const fn = pendingActionFn
            setPendingActionLabel(null)
            setPendingActionFn(null)
            setActiveCompletedModal(null)
            fn?.()
          }}
        />
      )}

    </div>
  )
}