import { useRef, useState } from 'react'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { TEMPLATE_MAPPINGS } from '../Templates/datas/receiptTemplateMappings'
import {
  resolveCumulativePaid,
  buildReceiptWhatsAppMessage
} from './utils'
import { useReceiptBrandSettings } from '../../hooks/useReceiptBrandSettings'
import { getBrandCSSVars } from '../../utils/cssVariablesUtils'
import { sharePDF, downloadPDF } from '../../utils/pdfUtils'
import { getPaletteById } from '../../config/brandPalette'
import { TemplateModal } from '../TemplateModal/TemplateModal'
import { DesignOptionsSheet } from '../DesignOptionsSheet/DesignOptionsSheet'
import { BrandColourSheet } from '../BrandColourSheet/BrandColourSheet'
import { ApplyScopeSheet } from '../ApplyScopeSheet/ApplyScopeSheet'
import Header from '../Header/Header'
import styles from './ReceiptViewer.module.css'


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
}) {

  const { generalSettings, updateManyGeneralSettings } = useGeneralSettings()
  const { updateManyProfileSettings } = useProfileSettings()

  const RECEIPT_BRAND_SETTINGS = useReceiptBrandSettings()

  const paperRef = useRef(null)
  const [receipt, setReceipt] = useState(snapshotedReceipt)
  const [pdfLoading, setPdfLoading]     = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [showDesignSheet, setShowDesignSheet]     = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showColourSheet, setShowColourSheet]     = useState(false)
  const [pendingChange, setPendingChange]         = useState(null)

  const templateKey = receipt.template || generalSettings.receiptTemplate || 'receiptTemplate1'
  const Template = TEMPLATE_MAPPINGS[templateKey] || TEMPLATE_MAPPINGS.receiptTemplate1

  const effectiveColourId = receipt.brandSnapshot?.colourId || colourId

  const snapShotedReceiptBrandSettings = buildSnapshotedBrandSettings(
    RECEIPT_BRAND_SETTINGS,
    receipt.brandSnapshot
  )

  const brandCSSVars = getBrandCSSVars(snapShotedReceiptBrandSettings.colour)
  const filename = `Receipt-${receipt.number}-${customer.name.replace(/\s+/g, '_')}.pdf`

  const cumulativePaid = resolveCumulativePaid(receipt)
  const orderTotal = receipt.orderPrice ? parseFloat(receipt.orderPrice) : cumulativePaid
  const isFullPay  = cumulativePaid >= orderTotal && orderTotal > 0

  const handleDownload = async () => {
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

  const handleShare = async () => {
    if (!paperRef.current || shareLoading) return
    setShareLoading(true)
    showToast?.('Preparing…')
    try {
      const exactHeight = Math.ceil(paperRef.current.getBoundingClientRect().height)
      const message = buildReceiptWhatsAppMessage(receipt, customer, snapShotedReceiptBrandSettings)
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

  const handleApplyAsDefault = () => {
    if (!pendingChange) return
    if (pendingChange.type === 'template') {
      updateManyGeneralSettings({ receiptTemplate: pendingChange.receiptTemplate })
      onApplyDefaultTemplates?.({ receiptTemplate: pendingChange.receiptTemplate })
      showToast?.('Default template updated ✓')
    } else {
      updateManyProfileSettings({ brandColourId: pendingChange.colourId, brandColour: pendingChange.colour })
      showToast?.('Default colour updated ✓')
    }
    setPendingChange(null)
  }

  const handleCancelScope = () => {
    setPendingChange(null)
  }

  return (
    <div className={styles.overlay}>
      <Header
        type="back"
        title={receipt.number}
        onBackClick={onClose}
        customActions={[
          {
            icon: 'palette',
            onClick: () => setShowDesignSheet(true),
          },
          {
            icon: pdfLoading ? 'hourglass_top' : 'download',
            onClick: handleDownload,
            disabled: pdfLoading,
          },
          {
            icon: shareLoading ? 'hourglass_top' : 'share',
            onClick: handleShare,
            disabled: shareLoading,
          },
          {
            icon: 'delete',
            onClick: () => onDelete(receipt.id),
            outlined: true,
            color: 'var(--danger)',
          },
        ]}
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
          description={`Use this ${pendingChange.type} for just this receipt, or set it as the default for all future receipts?`}
          thisLabel="Just this receipt"
          onApplyToThis={handleApplyToThis}
          onApplyToDefault={handleApplyAsDefault}
          onCancel={handleCancelScope}
        />
      )}

    </div>
  )
}