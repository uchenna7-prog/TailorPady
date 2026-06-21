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
import { TemplateModal } from '../TemplateModal/TemplateModal'
import { TemplateScopeSheet } from '../TemplateScopeSheet/TemplateScopeSheet'
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
  const { profileSettings } = useProfileSettings()

  const RECEIPT_BRAND_SETTINGS = useReceiptBrandSettings()

  const paperRef = useRef(null)
  const [receipt, setReceipt] = useState(snapshotedReceipt)
  const [pdfLoading, setPdfLoading]   = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [pendingTemplate, setPendingTemplate]      = useState(null)

  const templateKey = receipt.template || generalSettings.receiptTemplate || 'receiptTemplate1'
  const Template = TEMPLATE_MAPPINGS[templateKey] || TEMPLATE_MAPPINGS.receiptTemplate1

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

  const handleTemplateModalSelect = ({ invoiceTemplate, receiptTemplate }) => {
    setPendingTemplate({ invoiceTemplate, receiptTemplate })
  }

  const handleApplyToThisReceipt = async () => {
    if (!pendingTemplate) return
    try {
      await customerData.updateReceiptTemplate(receipt.id, pendingTemplate.receiptTemplate)
      setReceipt(prev => ({ ...prev, template: pendingTemplate.receiptTemplate }))
      showToast?.('Template updated for this receipt ✓')
    } catch {
      showToast?.('Could not update template.')
    } finally {
      setPendingTemplate(null)
    }
  }

  const handleApplyAsDefault = () => {
    if (!pendingTemplate) return
    updateManyGeneralSettings({
      invoiceTemplate: pendingTemplate.invoiceTemplate,
      receiptTemplate: pendingTemplate.receiptTemplate,
    })
    onApplyDefaultTemplates?.(pendingTemplate)
    showToast?.('Default template updated ✓')
    setPendingTemplate(null)
  }

  const handleCancelScope = () => {
    setPendingTemplate(null)
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
            onClick: () => setShowTemplateModal(true),
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

      {showTemplateModal && (
        <TemplateModal
          isOpen={showTemplateModal}
          currentInvoiceTemplate={generalSettings.invoiceTemplate}
          currentReceiptTemplate={templateKey}
          colourId={colourId}
          lockToTab="receipt"
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleTemplateModalSelect}
        />
      )}

      {pendingTemplate && (
        <TemplateScopeSheet
          documentLabel="receipt"
          onApplyToThis={handleApplyToThisReceipt}
          onApplyToDefault={handleApplyAsDefault}
          onCancel={handleCancelScope}
        />
      )}

    </div>
  )
}