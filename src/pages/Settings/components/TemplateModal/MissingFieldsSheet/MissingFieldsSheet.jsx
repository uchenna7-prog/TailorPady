import { useCallback } from 'react'
import styles from './MissingFieldsSheet.module.css'

const FIELD_META = {
  logo:          { label: 'Business logo',    icon: 'image'         },
  name:          { label: 'Business name',    icon: 'badge'         },
  tagline:       { label: 'Tagline',          icon: 'format_quote'  },
  address:       { label: 'Business address', icon: 'location_on'   },
  phone:         { label: 'Phone number',     icon: 'phone'         },
  email:         { label: 'Email address',    icon: 'mail'          },
  website:       { label: 'Website',          icon: 'language'      },
  signature:     { label: 'Signature',        icon: 'draw'          },
  accountBank:   { label: 'Bank name',        icon: 'account_balance' },
  accountNumber: { label: 'Account number',   icon: 'pin'           },
  accountName:   { label: 'Account name',     icon: 'person'        },
  paymentTerms:  { label: 'Payment terms',    icon: 'gavel'         },
}

const INVOICE_SETTINGS_FIELDS = new Set([
  'accountBank',
  'accountNumber',
  'accountName',
  'paymentTerms',
])

function partitionMissingFields(missingFields) {
  const profileFields        = []
  const invoiceSettingsFields = []

  for (const key of missingFields) {
    if (INVOICE_SETTINGS_FIELDS.has(key)) {
      invoiceSettingsFields.push(key)
    } else {
      profileFields.push(key)
    }
  }

  return { profileFields, invoiceSettingsFields }
}

function FieldPill({ fieldKey }) {
  const meta = FIELD_META[fieldKey]
  return (
    <div className={styles.pill}>
      <span className={`mi ${styles.pillIcon}`}>{meta?.icon ?? 'circle'}</span>
      <span className={styles.pillLabel}>{meta?.label ?? fieldKey}</span>
    </div>
  )
}

function DestinationGroup({ icon, title, subtitle, fields, actionLabel, onAction }) {
  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <div className={styles.groupIconWrap}>
          <span className="mi">{icon}</span>
        </div>
        <div className={styles.groupMeta}>
          <p className={styles.groupTitle}>{title}</p>
          <p className={styles.groupSubtitle}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.pillList}>
        {fields.map(key => (
          <FieldPill key={key} fieldKey={key} />
        ))}
      </div>

      <button className={styles.groupAction} onClick={onAction}>
        {actionLabel}
        <span className="mi" style={{ fontSize: '0.9rem' }}>arrow_forward</span>
      </button>
    </div>
  )
}

export function MissingFieldsSheet({ missingFields, onClose, onGoToProfile, onGoToInvoiceSettings, onSkipAndSave }) {
  const { profileFields, invoiceSettingsFields } = partitionMissingFields(missingFields)

  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  const stopPropagation = useCallback((e) => {
    e.stopPropagation()
  }, [])

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.sheet} onClick={stopPropagation}>

        <div className={styles.handle} />

        <div className={styles.sheetHeader}>
          <div className={styles.warningIconWrap}>
            <span className="mi">checklist</span>
          </div>
          <div>
            <p className={styles.sheetTitle}>Complete your profile</p>
            <p className={styles.sheetSubtitle}>
              This template needs a few details to look its best. Fill them in below or save and come back later.
            </p>
          </div>
        </div>

        <div className={styles.groupList}>
          {profileFields.length > 0 && (
            <DestinationGroup
              icon="manage_accounts"
              title="Profile"
              subtitle="Your business identity and contact info"
              fields={profileFields}
              actionLabel="Go to Profile"
              onAction={onGoToProfile}
            />
          )}

          {invoiceSettingsFields.length > 0 && (
            <>
              {profileFields.length > 0 && <div className={styles.divider} />}
              <DestinationGroup
                icon="receipt_long"
                title="Invoice Settings"
                subtitle="Payment and bank account details"
                fields={invoiceSettingsFields}
                actionLabel="Go to Invoice Settings"
                onAction={onGoToInvoiceSettings}
              />
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.skipButton} onClick={onSkipAndSave}>
            Save anyway
          </button>
        </div>

      </div>
    </div>
  )
}