import PublicPageLayout from '../LandingPage/components/PublicPageLayout/PublicPageLayout'
import LegalSections from '../LandingPage/components/LegalSections/LegalSections'
import {
  TERMS_SECTIONS,
  TERMS_LAST_UPDATED,
} from '../../datas/legalDatas'

export default function PublicTerms() {
  return (
    <PublicPageLayout
      title="Terms & Conditions"
      revision={`Last revised ${TERMS_LAST_UPDATED}`}
      navProps={{ showThemeToggle: false, showInstall: false }}
    >
      <LegalSections
        sections={TERMS_SECTIONS}
      />
    </PublicPageLayout>
  )
}