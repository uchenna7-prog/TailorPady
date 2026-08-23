import notificationsImage from '../../assets/onboarding/onboarding-notifications.webp'
import roleOwnerImage from '../../assets/onboarding/role-owner.webp'
import roleWorkerImage from '../../assets/onboarding/role-worker.webp'
import ordersSlide from '../../assets/onboarding/onboarding-orders.webp'
import customersSlide from '../../assets/onboarding/onboarding-customers.webp'

const NEAR_TERM_IMAGES = [ordersSlide, customersSlide]
const LATER_IMAGES = [notificationsImage, roleOwnerImage, roleWorkerImage]

let preloaded = false

function loadImage(src, priority) {
  const img = new Image()
  img.fetchPriority = priority
  img.src = src
}

export function preloadUpcomingStepImages() {
  if (preloaded) return
  preloaded = true

  const run = () => {
    NEAR_TERM_IMAGES.forEach(src => loadImage(src, 'high'))
    LATER_IMAGES.forEach(src => loadImage(src, 'low'))
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 2000 })
  } else {
    setTimeout(run, 200)
  }
}
