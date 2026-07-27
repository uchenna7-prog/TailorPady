import PublicPageLayout from '../LandingPage/components/PublicPageLayout/PublicPageLayout'
import LegalSections from '../LandingPage/components/LegalSections/LegalSections'
import {
  PRIVACY_SECTIONS,
  PRIVACY_LAST_UPDATED,
} from '../../datas/legalDatas'

export default function PublicPrivacy() {
  return (
    <PublicPageLayout
      title="Privacy Policy"
      revision={`Last revised ${PRIVACY_LAST_UPDATED}`}
      navProps={{ showThemeToggle: false, showInstall: false }}
    >
      <LegalSections
        sections={PRIVACY_SECTIONS}
      />
    </PublicPageLayout>
  )
}