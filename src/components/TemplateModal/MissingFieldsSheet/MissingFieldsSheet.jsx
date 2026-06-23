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
    completedLabel: 'Brand details added',
    fieldKeys: ['logo', 'name', 'tagline', 'signature'],
    route: '/profile',
    modal: 'brand',
  },
  contact: {
    icon: 'contact_phone',
    title: 'Business Contact',
    actionLabel: 'Add contact details',
    completedLabel: 'Business contact added',
    fieldKeys: ['phone', 'email', 'address', 'website'],
    route: '/profile',
    modal: 'businessContact',
  },
  invoice: {
    icon: 'receipt_long',
    title: 'Invoice Settings',
    actionLabel: 'Add invoice details',
    completedLabel: 'Invoice details added',
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

function getCompletedLabel(completedModal) {
  const entry = Object.values(DESTINATIONS).find(d => d.modal === completedModal)
  return entry?.completedLabel ?? null
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

function CompletedBanner({ label }) {
  return (
    <div className={styles.completedBanner}>
      <span className={`mi ${styles.completedBannerIcon}`}>check_circle</span>
      <span className={styles.completedBannerLabel}>{label} ✓</span>
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
  completedModal,
}) {
  const navigate  = useNavigate()
  const scrollRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [canScrollMore, setCanScrollMore] = useState(false)

  const completedLabel = useMemo(() => getCompletedLabel(completedModal), [completedModal])
  const [showCompletedBanner, setShowCompletedBanner] = useState(!!completedLabel)

  useEffect(() => {
    if (!completedLabel) return
    setShowCompletedBanner(true)
    const timer = setTimeout(() => setShowCompletedBanner(false), 2400)
    return () => clearTimeout(timer)
  }, [completedLabel])

  const docLabel = docType === 'receipt' ? 'receipt' : 'invoice'

  const skipLabel = pendingAction === 'download'
    ? `Download ${docLabel} without these details`
    : pendingAction === 'share'
    ? `Share ${docLabel} without these details`
    : `Save ${docLabel} without these details`

  const groups = useMemo(() => buildGroups(missingFields, docType), [missingFields, docType])

  const stopPropagation = useCallback(e => e.stopPropagation(), [])

  const goToDestination = useCallback((route, modal, pendingFields) => {
    onClose()
    navigate(route, {
      state: {
        autoOpenModal: modal,
        pendingTemplate,
        returnTo: { ...returnTo, reopenMissingFields: true, completedModal: modal, completedFields: pendingFields },
      },
    })
  }, [onClose, navigate, pendingTemplate, returnTo])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = () => {
      setScrolled(el.scrollTop > 4)
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
      setCanScrollMore(remaining > 8)
    }

    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })

    const resizeObserver = new ResizeObserver(handleScroll)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
    }
  }, [groups.length, showCompletedBanner])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
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

          {showCompletedBanner && completedLabel && (
            <CompletedBanner label={completedLabel} />
          )}

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
                onAction={() => goToDestination(group.route, group.modal, group.fields)}
              />
            ))}
          </div>
        </div>

        {canScrollMore && (
          <button
            className={styles.scrollMoreBtn}
            onClick={scrollToBottom}
            aria-label="Scroll down for more"
          >
            <span className="mi">keyboard_arrow_down</span>
          </button>
        )}

        <div className={styles.sheetFooter}>
          <button className={styles.skipBtn} onClick={onSkipAndSave}>
            {skipLabel}
          </button>
        </div>

      </div>
    </div>
  )
}