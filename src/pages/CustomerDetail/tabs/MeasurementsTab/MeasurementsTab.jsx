import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTour } from '../../../../contexts/TourContext'
import { useUsage } from '../../../../contexts/UsageContext'
import { EmptyState } from './components/EmptyState/EmptyState'
import { MeasurementRow } from './components/MeasurementRow/MeasurementRow'
import { MeasurementDetailsModal } from './components/MeasurementDetailsModal/MeasurementDetailsModal'
import { MeasurementRowSkeleton } from './components/MeasurementRowSkeleton/MeasurementRowSkeleton'
import { AddMeasurementModal } from './components/AddMeasurementModal/AddMeasurementModal'
import { UpgradeSheet } from '../../../../components/UpgradeSheet/UpgradeSheet'
import { groupMeasurementsByDate } from './utils'
import ConfirmSheet from '../../../../components/ConfirmSheet/ConfirmSheet'
import styles from './MeasurementsTab.module.css'


const NEAR_LIMIT_THRESHOLD = 3


export default function MeasurementsTab({ measurements, loading, gender, onSave, onUpdate, onDelete, showToast }) {
  const navigate = useNavigate()
  const { completeStep, currentStep, pendingViewItemId, pauseTour, resumeTour } = useTour()
  const { hasReachedLimit, remaining, limits } = useUsage()

  const [isAddModalOpen,      setIsAddModalOpen]      = useState(false)
  const [upgradeOpen,         setUpgradeOpen]         = useState(false)
  const [selectedMeasurement, setSelectedMeasurement] = useState(null)
  const [measurementToDelete, setMeasurementToDelete] = useState(null)

  const remainingMeasurements = remaining('measurementsPerMonth', 'measurementsPerMonth')
  const atLimit                = hasReachedLimit('measurementsPerMonth', 'measurementsPerMonth')

  useEffect(() => {
    const handleOpenAddModal = () => {
      if (atLimit) {
        setUpgradeOpen(true)
        return
      }
      setIsAddModalOpen(true)
    }
    document.addEventListener('openAddMeasurementModal', handleOpenAddModal)
    return () => document.removeEventListener('openAddMeasurementModal', handleOpenAddModal)
  }, [atLimit])

  useEffect(() => {
    if (!isAddModalOpen) return
    pauseTour()
    return () => resumeTour()
  }, [isAddModalOpen, pauseTour, resumeTour])

  useEffect(() => {
    if (!selectedMeasurement) return
    pauseTour()
    return () => resumeTour()
  }, [selectedMeasurement, pauseTour, resumeTour])

  async function handleSave(entry) {
    try {
      const newId = await onSave(entry)
      const remainingAfterSave = remainingMeasurements - 1
      const nearLimitAfterSave = remainingAfterSave > 0 && remainingAfterSave <= NEAR_LIMIT_THRESHOLD
      showToast(
        nearLimitAfterSave
          ? `Measurement saved ✓ · ${remainingAfterSave} left this month`
          : 'Measurement saved ✓'
      )
      setIsAddModalOpen(false)
      completeStep('add-measurement', { itemId: newId ? String(newId) : null })
    } catch (err) {
      if (err?.code === 'limit-reached') {
        setIsAddModalOpen(false)
        setUpgradeOpen(true)
        return
      }
      showToast('Failed to save measurement.')
    }
  }

  function handleUpdate(measurementId, updatedData) {
    onUpdate(measurementId, updatedData)
    showToast('Measurement updated ✓')
  }

  function handleCardTap(measurement) {
    if (
      currentStep?.id === 'view-new-measurement' &&
      String(measurement.clientId ?? measurement.id) === pendingViewItemId
    ) {
      completeStep('view-new-measurement')
    }
    setSelectedMeasurement(measurement)
  }

  function handleRequestDelete(measurement) {
    setSelectedMeasurement(null)
    setMeasurementToDelete(measurement)
  }

  function handleDeleteConfirm() {
    if (!measurementToDelete) return
    const target = measurementToDelete
    setMeasurementToDelete(null)
    onDelete(target)
    showToast('Measurement deleted')
  }

  function handleDeleteCancel() {
    setMeasurementToDelete(null)
  }

  function goToUpgrade() {
    navigate('/account', { state: { autoOpenModal: 'upgrade' } })
  }

  function handleUpgrade() {
    setUpgradeOpen(false)
    goToUpgrade()
  }

  if (loading) {
    return (
      <div className={styles.measurementGroup}>
        {[1, 2, 3].map(i => <MeasurementRowSkeleton key={i} />)}
      </div>
    )
  }

  const measurementsByDate = groupMeasurementsByDate(measurements)

  return (
    <div>
      {measurements.length === 0 ? (
        <EmptyState />
      ) : (
        Object.entries(measurementsByDate).map(([date, measurementsInGroup]) => (
          <div key={date} className={styles.measurementGroup}>
            <div className={styles.measurementGroupDate}>{date}</div>
            <div className={styles.measurementGroupDivider} />
            {measurementsInGroup.map((measurement, index) => (
              <div
                key={measurement.id ?? index}
                data-tour={String(measurement.clientId ?? measurement.id) === pendingViewItemId ? 'new-measurement-row' : undefined}
              >
                <MeasurementRow
                  measurement={measurement}
                  measurementsInGroup={measurementsInGroup}
                  index={index}
                  onTap={handleCardTap}
                  onDelete={handleRequestDelete}
                />
              </div>
            ))}
          </div>
        ))
      )}

      <AddMeasurementModal
        isOpen={isAddModalOpen}
        gender={gender}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
      />

      <UpgradeSheet
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onUpgrade={handleUpgrade}
        icon="straighten"
        title="Measurement limit reached"
        message={`You've hit the free plan limit of ${limits.measurementsPerMonth} measurement records this month. Upgrade to Premium for unlimited measurements.`}
      />

      {selectedMeasurement && (
        <MeasurementDetailsModal
          measurement={selectedMeasurement}
          onClose={() => setSelectedMeasurement(null)}
          onDelete={() => handleRequestDelete(selectedMeasurement)}
          onUpdate={handleUpdate}
        />
      )}

      <ConfirmSheet
        open={!!measurementToDelete}
        title="Delete Measurement?"
        message="This can't be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}
