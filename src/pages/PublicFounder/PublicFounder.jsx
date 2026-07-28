import PublicPageLayout from '../LandingPage/components/PublicPageLayout/PublicPageLayout'
import FounderSection from '../LandingPage/components/FounderSection/FounderSection'

export default function PublicFounder() {
  return (
    <PublicPageLayout
      eyebrow="Meet the Founder"
      title="About the Founder"
      navProps={{ showThemeToggle: false, showInstall: false }}
    >
      <FounderSection />
    </PublicPageLayout>
  )
}
