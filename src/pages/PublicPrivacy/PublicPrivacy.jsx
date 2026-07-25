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
      subtitle={`Last updated: ${PRIVACY_LAST_UPDATED}`}
    >
      <LegalSections
        sections={PRIVACY_SECTIONS}
      />
    </PublicPageLayout>
  )
}