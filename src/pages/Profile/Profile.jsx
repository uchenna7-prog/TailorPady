import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProfileSettings } from '../../contexts/ProfileSettingsContext'
import { useGeneralSettings } from '../../contexts/GeneralSettingsContext'
import { useAuth } from '../../contexts/AuthContext'
import { getPersonalInfosFromFirestore } from '../../services/profileService'
import { getPaletteById, DEFAULT_COLOUR_ID } from '../../config/brandPalette'
import { SOCIAL_PLATFORMS } from './datas'
import { SocialIcon } from './component/SocialIcon/SocialIcon'
import { SectionHeader } from './component/SectionHeader/SectionHeader'
import { TappableRow } from './component/TappableRow/TappableRow'
import { PlanBadge } from './component/PlanBadge/PlanBadge'
import { InfoRow } from './component/InfoRow/InfoRow'
import { Avatar } from './component/Avatar/Avatar'
import { PersonalInfoModal } from './component/PersonalInfoModal/PersonalInfoModal'
import { BrandModal } from './component/BrandModal/BrandModal'
import { BusinessContactModal } from './component/BusinessContactModal/BusinessContactModal'
import { SocialsModal } from './component/SocialsModal/SocialsModal'
import { ChangePasswordModal } from './component/ChangePasswordModal/ChangePasswordModal'
import { ChangeEmailModal } from './component/ChangeEmailModal/ChangeEmailModal'
import { ConnectedAccountsModal } from './component/ConnectedAccountsModal/ConnectedAccountsModal'
import UpgradeModal from './component/UpgradeModal/UpgradeModal'
import BillingHistoryModal from './component/BillingHistoryModal/BillingHistoryModal'
import { getOrSetJoinDate, loadPersonalInfo, savePersonalInfoLocally } from './utils'
import BottomNav from '../../components/BottomNav/BottomNav'
import Header from '../../components/Header/Header'
import Toast from '../../components/Toast/Toast'
import ConfirmSheet from '../../components/ConfirmSheet/ConfirmSheet'
import styles from './Profile.module.css'
import { db } from '../../firebase'


export default function Profile({ onMenuClick, isPremium = false, onUpgrade = () => {} }) {

  const { profileSettings } = useProfileSettings()
  const { updateManyGeneralSettings } = useGeneralSettings()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [personalInfo,  setPersonalInfo]  = useState(() => loadPersonalInfo(user))
  const [activeModal,   setActiveModal]   = useState(null)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [toastMsg,      setToastMsg]      = useState('')
  const [pendingTemplate, setPendingTemplate] = useState(null)
  const [returnTo, setReturnTo] = useState(null)
  const toastTimer = useRef(null)

  const joinDate = getOrSetJoinDate()

  useEffect(() => {
    if (!user?.uid) return
    getPersonalInfosFromFirestore(db, user.uid).then(data => {
      if (!data) return
      const merged = {
        fullName:   data.personalFullName   || personalInfo.fullName   || '',
        email:      data.personalEmail      || personalInfo.email      || user?.email || '',
        phone:      data.personalPhone      || personalInfo.phone      || '',
        city:       data.personalCity       || personalInfo.city       || '',
        country:    data.personalCountry    || personalInfo.country    || '',
        sex:        data.personalSex        || personalInfo.sex        || '',
        birthMonth: data.personalBirthMonth || personalInfo.birthMonth || '',
        birthDay:   data.personalBirthDay   || personalInfo.birthDay   || '',
      }
      setPersonalInfo(merged)
      savePersonalInfoLocally(merged)
    }).catch()
  }, [user?.uid])

  useEffect(() => {
    const navState = location.state
    if (!navState?.autoOpenModal) return

    if (navState.autoOpenModal === 'brand' || navState.autoOpenModal === 'businessContact') {
      setActiveModal(navState.autoOpenModal)
    }

    if (navState.pendingTemplate) {
      setPendingTemplate(navState.pendingTemplate)
    }

    if (navState.returnTo) {
      setReturnTo(navState.returnTo)
    }

    navigate(location.pathname, { replace: true, state: null })
  }, [location.state])

  const showToast = useCallback(msg => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400)
  }, [])

  const applyPendingTemplateIfAny = useCallback((extraMessage) => {
    if (!pendingTemplate) {
      if (extraMessage) showToast(extraMessage)
      return
    }
    updateManyGeneralSettings({
      invoiceTemplate: pendingTemplate.invoiceTemplate,
      receiptTemplate: pendingTemplate.receiptTemplate,
    })
    setPendingTemplate(null)
    showToast(extraMessage ? `${extraMessage} · Template applied ✓` : 'Template applied ✓')
  }, [pendingTemplate, updateManyGeneralSettings, showToast])

  const returnToOriginIfAny = useCallback(() => {
    if (!returnTo) return
    navigate(`/customers/${returnTo.customerId}`, {
      state: {
        reopenInvoiceId:      returnTo.invoiceId      ?? null,
        reopenReceiptId:      returnTo.receiptId      ?? null,
        reopenMissingFields:  returnTo.reopenMissingFields ?? false,
        completedModal:       returnTo.completedModal  ?? null,
        completedFields:      returnTo.completedFields ?? [],
      },
    })
    setReturnTo(null)
  }, [returnTo, navigate])

  const handleBrandModalBack = useCallback(() => {
    setActiveModal(null)
    applyPendingTemplateIfAny('Brand info saved')
    returnToOriginIfAny()
  }, [applyPendingTemplateIfAny, returnToOriginIfAny])

  const handleBusinessContactModalBack = useCallback(() => {
    setActiveModal(null)
    applyPendingTemplateIfAny('Business contact saved')
    returnToOriginIfAny()
  }, [applyPendingTemplateIfAny, returnToOriginIfAny])

  const handleLogout = async () => {
    setLogoutConfirm(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const handleDeleteAccount = async () => {
    setDeleteConfirm(false)
    try {
      await user.delete()
      navigate('/login', { replace: true })
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        showToast('Please log out and log in again to delete your account')
      } else {
        showToast('Could not delete account — please try again')
      }
    }
  }

  const hasBrand           = !!(profileSettings.brandName || profileSettings.brandLogo)
  const hasBusinessContact = !!(profileSettings.brandPhone || profileSettings.brandEmail || profileSettings.brandAddress)

  const brandColourHex = getPaletteById(profileSettings.brandColourId)?.tokens.primary
    || getPaletteById(DEFAULT_COLOUR_ID)?.tokens.primary
    || null

  const isGoogleUser = user?.providerData?.some(p => p.providerId === 'google.com')

  return (
    <div className={styles.page}>

      <Header title="Account" onMenuClick={onMenuClick} />

      <div className={styles.scrollArea}>

        <div className={styles.heroCard}>
          <div className={styles.heroCardGlow} />
          <div className={styles.heroTop}>
            <Avatar
              name={personalInfo.fullName || profileSettings.brandName}
              logo={profileSettings.brandLogo}
              size={72}
            />
            <div className={styles.heroInfo}>
              <div className={styles.heroName}>{personalInfo.fullName || 'Your Name'}</div>
              {(personalInfo.city || personalInfo.country) && (
                <div className={styles.heroLocation}>
                  <span className="mi" style={{ fontSize: '0.75rem' }}>location_on</span>
                  {[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}
                </div>
              )}
              <PlanBadge isPremium={isPremium} />
            </div>
          </div>
          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              <span className="mi" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>calendar_today</span>
              <span className={styles.heroMetaLabel}>Joined {joinDate}</span>
            </div>
            {(personalInfo.email || user?.email) && (
              <div className={styles.heroMetaItem}>
                <span className="mi" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>mail</span>
                <span className={styles.heroMetaLabel}>{personalInfo.email || user?.email}</span>
              </div>
            )}
          </div>
        </div>

        <SectionHeader icon="person" label="Personal Info" />

        <InfoRow icon="badge"  label="Full Name" value={personalInfo.fullName}             placeholder="Not set" />
        <InfoRow icon="mail"   label="Email"     value={personalInfo.email || user?.email} placeholder="Not set" />
        <InfoRow icon="call"   label="Phone"     value={personalInfo.phone}                placeholder="Not set" />
        <InfoRow
          icon="public"
          label="Location"
          value={[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}
          placeholder="Not set"
        />
        {personalInfo.sex && (
          <InfoRow icon="person_outline" label="Sex" value={personalInfo.sex} placeholder="Not set" />
        )}
        {(personalInfo.birthMonth && personalInfo.birthDay) && (
          <InfoRow icon="cake" label="Birthday" value={`${personalInfo.birthDay} ${personalInfo.birthMonth}`} placeholder="Not set" />
        )}
        <TappableRow icon="edit" label="Edit Personal Info" onClick={() => setActiveModal('personalInfo')} divider={false} />

        <SectionHeader icon="storefront" label="Brand Identity" />

        {hasBrand ? (
          <div className={`${styles.row} ${styles.brandPreview}`}>
            {profileSettings.brandLogo && (
              <img src={profileSettings.brandLogo} alt="Brand logo" className={styles.brandPreviewLogo} />
            )}
            <div className={styles.brandPreviewInfo}>
              <div className={styles.brandPreviewName}>{profileSettings.brandName || '—'}</div>
              {profileSettings.brandTagline && (
                <div className={styles.brandPreviewTagline}>{profileSettings.brandTagline}</div>
              )}
            </div>
            {brandColourHex && (
              <div className={styles.brandColourDot} style={{ background: brandColourHex }} />
            )}
          </div>
        ) : (
          <div className={`${styles.row} ${styles.brandEmpty}`}>
            <span className="mi" style={{ fontSize: '1.5rem', color: 'var(--text3)' }}>storefront</span>
            <span className={styles.brandEmptyText}>No brand set up yet</span>
          </div>
        )}

        <InfoRow icon="store"        label="Brand Name" value={profileSettings.brandName}    placeholder="Not set" />
        <InfoRow icon="format_quote" label="Tagline"    value={profileSettings.brandTagline} placeholder="Not set" />

        {profileSettings.brandSignature && (
          <div className={styles.row}>
            <div className={styles.rowIcon}>
              <span className="mi" style={{ fontSize: '1.15rem' }}>draw</span>
            </div>
            <div className={styles.rowText}>
              <div className={styles.rowLabel}>Signature</div>
              <img src={profileSettings.brandSignature} alt="Signature" className={styles.sigPreview} />
            </div>
          </div>
        )}

        <TappableRow
          icon="edit"
          label="Edit Brand Identity"
          sub="Logo, colours, tagline, signature"
          onClick={() => setActiveModal('brand')}
          divider={false}
        />

        <SectionHeader icon="contact_phone" label="Business Contact" />

        {hasBusinessContact ? (
          <>
            {profileSettings.brandPhone && (
              <InfoRow icon="call"        label="Business Phone" value={profileSettings.brandPhone}   placeholder="Not set" />
            )}
            {profileSettings.brandEmail && (
              <InfoRow icon="mail"        label="Business Email" value={profileSettings.brandEmail}   placeholder="Not set" />
            )}
            {profileSettings.brandAddress && (
              <InfoRow icon="location_on" label="Address"        value={profileSettings.brandAddress} placeholder="Not set" />
            )}
          </>
        ) : (
          <div className={`${styles.row} ${styles.brandEmpty}`}>
            <span className="mi" style={{ fontSize: '1.5rem', color: 'var(--text3)' }}>contact_phone</span>
            <span className={styles.brandEmptyText}>No business contact set yet</span>
          </div>
        )}

        <TappableRow
          icon="edit"
          label="Edit Business Contact"
          sub="Phone, email, address, website used on invoices"
          onClick={() => setActiveModal('businessContact')}
          divider={false}
        />

        <SectionHeader icon="share" label="Social Media" />

        {profileSettings.brandSocials?.length > 0 ? (
          <div className={styles.socialsPreview}>
            {profileSettings.brandSocials.map(s => {
              const p = SOCIAL_PLATFORMS.find(pl => pl.id === s.platform)
              return p ? (
                <div key={s.platform} className={styles.socialPreviewChip}>
                  <SocialIcon platformId={s.platform} size={14} />
                  <span className={styles.socialPreviewLabel}>@{s.handle}</span>
                </div>
              ) : null
            })}
          </div>
        ) : (
          <div className={`${styles.row} ${styles.brandEmpty}`}>
            <span className="mi" style={{ fontSize: '1.5rem', color: 'var(--text3)' }}>share</span>
            <span className={styles.brandEmptyText}>No social links yet</span>
          </div>
        )}

        <TappableRow
          icon="edit"
          label="Edit Social Links"
          sub="Instagram, TikTok, Facebook and more"
          onClick={() => setActiveModal('socials')}
          divider={false}
        />

        <SectionHeader icon="workspace_premium" label="My Plan" />

        <div className={styles.row}>
          <div className={styles.planLeft}>
            <div className={styles.planName}>{isPremium ? 'TailorPady Pro' : 'Free Plan'}</div>
            <div className={styles.planSub}>
              {isPremium
                ? 'All features unlocked — invoice customisation, branded PDFs & more'
                : 'Basic features only. Upgrade to unlock brand customisation.'}
            </div>
          </div>
          <PlanBadge isPremium={isPremium} />
        </div>

        {!isPremium && (
          <div className={`${styles.row} ${styles.upgradeStrip}`} onClick={() => setActiveModal('upgrade')}>
            <div className={styles.upgradeStripGlow} />
            <span className="mi" style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>workspace_premium</span>
            <div className={styles.upgradeStripText}>
              <div className={styles.upgradeStripTitle}>Upgrade to Pro</div>
              <div className={styles.upgradeStripSub}>Branded invoices and receipts PDFs, unlimited uploads & a portfolio that works for you 24/7</div>
            </div>
            <span className="mi" style={{ fontSize: '1rem', color: 'var(--accent)' }}>chevron_right</span>
          </div>
        )}

        <TappableRow
          icon="payments"
          label="Billing History"
          sub="See past payments, plan renewals & expiry dates"
          onClick={() => setActiveModal('billing')}
          divider={false}
        />

        <SectionHeader icon="security" label="Security" />

        <TappableRow
          icon="lock"
          label="Change Password"
          sub="Update your account password"
          onClick={() => setActiveModal('changePassword')}
          disabled={isGoogleUser && !user?.providerData?.some(p => p.providerId === 'password')}
        />

        <TappableRow
          icon="alternate_email"
          label="Change Email"
          sub={`Current: ${user?.email ?? '—'}`}
          onClick={() => setActiveModal('changeEmail')}
        />

        <TappableRow
          icon="link"
          label="Connected Accounts"
          sub={isGoogleUser ? 'Google connected' : 'No third-party accounts linked'}
          onClick={() => setActiveModal('connectedAccounts')}
          divider={false}
        />

        <SectionHeader icon="warning" label="Danger Zone" />

        <TappableRow
          icon="logout"
          label="Log Out"
          sub="You can always log back in"
          onClick={() => setLogoutConfirm(true)}
          danger
        />

        <TappableRow
          icon="delete_forever"
          label="Delete Account"
          sub="Permanently remove your account and all data"
          onClick={() => setDeleteConfirm(true)}
          divider={false}
          danger
        />

        <div style={{ height: 40 }} />

      </div>


      {activeModal === 'personalInfo' && (
        <PersonalInfoModal
          personalInfo={personalInfo}
          authUser={user}
          onBack={() => setActiveModal(null)}
          onSave={data => { setPersonalInfo(data); showToast('Personal info saved') }}
        />
      )}

      {activeModal === 'brand' && (
        <BrandModal
          onBack={handleBrandModalBack}
          showToast={showToast}
        />
      )}

      {activeModal === 'businessContact' && (
        <BusinessContactModal
          onBack={handleBusinessContactModalBack}
          showToast={showToast}
        />
      )}

      {activeModal === 'socials' && (
        <SocialsModal onBack={() => setActiveModal(null)} showToast={showToast} />
      )}

      {activeModal === 'upgrade' && (
        <UpgradeModal
          onClose={() => setActiveModal(null)}
          onUpgrade={billingCycle => { setActiveModal(null); onUpgrade(billingCycle) }}
        />
      )}

      {activeModal === 'billing' && (
        <BillingHistoryModal onClose={() => setActiveModal(null)} isPremium={isPremium} />
      )}

      {activeModal === 'changePassword' && (
        <ChangePasswordModal onBack={() => setActiveModal(null)} showToast={showToast} />
      )}

      {activeModal === 'changeEmail' && (
        <ChangeEmailModal onBack={() => setActiveModal(null)} showToast={showToast} />
      )}

      {activeModal === 'connectedAccounts' && (
        <ConnectedAccountsModal onBack={() => setActiveModal(null)} showToast={showToast} />
      )}

      <ConfirmSheet
        open={logoutConfirm}
        title="Log Out?"
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirm(false)}
      />

      <ConfirmSheet
        open={deleteConfirm}
        title="Delete Account?"
        message="This will permanently delete your account and all your data. This cannot be undone."
        confirmLabel="Delete"
        confirmDanger
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteConfirm(false)}
      />

      <Toast message={toastMsg} />
      <BottomNav />

    </div>
  )
}