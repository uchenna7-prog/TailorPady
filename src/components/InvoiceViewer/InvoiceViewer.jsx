import { useRef, useState } from 'react'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { TEMPLATE_MAPPINGS } from '../Templates/datas/invoiceTemplateMappings'
import { buildInvoiceWhatsAppMessage, } from './utils'
import { sharePDF, downloadPDF } from '../../utils/pdfUtils'
import { getBrandCSSVars } from '../../utils/cssVariablesUtils'
import { useInvoiceBrandSettings } from '../../hooks/useInvoiceBrandSettings'
import { TemplateModal } from '../TemplateModal/TemplateModal'
import { TemplateScopeSheet } from '../TemplateScopeSheet/TemplateScopeSheet'
import Header from '../Header/Header'
import styles from './InvoiceViewer.module.css'


const STATUS_LABELS = {
  unpaid: 'Unpaid',
  part_paid: 'Part Payment',
  paid: 'Full Payment',
  overdue: 'Overdue',
}

function normalizeCurrency(currency) {
  if (typeof currency === 'object' && currency !== null) {
    return currency.symbol || '₦'
  }
  return currency || '₦'
}

function buildSnapshotedBrandSettings(invoiceBrandSettings, brandSnapshot) {
  const merged = brandSnapshot
    ? {
        ...invoiceBrandSettings,
        ...Object.fromEntries(
          Object.entries(brandSnapshot).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        ),
      }
    : invoiceBrandSettings

  return {
    ...merged,
    currency: normalizeCurrency(merged.currency),
  }
}

export default function InvoiceViewer({
  invoice: snapShotedInvoice,
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

  const INVOICE_BRAND_SETTINGS = useInvoiceBrandSettings()

  const paperRef = useRef(null)
  const [invoice, setInvoice] = useState(snapShotedInvoice)
  const [pdfLoading, setPdfLoading]   = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [pendingTemplate, setPendingTemplate]      = useState(null)

  const templateKey = invoice.template || generalSettings.invoiceTemplate || 'invoiceTemplate1'
  const Template = TEMPLATE_MAPPINGS[templateKey] || TEMPLATE_MAPPINGS.invoiceTemplate1

  const snapShotedInvoiceBrandSettings = buildSnapshotedBrandSettings(
    INVOICE_BRAND_SETTINGS,
    invoice.brandSnapshot
  )

  const brandCSSVars = getBrandCSSVars(snapShotedInvoiceBrandSettings.colour)
  const filename = `Invoice-${invoice.number}-${customer.name.replace(/\s+/g, '_')}.pdf`

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
      const message = buildInvoiceWhatsAppMessage(invoice, customer, snapShotedInvoiceBrandSettings)
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

  const handleApplyToThisInvoice = async () => {
    if (!pendingTemplate) return
    try {
      await customerData.updateInvoiceTemplate(invoice.id, pendingTemplate.invoiceTemplate)
      setInvoice(prev => ({ ...prev, template: pendingTemplate.invoiceTemplate }))
      showToast?.('Template updated for this invoice ✓')
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
        title={invoice.number}
        onBackClick={onClose}
        customActions={[
          {
            icon:     'palette',
            onClick:  () => setShowTemplateModal(true),
          },
          {
            icon:     pdfLoading ? 'hourglass_top' : 'download',
            onClick:  handleDownload,
            disabled: pdfLoading,
          },
          {
            icon:     shareLoading ? 'hourglass_top' : 'share',
            onClick:  handleShare,
            disabled: shareLoading,
          },
          {
            icon:    'delete',
            onClick: () => onDelete(invoice.id),
            outlined: true,
            color: 'var(--danger)',
          },
        ]}
      />

      <div className={styles.scrollArea}>

        <div className={styles.statusRow}>
          <div className={`${styles.statusBadge} ${styles[`status_${invoice.status}`]}`}>
            {STATUS_LABELS[invoice.status] || invoice.status}
          </div>
        </div>

        <div className={styles.paperWrap}>
          <div ref={paperRef} className={styles.paperInner} style={brandCSSVars}>
            <Template invoice={invoice} customer={customer} invoiceBrandSettings={snapShotedInvoiceBrandSettings} />
          </div>
        </div>

      </div>

      {showTemplateModal && (
        <TemplateModal
          isOpen={showTemplateModal}
          currentInvoiceTemplate={templateKey}
          currentReceiptTemplate={generalSettings.receiptTemplate}
          colourId={colourId}
          lockToTab="invoice"
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleTemplateModalSelect}
        />
      )}

      {pendingTemplate && (
        <TemplateScopeSheet
          documentLabel="invoice"
          onApplyToThis={handleApplyToThisInvoice}
          onApplyToDefault={handleApplyAsDefault}
          onCancel={handleCancelScope}
        />
      )}

    </div>
  )
}