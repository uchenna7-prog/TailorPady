import { useRef, useState } from 'react'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { TEMPLATE_MAPPINGS } from '../Templates/datas/invoiceTemplateMappings'
import { buildInvoiceWhatsAppMessage } from './utils'
import { sharePDF, downloadPDF } from '../../utils/pdfUtils'
import { getBrandCSSVars } from '../../utils/cssVariablesUtils'
import { useInvoiceBrandSettings } from '../../hooks/useInvoiceBrandSettings'
import { getPaletteById } from '../../config/brandPalette'
import { TemplateModal } from '../TemplateModal/TemplateModal'
import { DesignOptionsSheet } from '../DesignOptionsSheet/DesignOptionsSheet'
import { BrandColourSheet } from '../BrandColourSheet/BrandColourSheet'
import { ApplyScopeSheet } from '../ApplyScopeSheet/ApplyScopeSheet'
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
  const { updateManyProfileSettings } = useProfileSettings()

  const INVOICE_BRAND_SETTINGS = useInvoiceBrandSettings()

  const paperRef = useRef(null)
  const [invoice, setInvoice] = useState(snapShotedInvoice)
  const [pdfLoading, setPdfLoading]     = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [showDesignSheet, setShowDesignSheet]     = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showColourSheet, setShowColourSheet]     = useState(false)
  const [pendingChange, setPendingChange]         = useState(null)

  const templateKey = invoice.template || generalSettings.invoiceTemplate || 'invoiceTemplate1'
  const Template = TEMPLATE_MAPPINGS[templateKey] || TEMPLATE_MAPPINGS.invoiceTemplate1

  const effectiveColourId = invoice.brandSnapshot?.colourId || colourId

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

  const handleTemplateSelect = ({ invoiceTemplate }) => {
    setPendingChange({ type: 'template', invoiceTemplate })
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
        await customerData.updateInvoiceTemplate(invoice.id, pendingChange.invoiceTemplate)
        setInvoice(prev => ({ ...prev, template: pendingChange.invoiceTemplate }))
        showToast?.('Template updated for this invoice ✓')
      } else {
        await customerData.updateInvoiceColour(invoice.id, pendingChange.colourId, pendingChange.colour)
        setInvoice(prev => ({
          ...prev,
          brandSnapshot: { ...prev.brandSnapshot, colourId: pendingChange.colourId, colour: pendingChange.colour },
        }))
        showToast?.('Colour updated for this invoice ✓')
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
      updateManyGeneralSettings({ invoiceTemplate: pendingChange.invoiceTemplate })
      onApplyDefaultTemplates?.({ invoiceTemplate: pendingChange.invoiceTemplate })
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
        title={invoice.number}
        onBackClick={onClose}
        customActions={[
          {
            icon:     'palette',
            onClick:  () => setShowDesignSheet(true),
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
          currentInvoiceTemplate={templateKey}
          currentReceiptTemplate={generalSettings.receiptTemplate}
          colourId={effectiveColourId}
          lockToTab="invoice"
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
          description={`Use this ${pendingChange.type} for just this invoice, or set it as the default for all future invoices?`}
          thisLabel="Just this invoice"
          onApplyToThis={handleApplyToThis}
          onApplyToDefault={handleApplyAsDefault}
          onCancel={handleCancelScope}
        />
      )}

    </div>
  )
}