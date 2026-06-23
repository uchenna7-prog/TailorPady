import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MissingFieldsSheet.module.css'

const FIELD_META = {
  logo:          { label: 'Business logo',    icon: 'image'           },
  name:          { label: 'Business name',    icon: 'badge'           },
  tagline:       { label: 'Tagline',          icon: 'format_quote'    },
  address:       { label: 'Business address', icon: 'location_on'     },
  phone:         { label: 'Phone number',     icon: 'phone'           },
  email:         { label: 'Email address',    icon: 'mail'            },
  website:       { label: 'Website',          icon: 'language'        },
  signature:     { label: 'Signature',        icon: 'draw'            },
  accountBank:   { label: 'Bank name',        icon: 'account_balance' },
  accountNumber: { label: 'Account number',   icon: 'pin'             },
  accountName:   { label: 'Account name',     icon: 'person'          },
  paymentTerms:  { label: 'Payment terms',    icon: 'gavel'           },
}

const DESTINATIONS = {
  brand: {
    icon: 'storefront',
    title: 'Brand Identity',
    actionLabel: 'Add brand details',
    fieldKeys: ['logo', 'name', 'tagline', 'signature'],
    route: '/profile',
    modal: 'brand',
  },
  contact: {
    icon: 'contact_phone',
    title: 'Business Contact',
    actionLabel: 'Add contact details',
    fieldKeys: ['phone', 'email', 'address', 'website'],
    route: '/profile',
    modal: 'businessContact',
  },
  invoice: {
    icon: 'receipt_long',
    title: 'Invoice Settings',
    actionLabel: 'Add invoice details',
    fieldKeys: ['accountBank', 'accountNumber', 'accountName', 'paymentTerms'],
    route: '/settings',
    modal: 'invoiceSettings',
    invoiceOnly: true,
  },
}

function buildGroups(missingFields, docType) {
  const missingSet = new Set(missingFields)
  const groups = []

  for (const key of missingFields) {
    for (const [groupKey, destination] of Object.entries(DESTINATIONS)) {
      if (destination.invoiceOnly && docType === 'receipt') continue
      if (!destination.fieldKeys.includes(key)) continue
      if (groups.some(g => g.key === groupKey)) continue
      const fields = destination.fieldKeys.filter(f => missingSet.has(f))
      groups.push({ key: groupKey, fields, ...destination })
    }
  }

  return groups
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

function GroupCard({ icon, title, fields, actionLabel, onAction }) {
  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <div className={styles.groupIconWrap}>
          <span className="mi">{icon}</span>
        </div>
        <p className={styles.groupTitle}>{title}</p>
        <span className={styles.groupCount}>{fields.length}</span>
      </div>

      <div className={styles.pillList}>
        {fields.map(key => (
          <FieldPill key={key} fieldKey={key} />
        ))}
      </div>

      <button className={styles.groupAction} onClick={onAction}>
        <span>{actionLabel}</span>
        <span className={`mi ${styles.groupActionIcon}`}>arrow_forward</span>
      </button>
    </div>
  )
}

export function MissingFieldsSheet({
  missingFields,
  docType,
  pendingAction,
  onClose,
  onSkipAndSave,
  pendingTemplate,
  returnTo,
}) {
  const navigate  = useNavigate()
  const scrollRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  const docLabel = docType === 'receipt' ? 'receipt' : 'invoice'

  const skipLabel = pendingAction === 'download'
    ? `Download ${docLabel} without these details`
    : pendingAction === 'share'
    ? `Share ${docLabel} without these details`
    : `Save ${docLabel} without these details`

  const groups = useMemo(() => buildGroups(missingFields, docType), [missingFields, docType])

  const stopPropagation = useCallback(e => e.stopPropagation(), [])

  const goToDestination = useCallback((route, modal) => {
    onClose()
    navigate(route, { state: { autoOpenModal: modal, pendingTemplate, returnTo } })
  }, [onClose, navigate, pendingTemplate, returnTo])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => setScrolled(el.scrollTop > 4)
    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  const sectionWord = groups.length === 1 ? 'section' : 'sections'

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={stopPropagation}>

        <div className={`${styles.sheetTop} ${scrolled ? styles.sheetTopScrolled : ''}`}>
          <div className={styles.handle} />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <span className="mi">close</span>
          </button>

          <div className={styles.progressRow}>
            <div className={styles.progressDots}>
              {groups.map(group => (
                <span key={group.key} className={styles.progressDot} />
              ))}
            </div>
            <span className={styles.progressLabel}>
              {groups.length} {sectionWord} to complete
            </span>
          </div>
        </div>

        <div className={styles.scrollBody} ref={scrollRef}>
          <div className={styles.titleBlock}>
            <p className={styles.sheetTitle}>A few things are missing</p>
            <p className={styles.sheetSubtitle}>
              This template looks best with your business details filled in.
              Add them now, or save the {docLabel} and finish later.
            </p>
          </div>

          <div className={styles.groupList}>
            {groups.map(group => (
              <GroupCard
                key={group.key}
                icon={group.icon}
                title={group.title}
                fields={group.fields}
                actionLabel={group.actionLabel}
                onAction={() => goToDestination(group.route, group.modal)}
              />
            ))}
          </div>
        </div>

        <div className={styles.sheetFooter}>
          <button className={styles.skipBtn} onClick={onSkipAndSave}>
            {skipLabel}
          </button>
        </div>

      </div>
    </div>
  )
}
