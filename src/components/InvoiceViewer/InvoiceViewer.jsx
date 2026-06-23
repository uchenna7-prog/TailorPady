import { useRef, useState, useEffect } from 'react'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { TEMPLATE_MAPPINGS } from '../Templates/datas/invoiceTemplateMappings'
import { buildInvoiceWhatsAppMessage } from './utils'
import { sharePDF, downloadPDF } from '../../utils/pdfUtils'
import { getBrandCSSVars } from '../../utils/cssVariablesUtils'
import { useInvoiceBrandSettings } from '../../hooks/useInvoiceBrandSettings'
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
import styles from './InvoiceViewer.module.css'


const STATUS_LABELS = {
  unpaid: 'Unpaid',
  part_paid: 'Part Payment',
  paid: 'Full Payment',
  overdue: 'Overdue',
}

const COMPLETED_TOAST_LABELS = {
  brand: 'Brand details added ✓',
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
  reopenMissingFields = false,
  completedModal = null,
  completedFields = [],
  onReopenMissingFieldsHandled,
}) {

  const { generalSettings, updateManyGeneralSettings } = useGeneralSettings()
  const { profileSettings, updateManyProfileSettings } = useProfileSettings()

  const INVOICE_BRAND_SETTINGS = useInvoiceBrandSettings()

  const paperRef = useRef(null)
  const [invoice, setInvoice] = useState(snapShotedInvoice)
  const [pdfLoading, setPdfLoading]         = useState(false)
  const [shareLoading, setShareLoading]     = useState(false)
  const [showDesignSheet, setShowDesignSheet]     = useState(false)
  const [showShareSheet, setShowShareSheet]       = useState(false)
  const [showMoreSheet, setShowMoreSheet]         = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showColourSheet, setShowColourSheet]     = useState(false)
  const [pendingChange, setPendingChange]         = useState(null)
  const [missingFields, setMissingFields]         = useState(null)
  const [pendingActionLabel, setPendingActionLabel] = useState(null)
  const [pendingActionFn, setPendingActionFn]       = useState(null)
  const [activeCompletedModal, setActiveCompletedModal] = useState(null)

  const templateKey = invoice.template || generalSettings.invoiceTemplate || 'invoiceTemplate1'
  const Template = TEMPLATE_MAPPINGS[templateKey] || TEMPLATE_MAPPINGS.invoiceTemplate1

  const effectiveColourId = invoice.brandSnapshot?.colourId || colourId

  const snapShotedInvoiceBrandSettings = buildSnapshotedBrandSettings(
    INVOICE_BRAND_SETTINGS,
    invoice.brandSnapshot
  )

  const brandCSSVars = getBrandCSSVars(snapShotedInvoiceBrandSettings.colour)
  const filename = `Invoice-${invoice.number}-${customer.name.replace(/\s+/g, '_')}.pdf`

  const returnTo = {
    customerId: customer.id,
    invoiceId: invoice.id,
  }

  useEffect(() => {
    if (!reopenMissingFields) return
    const requires = getRequiresForDoc('invoice', templateKey, null)
    const missing  = getMissingFields(requires, profileSettings)
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
    const requires = getRequiresForDoc('invoice', templateKey, null)
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

  const handleDownload = () => checkMissingThen('download', executeDownload)
  const handleShare    = () => checkMissingThen('share', executeShare)

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

  const handleApplyAsDefault = async () => {
    if (!pendingChange) return
    try {
      if (pendingChange.type === 'template') {
        await customerData.updateInvoiceTemplate(invoice.id, pendingChange.invoiceTemplate)
        setInvoice(prev => ({ ...prev, template: pendingChange.invoiceTemplate }))
        updateManyGeneralSettings({ invoiceTemplate: pendingChange.invoiceTemplate })
        onApplyDefaultTemplates?.({ invoiceTemplate: pendingChange.invoiceTemplate })
        showToast?.('Template updated here and set as default ✓')
      } else {
        await customerData.updateInvoiceColour(invoice.id, pendingChange.colourId, pendingChange.colour)
        setInvoice(prev => ({
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

  return (
    <div className={styles.overlay}>
      <Header
        type="back"
        title={invoice.number}
        onBackClick={onClose}
        customActions={[
          {
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

      {showShareSheet && (
        <ShareOptionsSheet
          docType="invoice"
          onClose={() => setShowShareSheet(false)}
          onShare={handleShare}
          onDownload={handleDownload}
        />
      )}

      {showMoreSheet && (
        <MoreOptionsSheet
          docType="invoice"
          onClose={() => setShowMoreSheet(false)}
          onDelete={() => onDelete(invoice.id)}
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
          description={
            pendingChange.type === 'colour'
              ? 'Apply to this invoice only, or apply here and make it your default going forward?'
              : 'Apply to this invoice only, or apply here and make it your default going forward?'
          }
          thisLabel="This invoice only"
          defaultLabel="This invoice + set as default"
          onApplyToThis={handleApplyToThis}
          onApplyToDefault={handleApplyAsDefault}
          onCancel={handleCancelScope}
        />
      )}

      {missingFields !== null && missingFields.length > 0 && (
        <MissingFieldsSheet
          missingFields={missingFields}
          docType="invoice"
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