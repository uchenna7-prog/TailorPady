import { useState, useEffect, useRef } from 'react'
import { useTour } from '../../../../contexts/TourContext'
import { useFirstItemHint } from '../../../../hooks/useFirstItemHint'
import { FirstItemHint } from '../../../../components/FirstItemHint/FirstItemHint'
import { EmptyState }                    from './components/EmptyState/EmptyState'
import { MeasurementRow }                from './components/MeasurementRow/MeasurementRow'
import { MeasurementDetailsModal }       from './components/MeasurementDetailsModal/MeasurementDetailsModal'
import { MeasurementRowSkeleton }        from './components/MeasurementRowSkeleton/MeasurementRowSkeleton'
import { AddMeasurementModal }           from './components/AddMeasurementModal/AddMeasurementModal'
import { groupMeasurementsByDate }       from './utils'
import ConfirmSheet                      from '../../../../components/ConfirmSheet/ConfirmSheet'
import styles                            from './MeasurementsTab.module.css'

export default function MeasurementsTab({ measurements, loading, gender, onSave, onUpdate, onDelete, showToast }) {
  const { completeStep, pauseTour, resumeTour } = useTour()
  const [hintSeen, markHintSeen] = useFirstItemHint('measurement')
  const firstRowRef = useRef(null)

  const [isAddModalOpen,      setIsAddModalOpen]      = useState(false)
  const [selectedMeasurement, setSelectedMeasurement] = useState(null)
  const [measurementToDelete, setMeasurementToDelete] = useState(null)

  useEffect(() => {
    const handleOpenAddModal = () => setIsAddModalOpen(true)
    document.addEventListener('openAddMeasurementModal', handleOpenAddModal)
    return () => document.removeEventListener('openAddMeasurementModal', handleOpenAddModal)
  }, [])

  useEffect(() => {
    if (!isAddModalOpen) return
    pauseTour()
    return () => resumeTour()
  }, [isAddModalOpen, pauseTour, resumeTour])

  function handleSave(entry) {
    onSave(entry)
    showToast('Measurement saved ✓')
    setIsAddModalOpen(false)
    completeStep('add-measurement')
  }

  function handleUpdate(measurementId, updatedData) {
    onUpdate(measurementId, updatedData)
    showToast('Measurement updated ✓')
  }

  function handleCardTap(measurement) {
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

  if (loading) {
    return (
      <div className={styles.measurementGroup}>
        {[1, 2, 3].map(i => <MeasurementRowSkeleton key={i} />)}
      </div>
    )
  }

  const measurementsByDate = groupMeasurementsByDate(measurements)
  const showFirstItemHint  = measurements.length === 1 && !hintSeen
  let renderedFirstRow = false

  return (
    <div>
      {measurements.length === 0 ? (
        <EmptyState />
      ) : (
        Object.entries(measurementsByDate).map(([date, measurementsInGroup]) => (
          <div key={date} className={styles.measurementGroup}>
            <div className={styles.measurementGroupDate}>{date}</div>
            <div className={styles.measurementGroupDivider} />
            {measurementsInGroup.map((measurement, index) => {
              const isFirstOverall = showFirstItemHint && !renderedFirstRow
              if (isFirstOverall) renderedFirstRow = true
              return (
                <div key={measurement.id ?? index} ref={isFirstOverall ? firstRowRef : undefined}>
                  <MeasurementRow
                    measurement={measurement}
                    measurementsInGroup={measurementsInGroup}
                    index={index}
                    onTap={handleCardTap}
                    onDelete={handleRequestDelete}
                  />
                </div>
              )
            })}
          </div>
        ))
      )}

      <AddMeasurementModal
        isOpen={isAddModalOpen}
        gender={gender}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
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

      {showFirstItemHint && (
        <FirstItemHint
          targetRef={firstRowRef}
          message="Tap to view details"
          onDismiss={markHintSeen}
        />
      )}
    </div>
  )
}