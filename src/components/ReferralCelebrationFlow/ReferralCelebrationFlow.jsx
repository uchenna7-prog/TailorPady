import { useState, useEffect } from 'react'
import { useReferral } from '../../contexts/ReferralContext'
import { usePremium } from '../../contexts/PremiumContext'
import { usePremiumSuccess } from '../../contexts/PremiumSuccessContext'
import ReferralRewardModal from '../ReferralRewardModal/ReferralRewardModal'

export default function ReferralCelebrationFlow() {
  const { pendingReferralReward, acknowledgeReferralReward } = useReferral()
  const { billingCycle, nextRenewal } = usePremium()
  const { triggerPremiumSuccess } = usePremiumSuccess()

  const [activeReward, setActiveReward] = useState(null)
  const [rewardModalOpen, setRewardModalOpen] = useState(false)

  useEffect(() => {
    if (pendingReferralReward && !activeReward) {
      setActiveReward(pendingReferralReward)
      setRewardModalOpen(true)
    }
  }, [pendingReferralReward, activeReward])

  const handleRewardContinue = () => {
    const reward = activeReward
    setRewardModalOpen(false)
    acknowledgeReferralReward(reward.id)
    triggerPremiumSuccess({ billingCycle, nextRenewal }, () => setActiveReward(null))
  }

  if (!rewardModalOpen || !activeReward) return null

  return (
    <ReferralRewardModal
      contributingNames={activeReward.contributingNames}
      rewardDays={activeReward.rewardDays}
      onContinue={handleRewardContinue}
    />
  )
}
