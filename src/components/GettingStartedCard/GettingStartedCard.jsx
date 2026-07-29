import { useTour } from '../../../../contexts/TourContext'
import { TRACKS } from '../../../../datas/tourSteps'
import styles from './GettingStartedCard.module.css'

export function GettingStartedCard() {
  const { startTour, hasCompletedTour, isActive } = useTour()

  const availableTracks = TRACKS.filter(t => t.available)
  const completedCount  = availableTracks.filter(t => hasCompletedTour(t.id)).length

  if (completedCount === availableTracks.length) return null

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Getting Started</span>
        <span className={styles.progress}>{completedCount}/{availableTracks.length}</span>
      </div>

      <div className={styles.list}>
        {TRACKS.map(track => {
          const done = hasCompletedTour(track.id)
          return (
            <button
              key={track.id}
              className={`${styles.row} ${done ? styles.rowDone : ''} ${!track.available ? styles.rowDisabled : ''}`}
              disabled={!track.available || isActive}
              onClick={() => startTour(track.id)}
            >
              <span className={`mi ${styles.rowIcon}`}>
                {done ? 'check_circle' : track.available ? 'radio_button_unchecked' : 'lock_outline'}
              </span>
              <span className={styles.rowLabel}>{track.label}</span>
              {track.available && !done && (
                <span className={`mi ${styles.rowChevron}`}>chevron_right</span>
              )}
              {!track.available && <span className={styles.soon}>Soon</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}


