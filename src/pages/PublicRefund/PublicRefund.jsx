import PublicPageLayout from '../LandingPage/components/PublicPageLayout/PublicPageLayout'
import LegalSections from '../LandingPage/components/LegalSections/LegalSections'
import {
  REFUND_SECTIONS,
  REFUND_LAST_UPDATED,
} from '../../datas/legalDatas'

export default function PublicRefund() {
  return (
    <PublicPageLayout
      title="Refund Policy"
      subtitle={`Last updated: ${REFUND_LAST_UPDATED}`}
    >
      <LegalSections
        sections={REFUND_SECTIONS}
      />
    </PublicPageLayout>
  )
}