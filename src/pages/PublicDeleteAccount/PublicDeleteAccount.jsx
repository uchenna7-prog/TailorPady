import PublicPageLayout from '../LandingPage/components/PublicPageLayout/PublicPageLayout'
import LegalSections from '../LandingPage/components/LegalSections/LegalSections'
import {
  DELETE_ACCOUNT_SECTIONS,
  DELETE_ACCOUNT_LAST_UPDATED,
} from '../../datas/legalDatas'

export default function PublicDeleteAccount() {
  return (
    <PublicPageLayout
      title="Delete Your Account"
      subtitle="How to delete your TailorPady account and data, whether or not you have the app installed."
      revision={`Last revised ${DELETE_ACCOUNT_LAST_UPDATED}`}
      navProps={{ showThemeToggle: false, showInstall: false }}
    >
      <LegalSections
        sections={DELETE_ACCOUNT_SECTIONS}
      />
    </PublicPageLayout>
  )
}
