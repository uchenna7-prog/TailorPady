import notificationsImage from '../../assets/onboarding/onboarding-notifications.webp'
import roleOwnerImage from '../../assets/onboarding/role-owner.webp'
import roleWorkerImage from '../../assets/onboarding/role-worker.webp'
import ordersSlide from '../../assets/onboarding/onboarding-orders.webp'
import customersSlide from '../../assets/onboarding/onboarding-customers.webp'

const UPCOMING_STEP_IMAGES = [
  ordersSlide,
  customersSlide,
  notificationsImage,
  roleOwnerImage,
  roleWorkerImage,
]

let preloaded = false

export function preloadUpcomingStepImages() {
  if (preloaded) return
  preloaded = true
  UPCOMING_STEP_IMAGES.forEach(src => {
    const img = new Image()
    img.src = src
  })
}
